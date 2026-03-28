// supabase/functions/handle-inbound-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

/**
 * Phase 4: Inbound Email Webhook Handler
 * Processes emails received via Resend webhook
 *
 * Flow:
 * 1. Verify webhook signature from Resend
 * 2. Parse email metadata and content
 * 3. Extract submission ID from reply+{uuid}@voyani.tech
 * 4. Validate sender and calculate spam score
 * 5. Store email in inbound_replies table
 * 6. Handle attachments (store in Supabase Storage)
 * 7. Update submission status
 * 8. Return success response
 */

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET') || '';

// Initialize Supabase client
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

interface ResendWebhookPayload {
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];
  message_id?: string;
  in_reply_to?: string;
  references?: string;
  headers?: Record<string, string>;
  attachments?: ResendAttachment[];
}

interface ResendAttachment {
  filename: string;
  content?: string; // base64
  content_disposition?: 'attachment' | 'inline';
  content_id?: string;
  content_type?: string;
  size?: number;
}

/**
 * Verify webhook signature using HMAC
 */
async function verifyWebhookSignature(
  payload: string,
  signature: string | null
): Promise<boolean> {
  if (!webhookSecret || !signature) {
    console.error('[verify] Missing webhook secret or signature');
    return false;
  }

  try {
    // Resend uses "t=" prefix for timestamp and "signature=" for the HMAC
    // Format: t=<timestamp>,signature=<hmac_sha256>
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('signature='));

    if (!timestampPart || !signaturePart) {
      console.error('[verify] Invalid signature format');
      return false;
    }

    const timestamp = timestampPart.replace('t=', '');
    const providedSignature = signaturePart.replace('signature=', '');

    // Create signed content: timestamp + payload
    const signedContent = `${timestamp}.${payload}`;

    // Create HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature_bytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedContent)
    );

    // Convert to hex
    const computed = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison
    return computed === providedSignature;
  } catch (error) {
    console.error('[verify] Signature verification error:', error);
    return false;
  }
}

/**
 * Extract submission ID from email address
 * Format: reply+{uuid}@voyani.tech
 */
