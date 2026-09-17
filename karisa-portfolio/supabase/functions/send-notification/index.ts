// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildFrom, buildReplyAddress } from '../_shared/mail.ts';
import { renderEmail, textToHtml, escapeHtml } from '../_shared/emailTemplate.ts';

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
const mailDomain = Deno.env.get('MAIL_DOMAIN') || 'voyani.tech';
const fromAddress = Deno.env.get('MAIL_FROM_ADDRESS') || `karisa@${mailDomain}`;
const fromName = Deno.env.get('MAIL_FROM_NAME') || 'Karisa';
const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'voyanitech@gmail.com';
const portfolioUrl = Deno.env.get('PORTFOLIO_URL') || 'https://voyani.tech';

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

function submissionEmailTemplate(senderName: string, senderEmail: string, phone: string | undefined, subject: string, message: string, threadUrl: string): string {
  const contact = [
    `<p style="margin:0 0 4px"><strong>${escapeHtml(senderName)}</strong> · <a href="mailto:${escapeHtml(senderEmail)}" style="color:#243D8F">${escapeHtml(senderEmail)}</a></p>`,
    phone ? `<p style="margin:0 0 4px">Phone: <a href="tel:${escapeHtml(phone)}" style="color:#243D8F">${escapeHtml(phone)}</a></p>` : '',
    `<p style="margin:0">Subject: ${escapeHtml(subject)}</p>`,
  ].join('');
  return renderEmail({
    title: `New enquiry: ${subject}`,
    preheader: `${senderName}: ${message.slice(0, 100)}`,
    lead: 'From the contact form on voyani.tech.',
    sections: [
      { label: 'From', html: contact },
      { label: 'Message', html: textToHtml(message), quoted: true },
    ],
    cta: { href: threadUrl, label: 'Open this thread', note: `Or just reply to this email — your answer goes to ${senderName} and is kept in the thread.` },
  });
}

function confirmationEmailTemplate(senderName: string, subject: string): string {
  return renderEmail({
    title: 'Message received',
    preheader: `Thanks ${senderName} — I have your message about ${subject}.`,
    lead: `Hi ${senderName}, thanks for getting in touch.`,
    sections: [
      { html: `<p style="margin:0 0 12px">I have your message about <strong>${escapeHtml(subject)}</strong> and will reply personally, usually within one working day.</p><p style="margin:0">If anything changes in the meantime, reply to this email — it reaches me directly.</p>` },
    ],
    footerNote: 'This confirmation was sent automatically.',
  });
}

async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
  replyTo: string,
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
          from: buildFrom(fromName, fromAddress),
          to,
          reply_to: replyTo,
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

    const threadUrl = `${portfolioUrl}/admin/submissions/${submission.id}`;
    const replyTo = buildReplyAddress(submission.id, mailDomain);

    // Send admin notification to voyanitech@gmail.com
    if (resendApiKey) {
      const adminHtml = submissionEmailTemplate(
        payload.name,
        payload.email,
        payload.phone,
        payload.subject,
        payload.message,
        threadUrl
      );

      try {
        await sendEmailViaResend(
          adminEmail,
          `New Portfolio Inquiry: ${payload.subject}`,
          adminHtml,
          replyTo
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
          confirmationHtml,
          replyTo
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
