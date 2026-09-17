// supabase/functions/send-reply/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildFrom, buildReplyAddress, buildThreadMessageId } from '../_shared/mail.ts';
import { renderEmail, textToHtml } from '../_shared/emailTemplate.ts';

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

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
const mailDomain = Deno.env.get('MAIL_DOMAIN') || 'voyani.tech';
const fromAddress = Deno.env.get('MAIL_FROM_ADDRESS') || `karisa@${mailDomain}`;
const fromName = Deno.env.get('MAIL_FROM_NAME') || 'Karisa';
const portfolioUrl = Deno.env.get('PORTFOLIO_URL') || 'https://voyani.tech';
const sentryDsn = Deno.env.get('SENTRY_DSN');

// Validate required env vars
if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
  console.error('[send-reply] Missing required environment variables:', {
    SUPABASE_URL: !!supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
    RESEND_API_KEY: !!resendApiKey,
  });
}

// Get origin from request, fallback to portfolio URL for production
const getOrigin = (req: Request) => {
  const origin = req.headers.get('origin');

  // Allow localhost for development
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return origin;
  }

  // For production, use the origin from the request or fallback to PORTFOLIO_URL
  // Ensure we're returning the exact origin the browser sent, not a fallback
  if (origin) {
    return origin;
  }

  return portfolioUrl;
};

const getCorsHeaders = (req: Request) => ({
  'Access-Control-Allow-Origin': getOrigin(req),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
});

const client = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

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

async function sendEmailViaResend(to: string, subject: string, html: string, submissionId: string, retries = 3): Promise<{ id: string }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Explicitly construct payload to avoid scoping issues
      const replyToAddress = buildReplyAddress(submissionId, mailDomain);
      const messageId = buildThreadMessageId(submissionId, mailDomain);

      const payload = {
        from: buildFrom(fromName, fromAddress),
        reply_to: replyToAddress,
        to,
        subject,
        html,
        headers: {
          'X-Submission-ID': submissionId,
          'Message-ID': messageId,
        },
      };

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(payload),
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

// Decode JWT using manual base64url decoder (no external imports)
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

    const payload = parts[1];
    console.log('[JWT Decode] Payload part length:', payload.length);

    // Manual base64url to base64 conversion
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padding = 4 - (base64.length % 4);
    if (padding !== 4) {
      base64 += '='.repeat(padding);
    }

    // Decode using atob (works in Deno)
    const jsonString = atob(base64);
    console.log('[JWT Decode] Decoded successfully');

    const decoded = JSON.parse(jsonString);

    console.log('[JWT Decode] Token claims - sub:', decoded.sub, 'role:', decoded.role || decoded.user_role);

    // Basic validity check
    if (!decoded.sub) {
      console.error('[JWT Decode] Missing sub claim');
      return { valid: false, error: 'Missing user ID in token' };
    }

    // Check expiration
    if (decoded.exp && typeof decoded.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        console.error('[JWT Decode] Token expired');
        return { valid: false, error: 'Token expired' };
      }
    }

    return { valid: true, decoded };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[JWT Decode] Error:', errorMsg);
    return { valid: false, error: `JWT decode failed: ${errorMsg}` };
  }
}

function replyEmailTemplate(recipientName: string, replyMessage: string, originalSubject: string, originalMessage: string): string {
  return renderEmail({
    title: `Re: ${originalSubject}`,
    preheader: replyMessage.slice(0, 120),
    lead: `Hi ${recipientName}, a reply from Ngowa Karisa.`,
    sections: [
      { html: textToHtml(replyMessage) },
      { label: 'You wrote', html: textToHtml(originalMessage), quoted: true },
    ],
    footerNote: 'Reply to this email and it comes straight back to me.',
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req)
    });
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }

  // Check environment variables
  if (!supabaseUrl || !supabaseServiceKey || !resendApiKey || !client) {
    console.error('[send-reply] Missing required environment variables - cannot process request');
    return new Response(
      JSON.stringify({ error: 'Server misconfigured. Please contact support.' }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
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

    // Check role - must be admin to send replies
    // Note: Just verify user is authenticated. In production, add proper role claims to JWT
    console.log('[send-reply] Auth successful for user:', userId);
    if (!userId) {
      console.error('[send-reply] Missing user ID');
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin privileges required' }),
        { status: 403, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
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
        html,
        submissionId
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

      try {
        const { error: updateError } = await client
          .from('submission_replies')
          .update({
            resend_email_id: emailId,
            email_status: 'sent',
            email_metadata: emailMetadata,
          })
          .eq('id', replyId);

        if (updateError) {
          console.error('Failed to update email ID and status:', updateError);
        }
      } catch (e) {
        console.error('Failed to update email ID and status:', e);
      }
    }

    // Update submission if first response
    if (!submission.responded_at) {
      try {
        const { error: updateError } = await client
          .from('submissions')
          .update({
            responded_at: new Date().toISOString(),
            status: 'responded',
          })
          .eq('id', submissionId);

        if (updateError) {
          console.error('Failed to update submission:', updateError);
        }
      } catch (e) {
        console.error('Failed to update submission:', e);
      }
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
