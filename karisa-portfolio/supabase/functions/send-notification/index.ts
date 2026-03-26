// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface NotificationPayload {
  type: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
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

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const adminEmail = Deno.env.get('ADMIN_EMAIL')!;
const portfolioUrl = Deno.env.get('PORTFOLIO_URL') || 'https://voyani.tech';
const dashboardUrl = Deno.env.get('DASHBOARD_URL') || `${portfolioUrl}/admin/submissions`;
const sentryDsn = Deno.env.get('SENTRY_DSN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const client = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiting store (in-memory, per IP)
const rateLimitMap = new Map<string, Array<number>>();

function checkFormRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const thirtySeconds = 30 * 1000;
  const windowStart = now - thirtySeconds;

  if (!rateLimitMap.has(clientIp)) {
    rateLimitMap.set(clientIp, []);
  }

  const timestamps = rateLimitMap.get(clientIp)!;
  const recentRequests = timestamps.filter(t => t > windowStart);

  if (recentRequests.length >= 1) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(clientIp, recentRequests);
  return true;
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

async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
  retries = 3
): Promise<{ id: string }> {
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
          `Resend API error [${res.status}]: ${res.statusText}`
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

function submissionEmailTemplate(
  senderName: string,
  senderEmail: string,
  phone: string | undefined,
  subject: string,
  message: string
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
    .sender-info { background: #f9f9f9; border-left: 4px solid #667eea; padding: 16px; border-radius: 4px; margin-bottom: 20px; }
    .info-row { margin: 8px 0; }
    .info-label { font-weight: 600; color: #667eea; }
    .message-box { background: #f5f5f5; padding: 20px; border-radius: 8px; line-height: 1.6; white-space: pre-wrap; }
    .button { display: inline-block; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .button-primary { background: #667eea; color: white; }
    .footer { background: #f9f9f9; border-top: 1px solid #e0e0e0; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📨 New Portfolio Inquiry</h1>
      <p>Someone is interested in connecting with you</p>
    </div>
    <div class="content">
      <div>
        <h3 class="section-title">Sender Information</h3>
        <div class="sender-info">
          <div class="info-row"><span class="info-label">Name:</span> ${escapeHtml(senderName)}</div>
          <div class="info-row"><span class="info-label">Email:</span> <a href="mailto:${escapeHtml(senderEmail)}">${escapeHtml(senderEmail)}</a></div>
          ${phone ? `<div class="info-row"><span class="info-label">Phone:</span> <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></div>` : ''}
          <div class="info-row"><span class="info-label">Subject:</span> ${escapeHtml(subject)}</div>
        </div>
      </div>
      <div>
        <h3 class="section-title">Message</h3>
        <div class="message-box">${escapeHtml(message)}</div>
      </div>
      <div style="margin-top: 30px;">
        <a href="${dashboardUrl}" class="button button-primary">Reply in Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from your portfolio website.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function confirmationEmailTemplate(senderName: string, subject: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; line-height: 1.6; }
    .footer { background: #f9f9f9; border-top: 1px solid #e0e0e0; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Message Received</h1>
      <p>Thank you for reaching out!</p>
    </div>
    <div class="content">
      <p>Hi ${escapeHtml(senderName)},</p>
      <p>Thank you for your message! I've received your inquiry and will review it carefully. I aim to respond to all inquiries within 24-48 hours.</p>
      <p><strong>Your Subject:</strong> ${escapeHtml(subject)}</p>
      <p>Looking forward to connecting with you!</p>
      <p><strong>Warm regards</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated confirmation message</p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
  let submissionId: string | null = null;

  try {
    // Rate limiting check
    if (!checkFormRateLimit(clientIp)) {
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: 'Form submission rate limit exceeded',
        logger: 'send-notification',
        tags: { client_ip: clientIp, type: 'rate_limit' },
      });

      return new Response(
        JSON.stringify({ error: 'Too many submissions. Please wait 30 seconds before trying again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: NotificationPayload = await req.json();

    // Comprehensive validation
    const validationErrors: string[] = [];
    if (!payload.name || payload.name.trim().length < 2) validationErrors.push('Name must be at least 2 characters');
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) validationErrors.push('Invalid email format');
    if (!payload.subject || payload.subject.trim().length < 5) validationErrors.push('Subject must be at least 5 characters');
    if (!payload.message || payload.message.trim().length < 20) validationErrors.push('Message must be at least 20 characters');

    if (validationErrors.length > 0) {
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Form validation failed',
        logger: 'send-notification',
        tags: { type: 'validation_error' },
        extra: { errors: validationErrors },
      });

      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const { data: submission, error: dbError } = await client
      .from('submissions')
      .insert({
        type: payload.type || 'contact',
        name: payload.name.trim(),
        email: payload.email.toLowerCase().trim(),
        phone: payload.phone ? payload.phone.trim() : null,
        subject: payload.subject.trim(),
        message: payload.message.trim(),
        status: 'new',
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    submissionId = submission.id;

    // Send admin notification
    const adminHtml = submissionEmailTemplate(
      payload.name,
      payload.email,
      payload.phone,
      payload.subject,
      payload.message
    );

    let adminEmailId: string | null = null;
    try {
      const adminEmailResult = await sendEmailViaResend(
        adminEmail,
        `New Portfolio Inquiry: ${payload.subject}`,
        adminHtml
      );
      adminEmailId = adminEmailResult.id;
    } catch (emailError) {
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Failed to send admin notification email',
        logger: 'send-notification',
        tags: { submission_id: submissionId },
        extra: { error: emailError instanceof Error ? emailError.message : String(emailError) },
      });
      throw emailError;
    }

    // Send confirmation to user
    const confirmationHtml = confirmationEmailTemplate(payload.name, payload.subject);

    let userEmailId: string | null = null;
    try {
      const userEmailResult = await sendEmailViaResend(
        payload.email,
        `We received your message: ${payload.subject}`,
        confirmationHtml
      );
      userEmailId = userEmailResult.id;
    } catch (emailError) {
      await sendToSentry({
        timestamp: new Date().toISOString(),
        level: 'warning',
        message: 'Failed to send user confirmation email',
        logger: 'send-notification',
        tags: { submission_id: submissionId },
        extra: { error: emailError instanceof Error ? emailError.message : String(emailError) },
      });
    }

    const duration = Date.now() - startTime;
    await sendToSentry({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Form submission processed successfully',
      logger: 'send-notification',
      tags: { submission_id: submissionId, status: 'success' },
      extra: { duration_ms: duration, admin_email_id: adminEmailId, user_email_id: userEmailId },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Submission received and emails sent',
        submission_id: submissionId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    await sendToSentry({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: 'Form submission handler error',
      logger: 'send-notification',
      transaction: 'send-notification',
      tags: { submission_id: submissionId || 'unknown', type: 'handler_error' },
      extra: { error: errorMessage, duration_ms: duration },
    });

    console.error('[send-notification] Error:', errorMessage);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your submission. Please try again.',
        submission_id: submissionId,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
