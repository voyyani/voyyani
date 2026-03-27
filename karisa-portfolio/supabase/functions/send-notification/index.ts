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
  const requestOrigin = req.headers.get('origin');

  if (!requestOrigin) return portfolioUrl;

  // Allow localhost for development
  if (requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1')) {
    return requestOrigin;
  }

  // For production, verify it's a valid production domain
  // Allow voyani.tech and www.voyani.tech
  if (requestOrigin.includes('voyani.tech')) {
    return requestOrigin;
  }

  // Fallback to portfolio URL
  return portfolioUrl;
};

const getCorsHeaders = (req: Request) => {
  const origin = getOrigin(req);
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Max-Age': '3600',
  };
};

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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0a0f1a;
      color: #e2e8f0;
      line-height: 1.6;
    }
    .wrapper { background: linear-gradient(135deg, #0a1929 0%, #061220 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #005792 0%, #61DAFB 100%);
      padding: 40px 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 10px 25px rgba(0, 87, 146, 0.2);
      position: relative;
      border-top: 3px solid #D4A017;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
    }
    .content {
      background: #0f1f35;
      padding: 30px;
      border-bottom: 1px solid #334155;
    }
    .section { margin-bottom: 28px; }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #D4A017;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 1px solid #D4A017;
    }
    .sender-info {
      background: linear-gradient(135deg, #061220 0%, #0a2845 100%);
      border-left: 4px solid #D4A017;
      padding: 16px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .info-row {
      margin: 10px 0;
      font-size: 14px;
    }
    .info-label {
      font-weight: 700;
      color: #61DAFB;
      display: inline-block;
      min-width: 70px;
    }
    .info-row a {
      color: #61DAFB;
      text-decoration: none;
      border-bottom: 1px solid #61DAFB;
    }
    .info-row a:hover {
      color: #ffffff;
    }
    .message-section {
      background: linear-gradient(135deg, rgba(97, 218, 251, 0.05) 0%, rgba(212, 160, 23, 0.05) 100%);
      border: 1px solid #334155;
      border-left: 4px solid #61DAFB;
      padding: 20px;
      border-radius: 6px;
      white-space: pre-wrap;
      overflow-x: auto;
      font-size: 14px;
      color: #cbd5e1;
      line-height: 1.7;
    }
    .cta-container {
      text-align: center;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #005792 0%, #003d5c 100%);
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      border-radius: 6px;
      font-size: 14px;
      border: 1px solid #61DAFB;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 87, 146, 0.3);
    }
    .button:hover {
      background: linear-gradient(135deg, #61DAFB 0%, #005792 100%);
      box-shadow: 0 6px 16px rgba(97, 218, 251, 0.4);
    }
    .footer {
      background: #061220;
      border-top: 1px solid #334155;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-radius: 0 0 12px 12px;
    }
    .gold-accent { color: #D4A017; }
    @media (max-width: 600px) {
      .container { width: 100%; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 24px; }
      .content { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>📨 New Portfolio Inquiry</h1>
        <p>A connection opportunity awaits</p>
      </div>
      <div class="content">
        <div class="section">
          <div class="section-title">📋 Sender Information</div>
          <div class="sender-info">
            <div class="info-row"><span class="info-label">Name:</span> ${escapeHtml(senderName)}</div>
            <div class="info-row"><span class="info-label">Email:</span> <a href="mailto:${escapeHtml(senderEmail)}">${escapeHtml(senderEmail)}</a></div>
            ${phone ? `<div class="info-row"><span class="info-label">Phone:</span> <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></div>` : ''}
            <div class="info-row"><span class="info-label">Subject:</span> <span class="gold-accent">${escapeHtml(subject)}</span></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">💬 Message</div>
          <div class="message-section">${escapeHtml(message)}</div>
        </div>
        <div class="cta-container">
          <a href="${dashboardUrl}" class="button">→ Reply in Dashboard</a>
        </div>
      </div>
      <div class="footer">
        <p>This is an automated message from your <strong>Karisa Voyani</strong> portfolio. <span class="gold-accent">Engineering Precision • African Innovation • Modern Tech</span></p>
      </div>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0a0f1a;
      color: #e2e8f0;
      line-height: 1.6;
    }
    .wrapper { background: linear-gradient(135deg, #0a1929 0%, #061220 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #D4A017 0%, #B8860B 100%);
      padding: 40px 30px;
      text-align: center;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 10px 25px rgba(212, 160, 23, 0.2);
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0a1929;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      color: rgba(10, 25, 41, 0.9);
    }
    .content {
      background: #0f1f35;
      padding: 30px;
      border-bottom: 1px solid #334155;
    }
    .greeting { margin-bottom: 24px; }
    .greeting p { font-size: 16px; color: #e2e8f0; margin-bottom: 16px; }
    .highlight {
      background: linear-gradient(135deg, rgba(97, 218, 251, 0.1) 0%, rgba(0, 87, 146, 0.1) 100%);
      border-left: 4px solid #61DAFB;
      padding: 16px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .highlight-title { color: #61DAFB; font-weight: 700; margin-bottom: 8px; font-size: 14px; }
    .highlight-content { color: #cbd5e1; font-size: 14px; }
    .subject-badge {
      display: inline-block;
      background: #005792;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 600;
      margin-top: 12px;
      border: 1px solid #61DAFB;
    }
    .cta-text {
      text-align: center;
      margin: 28px 0;
      font-size: 14px;
      color: #94a3b8;
    }
    .footer {
      background: #061220;
      border-top: 1px solid #334155;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-radius: 0 0 12px 12px;
    }
    .footer-accent { color: #D4A017; font-weight: 700; }
    @media (max-width: 600px) {
      .container { width: 100%; }
      .header { padding: 30px 20px; }
      .header h1 { font-size: 24px; }
      .content { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>✓ Message Received</h1>
        <p>Thank you for connecting with us</p>
      </div>
      <div class="content">
        <div class="greeting">
          <p>Hi <strong>${escapeHtml(senderName)}</strong>,</p>
          <p>Thank you for reaching out! Your message has been successfully received and is now in our system.</p>
        </div>
        <div class="highlight">
          <div class="highlight-title">📍 Your Message Details</div>
          <div class="highlight-content">
            We're reviewing your inquiry with care. Our response team typically replies within <strong>24-48 hours</strong>. We look forward to discussing opportunities with you!
            <div class="subject-badge">Subject: ${escapeHtml(subject)}</div>
          </div>
        </div>
        <div class="cta-text">
          <p>In the meantime, feel free to explore more about <strong>Karisa's work</strong> and expertise on the portfolio.</p>
        </div>
        <div style="text-align: center; margin-top: 24px; padding: 16px; background: rgba(212, 160, 23, 0.05); border-radius: 6px; border-left: 4px solid #D4A017;">
          <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 8px;">Engineering Precision • African Innovation • Modern Tech</p>
          <p style="font-size: 13px; color: #61DAFB;">Thank you for your interest!</p>
        </div>
      </div>
      <div class="footer">
        <p>This is an automated confirmation from <span class="footer-accent">Karisa Voyani's Portfolio</span></p>
        <p style="margin-top: 8px;">Questions? Reply to this email or visit the portfolio.</p>
      </div>
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
