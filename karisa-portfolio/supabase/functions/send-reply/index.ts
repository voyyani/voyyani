// supabase/functions/send-reply/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { jwtDecode } from 'https://esm.sh/jwt-decode@3.1.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReplyPayload {
  submission_id: string;
  reply_message: string;
  reply_type: 'manual' | 'quick_reply' | 'status_change';
  template_id?: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const portfolioUrl = Deno.env.get('PORTFOLIO_URL') || 'https://yourportfolio.com';

const client = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiting store (in-memory, would need Redis for production)
const rateLimitMap = new Map<string, Array<number>>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const windowStart = now - hour;

  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }

  const timestamps = rateLimitMap.get(userId)!;
  const recentRequests = timestamps.filter(t => t > windowStart);

  if (recentRequests.length >= 20) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  return true;
}

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
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
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
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get and verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check role
    const role = decoded.role || decoded.user_role;
    const allowedRoles = ['admin', 'content_manager', 'owner', 'super_admin'];
    if (!allowedRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const userId = decoded.sub;
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded: 20 replies per hour' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: ReplyPayload = await req.json();

    // Validate payload
    if (!payload.submission_id || !payload.reply_message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get submission
    const { data: submission, error: submitError } = await client
      .from('submissions')
      .select('*')
      .eq('id', payload.submission_id)
      .single();

    if (submitError || !submission) {
      return new Response(
        JSON.stringify({ error: 'Submission not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save reply to database
    const { data: reply, error: replyError } = await client
      .from('submission_replies')
      .insert({
        submission_id: payload.submission_id,
        reply_message: payload.reply_message,
        reply_type: payload.reply_type,
        sent_by: userId,
      })
      .select()
      .single();

    if (replyError) {
      throw new Error(`Database error: ${replyError.message}`);
    }

    // Send reply email
    const html = replyEmailTemplate(
      submission.name,
      payload.reply_message,
      submission.subject,
      submission.message
    );

    const emailResult = await sendEmailViaResend(
      submission.email,
      `Re: ${submission.subject}`,
      html
    );

    // Update submission with responded_at and replied email id
    await client
      .from('submission_replies')
      .update({ resend_email_id: emailResult.id })
      .eq('id', reply.id);

    if (!submission.responded_at) {
      await client
        .from('submissions')
        .update({ responded_at: new Date().toISOString() })
        .eq('id', payload.submission_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reply sent successfully',
        reply_id: reply.id,
        email_id: emailResult.id,
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
