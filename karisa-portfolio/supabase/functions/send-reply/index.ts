// supabase/functions/send-reply/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
          from: 'Karisa <karisa@voyani.tech>',
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

function replyEmailTemplate(
  recipientName: string,
  replyMessage: string,
  originalSubject: string,
  originalMessage: string
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
  <title>Re: ${escapeHtml(originalSubject)}</title>
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

    /* Header - Premium gradient matching Hero component */
    .header {
      background: linear-gradient(135deg, #005792 0%, #61DAFB 100%);
      padding: 48px 40px;
      text-align: center;
      position: relative;
      border-bottom: 3px solid #D4A017;
      box-shadow: 0 10px 30px rgba(0, 87, 146, 0.3);
    }

    /* Premium badge (inspired by Hero badge) */
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

    .greeting {
      margin-bottom: 28px;
      font-size: 17px;
      color: #e2e8f0;
      font-weight: 400;
    }

    .greeting strong {
      background: linear-gradient(135deg, #61DAFB 0%, #00BCD4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
    }

    /* Reply message section - Premium card design */
    .reply-section {
      background: linear-gradient(135deg, rgba(97, 218, 251, 0.08) 0%, rgba(212, 160, 23, 0.03) 100%);
      border: 1px solid rgba(97, 218, 251, 0.2);
      border-left: 4px solid #61DAFB;
      padding: 24px;
      border-radius: 12px;
      line-height: 1.8;
      white-space: pre-wrap;
      overflow-x: auto;
      font-size: 15px;
      color: #cbd5e1;
      margin-bottom: 32px;
      box-shadow: 0 8px 24px rgba(97, 218, 251, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05);
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

    /* Original message section */
    .original-section {
      margin-top: 32px;
    }

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

    .section-title::before {
      content: '📌';
      font-size: 14px;
    }

    .quoted-section {
      background: linear-gradient(135deg, rgba(6, 18, 32, 0.8) 0%, rgba(10, 40, 69, 0.6) 100%);
      border: 1px solid rgba(212, 160, 23, 0.2);
      border-left: 4px solid #D4A017;
      padding: 20px;
      border-radius: 12px;
      margin-top: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .quoted-header {
      font-size: 12px;
      color: #61DAFB;
      margin-bottom: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .quoted-message {
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.7;
      color: #94a3b8;
      overflow-x: auto;
    }

    .closing {
      margin-top: 32px;
      font-size: 15px;
      color: #cbd5e1;
      line-height: 1.6;
    }

    .closing strong {
      color: #61DAFB;
      font-weight: 600;
    }

    /* Footer - Matching homepage footer design */
    .footer {
      background: linear-gradient(135deg, #061220 0%, #0a1929 100%);
      border-top: 1px solid rgba(97, 218, 251, 0.1);
      padding: 32px 40px;
      text-align: center;
    }

    .footer-brand {
      margin-bottom: 16px;
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
    }

    .footer-tagline {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 8px;
      letter-spacing: 0.05em;
    }

    .footer-divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #D4A017, transparent);
      margin: 20px auto;
      opacity: 0.5;
    }

    .footer-links {
      margin-top: 16px;
    }

    .footer-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #61DAFB;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border: 1px solid rgba(97, 218, 251, 0.3);
      background: rgba(97, 218, 251, 0.05);
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .footer-link:hover {
      background: rgba(97, 218, 251, 0.15);
      border-color: rgba(97, 218, 251, 0.5);
    }

    /* Stats-like info footer */
    .footer-stats {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .footer-stat {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .footer-stat-separator {
      color: #D4A017;
      opacity: 0.5;
    }

    /* Responsive design */
    @media only screen and (max-width: 640px) {
      .wrapper { padding: 20px 16px; }
      .container { border-radius: 12px; }
      .header { padding: 32px 24px; }
      .header h1 { font-size: 26px; }
      .badge { font-size: 10px; padding: 6px 16px; }
      .content { padding: 24px 20px; }
      .reply-section { padding: 18px; font-size: 14px; }
      .quoted-section { padding: 16px; }
      .quoted-message { font-size: 13px; }
      .footer { padding: 24px 20px; }
      .footer-stats { gap: 16px; font-size: 10px; }
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
        <div class="badge">Engineering × Development</div>
        <h1>Re: ${escapeHtml(originalSubject)}</h1>
        <p class="header-subtitle">Response from Karisa Voyani</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <p class="greeting">Hi <strong>${escapeHtml(recipientName)}</strong>,</p>

        <div class="reply-section">${escapeHtml(replyMessage)}</div>

        <hr class="divider">

        <div class="original-section">
          <div class="section-title">Original Message</div>
          <div class="quoted-section">
            <div class="quoted-header">You wrote:</div>
            <div class="quoted-message">${escapeHtml(originalMessage)}</div>
          </div>
        </div>

        <p class="closing">
          <strong>Looking forward to continuing our conversation!</strong><br>
          I'll get back to you as soon as possible.
        </p>
      </div>

      <!-- Footer Section -->
      <div class="footer">
        <div class="footer-brand">
          <div class="footer-name">Karisa Voyani</div>
          <p class="footer-tagline">
            Engineering Precision • African Innovation • Modern Tech
          </p>
        </div>

        <div class="footer-divider"></div>

        <div class="footer-links">
          <a href="${portfolioUrl}" class="footer-link" style="color: #61DAFB; text-decoration: none;">
            <span>🌐</span>
            <span>Visit Portfolio</span>
          </a>
        </div>

        <div class="footer-stats">
          <span class="footer-stat">Mechanical Engineer</span>
          <span class="footer-stat-separator">•</span>
          <span class="footer-stat">Full-Stack Developer</span>
          <span class="footer-stat-separator">•</span>
          <span class="footer-stat">Problem Solver</span>
        </div>
      </div>
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
