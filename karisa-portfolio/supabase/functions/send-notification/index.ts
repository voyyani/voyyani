// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const adminEmail = Deno.env.get('ADMIN_EMAIL')!;
const portfolioUrl = Deno.env.get('PORTFOLIO_URL') || 'https://yourportfolio.com';
const dashboardUrl = Deno.env.get('DASHBOARD_URL') || `${portfolioUrl}/admin/submissions`;

const client = createClient(supabaseUrl, supabaseServiceKey);

async function sendEmailViaResend(to: string, subject: string, html: string) {
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
    throw new Error(`Resend API error: ${res.statusText}`);
  }

  return res.json();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

  try {
    const payload: NotificationPayload = await req.json();

    // Validate payload
    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to database
    const { data: submission, error: dbError } = await client
      .from('submissions')
      .insert({
        type: payload.type || 'contact',
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        subject: payload.subject,
        message: payload.message,
        status: 'new',
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Send admin notification
    const adminHtml = submissionEmailTemplate(
      payload.name,
      payload.email,
      payload.phone,
      payload.subject,
      payload.message
    );

    await sendEmailViaResend(
      adminEmail,
      `New Portfolio Inquiry: ${payload.subject}`,
      adminHtml
    );

    // Send confirmation to user
    const confirmationHtml = confirmationEmailTemplate(payload.name, payload.subject);

    await sendEmailViaResend(
      payload.email,
      `We received your message: ${payload.subject}`,
      confirmationHtml
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Submission received and emails sent',
        submission_id: submission.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
