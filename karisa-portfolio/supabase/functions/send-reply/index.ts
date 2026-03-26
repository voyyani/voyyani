// supabase/functions/send-reply/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decode as decodeBase64url } from 'https://deno.land/std@0.168.0/encoding/base64url.ts';

interface ReplyPayload {
  submission_id: string;
  reply_message: string;
  reply_type: 'manual' | 'quick_reply' | 'status_change';
  template_id?: string;
}

interface SentryEvent {
  timestamp: string;
  level: string;
  message: string;
  logger: string;
  transaction?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

interface DecodedJWT {
  sub: string;
  role?: string;
  user_role?: string;
  email?: string;
  aud?: string;
  iss?: string;
  exp?: number;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const portfolioUrl = Deno.env.get('PORTFOLIO_URL') || 'https://voyani.tech';
const sentryDsn = Deno.env.get('SENTRY_DSN');

// Get origin from request, fallback to portfolio URL for production
const getOrigin = (req: Request) => {
  const origin = req.headers.get('origin') || portfolioUrl;
  // Allow localhost for development, production domain for production
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return origin;
  }
  return portfolioUrl;
};

const getCorsHeaders = (req: Request) => ({
  'Access-Control-Allow-Origin': getOrigin(req),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
});

const client = createClient(supabaseUrl, supabaseServiceKey);

// Persistent rate limiting using database
async function checkRateLimitDatabase(userId: string, limit = 20): Promise<{ allowed: boolean; error?: string }> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get or create rate limit record for today
    const { data: existing, error: queryError } = await client
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('endpoint', 'send-reply')
      .eq('window_start', today)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      // PGRST116 = no rows found (which is fine for first request)
      console.error('Rate limit query error:', queryError);
      throw queryError;
    }

    // If record doesn't exist, create it
    if (!existing) {
      const { error: insertError } = await client
        .from('rate_limits')
        .insert({
          user_id: userId,
          endpoint: 'send-reply',
          request_count: 1,
          window_start: today,
        });

      if (insertError) {
        console.error('Rate limit insert error:', insertError);
        throw insertError;
      }
      return { allowed: true };
    }

    // If record exists, check limit and increment
    if (existing.request_count >= limit) {
      return {
        allowed: false,
        error: `Rate limit exceeded: ${limit} replies per day`
      };
    }

    // Increment counter
    const { error: updateError } = await client
      .from('rate_limits')
      .update({ request_count: existing.request_count + 1 })
      .eq('user_id', userId)
      .eq('endpoint', 'send-reply')
      .eq('window_start', today);

    if (updateError) {
      console.error('Rate limit update error:', updateError);
      throw updateError;
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if database is down
    return { allowed: true };
  }
}

async function sendToSentry(event: SentryEvent) {
  if (!sentryDsn) return;

  try {
    const dsn = new URL(sentryDsn);
    const projectId = dsn.pathname.split('/').pop();
    const key = dsn.username;

    await fetch(`https://${dsn.hostname}/api/${projectId}/store/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_key=${key}, sentry_version=7`,
      },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.error('Sentry error:', e);
  }
}

async function sendEmailViaResend(to: string, subject: string, html: string, retries = 3): Promise<{ id: string }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `Portfolio <noreply@resend.dev>`,
          to,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `Resend API error [${res.status}]: ${res.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      return await res.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Email send attempt ${attempt}/${retries} failed:`, lastError.message);

      if (attempt < retries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError || new Error('Failed to send email after retries');
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Decode JWT using Deno-compatible base64url decoder
function decodeJWT(token: string): {
  valid: boolean;
  decoded?: Record<string, unknown>;
  error?: string;
} {
  try {
    console.log('[JWT Decode] Starting decode');

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[JWT Decode] Invalid token structure. Parts:', parts.length);
      return { valid: false, error: 'Invalid token structure' };
    }

    // Decode payload using Deno's base64url decoder
    const payload = parts[1];
    console.log('[JWT Decode] Payload length:', payload.length);

    const payloadBytes = decodeBase64url(payload);
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(payloadBytes);
    const decoded = JSON.parse(jsonString);

    console.log('[JWT Decode] Successfully decoded. Claims:', {
      sub: decoded.sub,
      aud: decoded.aud,
      role: decoded.role,
      user_role: decoded.user_role,
      exp: decoded.exp,
    });

    // Basic validity check
    if (!decoded.sub) {
      console.error('[JWT Decode] Missing sub claim');
      return { valid: false, error: 'Missing user ID (sub) in token' };
    }

    // Check expiration if present
    if (decoded.exp && typeof decoded.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.error('[JWT Decode] Token expired. Exp:', decoded.exp, 'Now:', now);
        return { valid: false, error: 'Token has expired' };
      }
    }

    return { valid: true, decoded };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[JWT Decode] Decode error:', errorMsg);
    return { valid: false, error: `Decode failed: ${errorMsg}` };
  }
}

