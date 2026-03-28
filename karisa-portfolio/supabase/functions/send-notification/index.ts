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
  // African pattern SVG - matches homepage design
  const africanPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New Portfolio Inquiry: ${escapeHtml(subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Import Google Fonts - Rajdhani & Inter (matching homepage) */
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Inter:wght@300;400;500;600;700&display=swap');

    /* CSS Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #061220 0%, #0a1929 100%);
      color: #f0f0f0;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Typography matching homepage */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    /* Main wrapper with African pattern background */
    .wrapper {
      background: linear-gradient(135deg, #061220 0%, #0a1929 100%);
      background-image: url("${africanPattern}"), linear-gradient(135deg, #061220 0%, #0a1929 100%);
      background-size: 60px 60px, 100%;
      background-position: 0 0, 0 0;
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      max-width: 640px;
      margin: 0 auto;
      background: rgba(15, 31, 53, 0.6);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(97, 218, 251, 0.1);
    }

    /* Header - Premium gradient */
    .header {
      background: linear-gradient(135deg, #005792 0%, #61DAFB 100%);
      padding: 48px 40px;
      text-align: center;
      position: relative;
      border-bottom: 3px solid #D4A017;
      box-shadow: 0 10px 30px rgba(0, 87, 146, 0.3);
    }

    /* Premium badge */
    .badge {
      display: inline-block;
      padding: 8px 20px;
      margin-bottom: 16px;
      border: 2px solid rgba(212, 160, 23, 0.6);
      background: rgba(212, 160, 23, 0.1);
      backdrop-filter: blur(8px);
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #D4A017;
    }

    .header h1 {
      font-family: 'Rajdhani', sans-serif;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 8px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .header-subtitle {
      font-size: 15px;
      color: rgba(255, 255, 255, 0.95);
      font-weight: 500;
    }

    /* Content area */
    .content {
      background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(6, 18, 32, 0.95) 100%);
      padding: 40px;
    }

    /* Section title */
    .section-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #D4A017;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(212, 160, 23, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Sender info card */
    .sender-card {
      background: linear-gradient(135deg, rgba(97, 218, 251, 0.08) 0%, rgba(212, 160, 23, 0.03) 100%);
      border: 1px solid rgba(97, 218, 251, 0.2);
      border-left: 4px solid #61DAFB;
      padding: 24px;
      border-radius: 12px;
      line-height: 1.8;
      font-size: 15px;
      color: #cbd5e1;
      margin-bottom: 32px;
      box-shadow: 0 8px 24px rgba(97, 218, 251, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .info-row {
      margin: 12px 0;
      display: flex;
      gap: 12px;
    }

    .info-label {
      font-weight: 700;
      color: #61DAFB;
      min-width: 80px;
      flex-shrink: 0;
    }

    .info-value {
      color: #e2e8f0;
      word-break: break-word;
    }

    .info-value a {
      color: #61DAFB;
      text-decoration: none;
      border-bottom: 1px solid #61DAFB;
      transition: color 0.2s;
    }

    .info-value a:hover {
      color: #ffffff;
    }

    /* Subject badge */
    .subject-badge {
      display: inline-block;
      background: linear-gradient(135deg, #005792 0%, #003d5c 100%);
      color: #61DAFB;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(97, 218, 251, 0.4);
      margin-top: 8px;
    }

    /* Premium divider with gold accent */
    .divider {
      border: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, #D4A017 20%, #D4A017 80%, transparent 100%);
      margin: 40px 0;
      opacity: 0.5;
      position: relative;
    }

    .divider::before {
      content: '◆';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      color: #D4A017;
      font-size: 12px;
      background: linear-gradient(135deg, #0a1929 0%, #061220 100%);
      padding: 0 12px;
    }

    /* Message section */
    .message-section {
      background: linear-gradient(135deg, rgba(6, 18, 32, 0.8) 0%, rgba(10, 40, 69, 0.6) 100%);
      border: 1px solid rgba(212, 160, 23, 0.2);
      border-left: 4px solid #D4A017;
      padding: 20px;
      border-radius: 12px;
      margin-top: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .message-content {
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.7;
      color: #94a3b8;
      overflow-x: auto;
    }

    /* CTA Button */
    .cta-container {
      text-align: center;
      margin-top: 32px;
    }

    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #61DAFB 0%, #005792 100%);
      color: #000;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 8px;
      border: 1px solid #61DAFB;
      transition: all 0.3s ease;
      box-shadow: 0 8px 24px rgba(97, 218, 251, 0.3);
    }

    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(97, 218, 251, 0.4);
    }

    /* Footer */
    .footer {
      background: linear-gradient(135deg, #061220 0%, #0a1929 100%);
      border-top: 1px solid rgba(97, 218, 251, 0.1);
      padding: 32px 40px;
      text-align: center;
    }

    .footer-name {
      font-family: 'Rajdhani', sans-serif;
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(135deg, #D4A017 0%, #B8860B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: inline-block;
      margin-bottom: 8px;
    }

    .footer-tagline {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 8px;
      letter-spacing: 0.05em;
    }

    /* Responsive design */
    @media only screen and (max-width: 640px) {
      .wrapper { padding: 20px 16px; }
      .container { border-radius: 12px; }
      .header { padding: 32px 24px; }
      .header h1 { font-size: 26px; }
      .badge { font-size: 10px; padding: 6px 16px; }
      .content { padding: 24px 20px; }
      .sender-card { padding: 18px; font-size: 14px; }
      .info-row { flex-direction: column; gap: 4px; }
      .info-label { min-width: auto; }
      .message-section { padding: 16px; }
      .message-content { font-size: 13px; }
      .footer { padding: 24px 20px; }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body { background: linear-gradient(135deg, #061220 0%, #0a1929 100%); }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header Section -->
      <div class="header">
        <div class="badge">Connection Opportunity</div>
        <h1>📨 New Portfolio Inquiry</h1>
        <p class="header-subtitle">From your portfolio contact form</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Sender Information -->
        <div class="section-title">👤 Sender Information</div>
        <div class="sender-card">
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${escapeHtml(senderName)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value"><a href="mailto:${escapeHtml(senderEmail)}">${escapeHtml(senderEmail)}</a></span>
          </div>
          ${phone ? `<div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></span>
          </div>` : ''}
          <div class="info-row">
            <span class="info-label">Subject:</span>
            <span class="subject-badge">${escapeHtml(subject)}</span>
          </div>
        </div>

        <hr class="divider">

        <!-- Message Section -->
        <div class="section-title">💬 Message</div>
        <div class="message-section">
          <div class="message-content">${escapeHtml(message)}</div>
        </div>

        <!-- CTA -->
        <div class="cta-container">
          <a href="${dashboardUrl}" class="button">→ Reply in Dashboard</a>
        </div>
      </div>

      <!-- Footer Section -->
      <div class="footer">
        <div class="footer-name">Karisa Voyani</div>
        <p class="footer-tagline">
          Engineering Precision • African Innovation • Modern Tech
        </p>
        <p style="font-size: 11px; color: #64748b; margin-top: 12px;">
          This is an automated notification from your portfolio system
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function confirmationEmailTemplate(senderName: string, subject: string): string {
  // African pattern SVG - matches homepage design
  const africanPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Message Received: ${escapeHtml(subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Import Google Fonts - Rajdhani & Inter (matching homepage) */
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&family=Inter:wght@300;400;500;600;700&display=swap');

    /* CSS Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #061220 0%, #0a1929 100%);
      color: #f0f0f0;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Typography matching homepage */
    h1, h2, h3, h4, h5, h6 {
      font-family: 'Rajdhani', sans-serif;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    /* Main wrapper with African pattern background */
    .wrapper {
      background: linear-gradient(135deg, #061220 0%, #0a1929 100%);
      background-image: url("${africanPattern}"), linear-gradient(135deg, #061220 0%, #0a1929 100%);
      background-size: 60px 60px, 100%;
      background-position: 0 0, 0 0;
      min-height: 100vh;
      padding: 40px 20px;
    }

    .container {
      max-width: 640px;
      margin: 0 auto;
      background: rgba(15, 31, 53, 0.6);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(97, 218, 251, 0.1);
    }

    /* Header - Premium gradient (gold for confirmation) */
    .header {
      background: linear-gradient(135deg, #D4A017 0%, #B8860B 100%);
      padding: 48px 40px;
      text-align: center;
      position: relative;
      border-bottom: 3px solid #61DAFB;
      box-shadow: 0 10px 30px rgba(212, 160, 23, 0.3);
    }

    /* Premium badge */
    .badge {
      display: inline-block;
      padding: 8px 20px;
      margin-bottom: 16px;
      border: 2px solid rgba(97, 218, 251, 0.6);
      background: rgba(97, 218, 251, 0.1);
      backdrop-filter: blur(8px);
      border-radius: 50px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #61DAFB;
    }

    .header h1 {
      font-family: 'Rajdhani', sans-serif;
      font-size: 32px;
      font-weight: 700;
      color: #0a1929;
      margin-bottom: 8px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    .header-subtitle {
      font-size: 15px;
      color: rgba(10, 25, 41, 0.95);
      font-weight: 500;
    }

    /* Content area */
    .content {
      background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(6, 18, 32, 0.95) 100%);
      padding: 40px;
    }

    /* Greeting */
    .greeting {
      margin-bottom: 28px;
      font-size: 17px;
      color: #e2e8f0;
      font-weight: 400;
      line-height: 1.8;
    }

    .greeting strong {
      background: linear-gradient(135deg, #D4A017 0%, #B8860B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    /* Premium highlight card */
    .highlight-card {
      background: linear-gradient(135deg, rgba(97, 218, 251, 0.08) 0%, rgba(212, 160, 23, 0.03) 100%);
      border: 1px solid rgba(97, 218, 251, 0.2);
      border-left: 4px solid #D4A017;
      padding: 28px;
      border-radius: 12px;
      line-height: 1.8;
      font-size: 15px;
      color: #cbd5e1;
      margin: 32px 0;
      box-shadow: 0 8px 24px rgba(97, 218, 251, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .highlight-title {
      font-family: 'Rajdhani', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #61DAFB;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .highlight-content {
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 16px;
    }

    /* Subject badge */
    .subject-badge {
      display: inline-block;
      background: linear-gradient(135deg, #005792 0%, #003d5c 100%);
      color: #61DAFB;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid rgba(97, 218, 251, 0.4);
      margin-top: 12px;
    }

    /* Premium divider */
    .divider {
      border: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, #D4A017 20%, #D4A017 80%, transparent 100%);
      margin: 40px 0;
      opacity: 0.5;
      position: relative;
    }

    .divider::before {
      content: '◆';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      color: #D4A017;
      font-size: 12px;
      background: linear-gradient(135deg, #0a1929 0%, #061220 100%);
      padding: 0 12px;
    }

    /* Info section */
    .info-text {
      font-size: 15px;
      color: #e2e8f0;
      line-height: 1.8;
      margin: 24px 0;
      text-align: center;
    }

    /* Footer section */
    .footer-section {
      background: linear-gradient(135deg, rgba(212, 160, 23, 0.08) 0%, rgba(97, 218, 251, 0.05) 100%);
      border: 1px solid rgba(212, 160, 23, 0.2);
      border-left: 4px solid #D4A017;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      margin-top: 32px;
    }

    .footer-tagline {
      font-size: 13px;
      color: #cbd5e1;
      margin-bottom: 8px;
      font-weight: 500;
      letter-spacing: 0.05em;
    }

    .footer-accent {
      color: #61DAFB;
      font-weight: 600;
    }

    /* Footer */
    .footer {
      background: linear-gradient(135deg, #061220 0%, #0a1929 100%);
      border-top: 1px solid rgba(97, 218, 251, 0.1);
      padding: 32px 40px;
      text-align: center;
    }

    .footer-name {
      font-family: 'Rajdhani', sans-serif;
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(135deg, #D4A017 0%, #B8860B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: inline-block;
      margin-bottom: 8px;
    }

    .footer-subtitle {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 8px;
      letter-spacing: 0.05em;
    }

    /* Responsive design */
    @media only screen and (max-width: 640px) {
      .wrapper { padding: 20px 16px; }
      .container { border-radius: 12px; }
      .header { padding: 32px 24px; }
      .header h1 { font-size: 26px; }
      .badge { font-size: 10px; padding: 6px 16px; }
      .content { padding: 24px 20px; }
      .greeting { font-size: 16px; }
      .highlight-card { padding: 20px; font-size: 14px; margin: 24px 0; }
      .highlight-content { font-size: 14px; }
      .info-text { font-size: 14px; }
      .footer { padding: 24px 20px; }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body { background: linear-gradient(135deg, #061220 0%, #0a1929 100%); }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header Section -->
      <div class="header">
        <div class="badge">Thank You</div>
        <h1>✓ Message Received</h1>
        <p class="header-subtitle">Your inquiry has been successfully submitted</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Greeting -->
        <p class="greeting">Hi <strong>${escapeHtml(senderName)}</strong>,</p>

        <!-- Main message -->
        <p class="info-text">
          Thank you for reaching out! Your message has been successfully received and is now in our system. We truly appreciate you taking the time to connect with us.
        </p>

        <!-- Highlight card -->
        <div class="highlight-card">
          <div class="highlight-title">⏱️ What Happens Next?</div>
          <div class="highlight-content">
            Our team is reviewing your inquiry with care. We typically respond within <strong>24-48 hours</strong>. Your message is important to us, and we're excited to discuss potential opportunities with you!
          </div>
          <div class="subject-badge">Subject: ${escapeHtml(subject)}</div>
        </div>

        <hr class="divider">

        <!-- Additional info -->
        <p class="info-text">
          In the meantime, feel free to explore more about <strong>Karisa's work</strong>, projects, and expertise on the portfolio.
        </p>

        <!-- Footer section with branding -->
        <div class="footer-section">
          <p class="footer-tagline">
            Engineering Precision • African Innovation • Modern Tech
          </p>
          <p style="font-size: 13px; color: #61DAFB; margin-top: 8px;">
            We look forward to continuing our conversation with you!
          </p>
        </div>
      </div>

      <!-- Footer Section -->
      <div class="footer">
        <div class="footer-name">Karisa Voyani</div>
        <p class="footer-subtitle">
          Contact Form Confirmation
        </p>
        <p style="font-size: 11px; color: #64748b; margin-top: 12px;">
          This is an automated confirmation from the portfolio system.<br>
          Questions? Feel free to reply to this email.
        </p>
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