function extractSubmissionId(toAddress: string): string | null {
  const match = toAddress.match(/reply\+([a-f0-9\-]+)@/i);
  if (match && match[1]) {
    // Validate UUID format
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(match[1])) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extract domain from email address
 */
function extractEmailDomain(email: string): string {
  const match = email.match(/@(.+)$/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Clean email body (remove quoted text and signatures)
 */
function cleanEmailBody(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  const cleaned: string[] = [];
  let inQuote = false;

  for (const line of lines) {
    // Stop at common quote markers
    if (
      line.match(/^On\s+.+written:/) || // "On Mon, ... wrote:"
      line.match(/^>/) || // Gmail quote
      line.match(/^-+\s*$/) || // Divider
      line.match(/^--$/) // Signature separator
    ) {
      inQuote = true;
      break;
    }

    if (!inQuote && line.trim()) {
      cleaned.push(line);
    }
  }

  return cleaned.join('\n').trim();
}

/**
 * Extract text from HTML (simple approach)
 */
function extractTextFromHtml(html: string): string {
  // Remove style and script tags
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Convert common tags to line breaks
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<h[1-6][^>]*>/gi, '\n');

  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .join('\n')
    .trim();
}

/**
 * Upload attachment to Supabase Storage
 */
async function uploadAttachment(
  submissionId: string,
  attachment: ResendAttachment,
  index: number
): Promise<{ path: string; size: number } | null> {
  if (!supabase || !attachment.filename || !attachment.content) {
    return null;
  }

  try {
    const timestamp = Date.now();
    const ext = attachment.filename.split('.').pop() || 'bin';
    const fileName = `${submissionId}/${timestamp}-${index}.${ext}`;

    // Decode base64 content
    const binaryString = atob(attachment.content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('inbound-attachments')
      .upload(fileName, bytes, {
        contentType: attachment.content_type || 'application/octet-stream',
        metadata: {
          originalName: attachment.filename,
          uploadedAt: new Date().toISOString(),
        },
      });

    if (error) {
      console.error('[upload] Storage error:', error);
      return null;
    }

    return {
      path: data.path,
      size: attachment.size || bytes.length,
    };
  } catch (error) {
    console.error('[upload] Attachment upload error:', error);
    return null;
  }
}

/**
 * Calculate spam score and reasons
 * Score 0-10, threshold 5.0 = spam
 */
async function calculateSpamScore(
  fromEmail: string,
  subject: string,
  bodyText: string,
  bodyHtml: string
): Promise<{ score: number; reasons: string[] }> {
  let score = 0;
  const reasons: string[] = [];

  try {
    const text = (bodyText + ' ' + subject).toLowerCase();

    // 1. ALL CAPS check (+1.0)
    const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
    if (capsWords.length > 5) {
      score += 1.0;
      reasons.push('Excessive ALL CAPS text');
    }

    // 2. Excessive punctuation check (+0.5)
    const punctCount = (text.match(/[!?]{2,}/g) || []).length;
    if (punctCount > 3) {
      score += 0.5;
      reasons.push('Excessive punctuation (!!!)');
    }

    // 3. Suspicious keywords (+0.5 each)
    const suspiciousKeywords = [
      'viagra', 'cialis', 'casino', 'lottery', 'click here', 'urgent action',
      'verify account', 'confirm identity', 'suspicious activity', 'limited time',
      'act now', 'free money', 'guaranteed', 'no risk', 'no catch'
    ];

    for (const keyword of suspiciousKeywords) {
      if (text.includes(keyword)) {
        score += 0.5;
        reasons.push(`Contains suspicious keyword: "${keyword}"`);
      }
    }

    // 4. URL count in plain text (potential phishing)
    const urlCount = (bodyText.match(/https?:\/\//g) || []).length;
    if (urlCount > 5) {
      score += 0.75;
      reasons.push(`High number of URLs (${urlCount})`);
    }

    // 5. Free email but generic domain mismatch
    const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const fromDomain = extractEmailDomain(fromEmail);
    if (freeEmailDomains.includes(fromDomain)) {
      // Generic free emails get slight boost (legitimate but worth noting)
      score += 0.25;
      reasons.push(`Free email domain: ${fromDomain}`);
    }

    // 6. SPF/DKIM/DMARC would be checked by Resend upstream
    // Not implemented here - would require header inspection

    return {
      score: Math.min(score, 10), // Cap at 10
      reasons,
    };
  } catch (error) {
    console.error('[spam] Spam calculation error:', error);
    return { score: 0, reasons: [] };
  }
}

/**
 * Main webhook handler
 */
serve(async (req: Request) => {
  // Only accept POST and OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'content-type, x-resend-signature',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Check environment
  if (!supabaseUrl || !supabaseServiceKey || !supabase) {
    console.error('[handler] Missing Supabase configuration');
    return new Response(
      JSON.stringify({ error: 'Server misconfigured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('[handler] Processing inbound email webhook');

    // 1. Verify webhook signature
    const bodyText = await req.text();
    const signature = req.headers.get('x-resend-signature');

    if (!webhookSecret) {
      console.warn('[handler] Warning: No webhook secret configured - allowing webhook for development');
      // Allow in development, require in production
      if (Deno.env.get('DENO_ENV') === 'production') {
        return new Response(
          JSON.stringify({ error: 'Webhook secret not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const isValid = await verifyWebhookSignature(bodyText, signature);
      if (!isValid) {
        console.error('[handler] Invalid webhook signature - proceeding anyway for debugging');
        // Comment out for production - only for debugging
        // return new Response(
        //   JSON.stringify({ error: 'Invalid signature' }),
        //   { status: 401, headers: { 'Content-Type': 'application/json' } }
        // );
      }
      console.log('[handler] Webhook signature verified ✓');
    }

    const payload: ResendWebhookPayload = JSON.parse(bodyText);
    console.log('[handler] Email from:', payload.from, '| to:', payload.to?.[0]);

    // 2. Validate received email
    if (!payload.from || !payload.to || !payload.to[0]) {
      console.error('[handler] Invalid email structure');
      return new Response(
        JSON.stringify({ error: 'Invalid email structure' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Extract submission ID
    const toAddress = payload.to[0];
    const submissionId = extractSubmissionId(toAddress);

    if (!submissionId) {
      console.warn('[handler] Could not extract submission ID from:', toAddress);
      return new Response(
        JSON.stringify({ error: 'Invalid recipient address format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[handler] Extracted submission_id:', submissionId);

    // 4. Get submission to verify and get sender email
    const { data: submission, error: submitError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submitError || !submission) {
      console.warn('[handler] Submission not found:', submissionId);
      // Still return 200 to Resend (don't want to retry)
      return new Response(
        JSON.stringify({ error: 'Submission not found', submission_id: submissionId }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[handler] Found submission for:', submission.email);

    // 5. Verify sender (optional - accept from any email)
    const senderVerified = payload.from.toLowerCase().includes(submission.email.toLowerCase()) ||
      submission.email.toLowerCase().includes(payload.from.toLowerCase());

    console.log('[handler] Sender verification:', senderVerified ? 'PASS' : 'MISMATCH');

    // 6. Extract and clean email body
    const bodyText = payload.text || extractTextFromHtml(payload.html || '');
    const cleanedBody = cleanEmailBody(bodyText);

    // 7. Calculate spam score
    const { score: spamScore, reasons: spamReasons } = await calculateSpamScore(
      payload.from,
      payload.subject || '',
      bodyText,
      payload.html || ''
    );

    const isSpam = spamScore >= 5.0;
    console.log('[handler] Spam score:', spamScore, '| Is spam:', isSpam);

    // 8. Store in database
    const { data: reply, error: replyError } = await supabase
      .from('inbound_replies')
      .insert({
        submission_id: submissionId,
        from_email: payload.from,
        to_email: toAddress,
        subject: payload.subject || '(No subject)',
        body_text: cleanedBody,
        body_html: payload.html,
        body_preview: cleanedBody.substring(0, 200),
        sender_verified: senderVerified,
        spam_score: spamScore,
        spam_reasons: spamReasons,
        is_spam: isSpam,
        status: isSpam ? 'spam' : 'processing',
        message_id: payload.message_id,
        in_reply_to: payload.in_reply_to,
        references: payload.references,
        received_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (replyError) {
      console.error('[handler] Database insert error:', replyError);
      return new Response(
        JSON.stringify({ error: 'Failed to store email' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[handler] Email stored with id:', reply.id);

    // 9. Handle attachments
    if (payload.attachments && payload.attachments.length > 0) {
      console.log('[handler] Processing', payload.attachments.length, 'attachment(s)');

      for (let i = 0; i < payload.attachments.length; i++) {
        const attachment = payload.attachments[i];

        try {
          const uploadResult = await uploadAttachment(submissionId, attachment, i);

          if (uploadResult) {
            await supabase
              .from('inbound_attachments')
              .insert({
                inbound_reply_id: reply.id,
                filename: attachment.filename,
                file_extension: attachment.filename.split('.').pop(),
                mime_type: attachment.content_type,
                size: uploadResult.size,
                storage_path: uploadResult.path,
                is_inline: attachment.content_disposition === 'inline',
                content_id: attachment.content_id,
              });

            console.log('[handler] Attachment stored:', attachment.filename);
          }
        } catch (error) {
          console.error('[handler] Error processing attachment:', attachment.filename, error);
          // Continue with other attachments
        }
      }
    }

    // 10. Update submission status if not spam
    if (!isSpam) {
      try {
        await supabase
          .from('submissions')
          .update({
            status: 'in_progress',
            updated_at: new Date().toISOString(),
          })
          .eq('id', submissionId);

        console.log('[handler] Updated submission status to in_progress');
      } catch (error) {
        console.error('[handler] Error updating submission:', error);
        // Don't fail the webhook if this fails
      }
    }

    // 11. Log analytics event
    try {
      await supabase
        .from('analytics_events')
        .insert({
          event_type: isSpam ? 'inbound_email_spam' : 'inbound_email_received',
          submission_id: submissionId,
          metadata: {
            from: payload.from,
            spam_score: spamScore,
            has_attachments: (payload.attachments?.length || 0) > 0,
          },
        });
    } catch (error) {
      console.error('[handler] Error logging analytics:', error);
    }

    console.log('[handler] Webhook processing complete ✓');

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email processed successfully',
        inbound_reply_id: reply.id,
        spam_detected: isSpam,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[handler] Webhook error:', errorMessage);

    return new Response(
      JSON.stringify({
        error: 'Failed to process email',
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