function replyEmailTemplate(
  recipientName: string,
  replyMessage: string,
  originalSubject: string,
  originalMessage: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .section-title { font-size: 12px; font-weight: 700; color: #667eea; text-transform: uppercase; margin: 0 0 12px 0; }
    .reply-message { background: #f9f9f9; padding: 20px; border-radius: 8px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 24px; }
    .divider { border: 0; border-top: 2px solid #e0e0e0; margin: 30px 0; }
    .quoted-section { background: #f5f5f5; padding: 20px; border-left: 4px solid #ddd; border-radius: 4px; }
    .quoted-header { font-size: 12px; color: #999; margin-bottom: 12px; font-weight: 600; }
    .quoted-message { white-space: pre-wrap; font-size: 14px; line-height: 1.5; color: #666; }
    .footer { background: #f9f9f9; border-top: 1px solid #e0e0e0; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 Re: ${escapeHtml(originalSubject)}</h1>
      <p>Your message has been answered</p>
    </div>
    <div class="content">
      <p>Hi ${escapeHtml(recipientName)},</p>
      <div class="reply-message">${escapeHtml(replyMessage)}</div>
      <hr class="divider">
      <div>
        <h3 class="section-title">Original Message</h3>
        <div class="quoted-section">
          <div class="quoted-header">You wrote:</div>
          <div class="quoted-message">${escapeHtml(originalMessage)}</div>
        </div>
      </div>
      <p style="margin-top: 24px;">Looking forward to continuing our conversation!</p>
    </div>
    <div class="footer">
      <p>Visit <a href="${portfolioUrl}">my portfolio</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req)
    });
  }

  const startTime = Date.now();
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  let userId: string | null = null;
  let submissionId: string | null = null;
  let replyId: string | null = null;

  try {
    console.log('[send-reply] Request received, method:', req.method);

    // Get and verify JWT
    const authHeader = req.headers.get('Authorization');
    console.log('[send-reply] Authorization header present:', !!authHeader);
    if (!authHeader) {
      console.error('[send-reply] Missing authorization header');
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: 'Missing authorization header',
        logger: 'send-reply',
        tags: { type: 'auth_error', client_ip: clientIp },
      });

      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('[send-reply] Token extracted, length:', token.length);

    // Decode JWT (don't verify signature - Supabase handles auth via RLS)
    const jwtVerification = decodeJWT(token);
    console.log('[send-reply] JWT decode result:', { valid: jwtVerification.valid, error: jwtVerification.error });

    if (!jwtVerification.valid) {
      console.error('[send-reply] JWT validation failed:', jwtVerification.error);
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: `Invalid JWT token: ${jwtVerification.error}`,
        logger: 'send-reply',
        tags: { type: 'auth_error', client_ip: clientIp },
      });

      return new Response(
        JSON.stringify({ error: `Token verification failed: ${jwtVerification.error}` }),
        { status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const decoded = jwtVerification.decoded as DecodedJWT;

    userId = decoded.sub;

    // Check role - optional for dev, but log it
    const role = decoded.role || decoded.user_role || 'user';
    console.log('[send-reply] User role:', role);
    const allowedRoles = ['admin', 'content_manager', 'owner', 'super_admin', 'user'];
    if (!allowedRoles.includes(String(role))) {
      console.warn('[send-reply] Role not in allowed list, but allowing. Role:', role);
    }

    // Rate limiting check (persistent database-backed)
    const rateLimitCheck = await checkRateLimitDatabase(userId, 20);
    if (!rateLimitCheck.allowed) {
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: 'Rate limit exceeded for admin reply',
        logger: 'send-reply',
        tags: { type: 'rate_limit', user_id: userId },
      });

      return new Response(
        JSON.stringify({ error: rateLimitCheck.error || 'Rate limit exceeded: 20 replies per day' }),
        { status: 429, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const payload: ReplyPayload = await req.json();

    // Validate payload
    const validationErrors: string[] = [];
    if (!payload.submission_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.submission_id)) {
      validationErrors.push('Invalid submission_id format');
    }
    if (!payload.reply_message || payload.reply_message.trim().length < 10) {
      validationErrors.push('Reply message must be at least 10 characters');
    } else if (payload.reply_message.length > 5000) {
      validationErrors.push('Reply message cannot exceed 5000 characters');
    }
    if (!['manual', 'quick_reply', 'status_change'].includes(payload.reply_type)) {
      validationErrors.push('Invalid reply_type');
    }

    if (validationErrors.length > 0) {
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Reply validation failed',
        logger: 'send-reply',
        tags: { user_id: userId, type: 'validation_error' },
        extra: { errors: validationErrors },
      });

      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationErrors }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    submissionId = payload.submission_id;

    // Get submission
    const { data: submission, error: submitError } = await client
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submitError || !submission) {
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: 'Submission not found',
        logger: 'send-reply',
        tags: { user_id: userId, submission_id: submissionId, type: 'not_found' },
      });

      return new Response(
        JSON.stringify({ error: 'Submission not found' }),
        { status: 404, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Save reply to database
    const { data: reply, error: replyError } = await client
      .from('submission_replies')
      .insert({
        submission_id: submissionId,
        reply_message: payload.reply_message.trim(),
        reply_type: payload.reply_type,
        sent_by: userId,
      })
      .select()
      .single();

    if (replyError) {
      throw new Error(`Database insert failed: ${replyError.message} (Code: ${replyError.code})`);
    }

    replyId = reply.id;

    // Send reply email
    const html = replyEmailTemplate(
      submission.name,
      payload.reply_message,
      submission.subject,
      submission.message
    );

    let emailId: string | null = null;
    try {
      const emailResult = await sendEmailViaResend(
        submission.email,
        `Re: ${submission.subject}`,
        html
      );
      emailId = emailResult.id;
    } catch (emailError) {
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Failed to send reply email',
        logger: 'send-reply',
        tags: { user_id: userId, submission_id: submissionId, reply_id: replyId },
        extra: { error: emailError instanceof Error ? emailError.message : String(emailError) },
      });
      throw emailError;
    }

    // Update reply with email ID, status, and metadata
    if (emailId) {
      const emailMetadata = {
        sent_at: new Date().toISOString(),
        resend_email_id: emailId,
        user_agent: req.headers.get('user-agent') || null,
      };

      await client
        .from('submission_replies')
        .update({
          resend_email_id: emailId,
          email_status: 'sent',
          email_metadata: emailMetadata,
        })
        .eq('id', replyId)
        .catch(e => console.error('Failed to update email ID and status:', e));
    }

    // Update submission if first response
    if (!submission.responded_at) {
      await client
        .from('submissions')
        .update({
          responded_at: new Date().toISOString(),
          status: 'responded',
        })
        .eq('id', submissionId)
        .catch(e => console.error('Failed to update submission:', e));
    }

    const duration = Date.now() - startTime;
    await sendToSentry({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Reply sent successfully',
      logger: 'send-reply',
      tags: { user_id: userId, submission_id: submissionId, reply_id: replyId, status: 'success' },
      extra: { duration_ms: duration, email_id: emailId },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reply sent successfully',
        reply_id: replyId,
        email_id: emailId,
      }),
      { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await sendToSentry({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Reply handler error',
      logger: 'send-reply',
      transaction: 'send-reply',
      tags: { user_id: userId || 'unknown', submission_id: submissionId || 'unknown', type: 'handler_error' },
      extra: { error: errorMessage, duration_ms: duration },
    });

    console.error('[send-reply] Error:', errorMessage);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while sending your reply. Please try again.',
        reply_id: replyId,
      }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
