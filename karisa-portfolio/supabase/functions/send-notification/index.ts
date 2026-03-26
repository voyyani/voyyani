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
  csrf_token?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'voyanitech@gmail.com';
const portfolioUrl = Deno.env.get('PORTFOLIO_URL') || 'https://voyani.tech';
const dashboardUrl = Deno.env.get('DASHBOARD_URL') || `${portfolioUrl}/admin/submissions`;

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
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
});

const client = createClient(supabaseUrl, supabaseServiceKey);

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
      <p><strong>Warm regards,</strong><br/>Karisa</p>
    </div>
    <div class="footer">
      <p>This is an automated confirmation message</p>
    </div>
  </div>
</body>
</html>
  `;
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
          from: 'Karisa <karisa@voyani.tech>',
          to,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(errorData)}`);
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

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  const startTime = Date.now();

  try {
    const payload: NotificationPayload = await req.json();

    // Validation
    const validationErrors: string[] = [];
    if (!payload.name || payload.name.trim().length < 2) validationErrors.push('Name must be at least 2 characters');
    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) validationErrors.push('Invalid email format');
    if (!payload.subject || payload.subject.trim().length < 2) validationErrors.push('Subject is required');
    if (!payload.message || payload.message.trim().length < 10) validationErrors.push('Message must be at least 10 characters');

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationErrors }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
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
      console.error('Database error:', dbError);
      throw new Error(`Database insert failed: ${dbError.message}`);
    }

    // Send admin notification to voyanitech@gmail.com
    if (resendApiKey) {
      const adminHtml = submissionEmailTemplate(
        payload.name,
        payload.email,
        payload.phone,
        payload.subject,
        payload.message
      );

      try {
        await sendEmailViaResend(
          adminEmail,
          `New Portfolio Inquiry: ${payload.subject}`,
          adminHtml
        );
        console.log(`[send-notification] Admin email sent to ${adminEmail}`);
      } catch (emailError) {
        console.error('Admin email error:', emailError instanceof Error ? emailError.message : emailError);
      }
    }

    // Send confirmation to user
    if (resendApiKey) {
      const confirmationHtml = confirmationEmailTemplate(payload.name, payload.subject);

      try {
        await sendEmailViaResend(
          payload.email,
          `We received your message: ${payload.subject}`,
          confirmationHtml
        );
        console.log(`[send-notification] Confirmation email sent to ${payload.email}`);
      } catch (emailError) {
        console.error('User email error:', emailError instanceof Error ? emailError.message : emailError);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[send-notification] Success (${duration}ms) - submission: ${submission.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Submission received',
        submission_id: submission.id,
      }),
      { status: 200, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[send-notification] Error (${duration}ms):`, errorMessage);

    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your submission. Please try again.',
      }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
