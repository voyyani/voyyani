/**
 * Pure data-shaping for inbound email. No Deno globals, no network, no Supabase client —
 * so the edge function and Vitest import the exact same file.
 *
 * Every function here exists because the previous inline version of this logic disagreed
 * with supabase/migrations/20260328000000_inbound_email_system.sql. See docs/EMAIL_ROADMAP.md §0.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type InboundRoute =
  | { kind: 'reply'; submissionId: string }
  | { kind: 'direct'; mailbox: string }
  | { kind: 'foreign' };

export interface ParsedAddress {
  name: string | null;
  email: string;
}

/**
 * `Jane Doe <jane@example.com>` -> { name: 'Jane Doe', email: 'jane@example.com' }
 *
 * inbound_replies.from_email carries CHECK (from_email ~* '^...@...$'), which a raw
 * display-name header violates — so every insert from a normal mail client failed.
 */
export function parseAddress(raw: string): ParsedAddress {
  const trimmed = (raw || '').trim();
  const angled = trimmed.match(/^(.*)<([^>]+)>\s*$/);

  if (angled) {
    const name = angled[1].trim().replace(/^"(.*)"$/, '$1').trim();
    return { name: name || null, email: angled[2].trim().toLowerCase() };
  }

  return { name: null, email: trimmed.toLowerCase() };
}

/**
 * Decide what an inbound recipient address means.
 *
 * - `reply+{uuid}@domain` threads onto an existing submission.
 * - anything else `@domain` is direct human mail (karisa@, hello@, a typo) and is
 *   forwarded to ADMIN_EMAIL rather than 400'd, which is what the old code did.
 * - anything at another domain is not ours.
 */
export function routeInboundAddress(toAddress: string, domain: string): InboundRoute {
  const { email } = parseAddress(toAddress);
  const at = email.lastIndexOf('@');
  if (at === -1) return { kind: 'foreign' };

  const mailbox = email.slice(0, at);
  const host = email.slice(at + 1);

  if (host !== domain.toLowerCase()) return { kind: 'foreign' };

  const replyMatch = mailbox.match(/^reply\+(.+)$/i);
  if (replyMatch && UUID_RE.test(replyMatch[1])) {
    return { kind: 'reply', submissionId: replyMatch[1].toLowerCase() };
  }

  return { kind: 'direct', mailbox };
}

/** The References header is a space-separated string; the column is text[]. */
export function normalizeReferences(refs: string | string[] | undefined): string[] | null {
  if (!refs) return null;
  const list = Array.isArray(refs) ? refs : refs.trim().split(/\s+/);
  const cleaned = list.map((r) => r.trim()).filter(Boolean);
  return cleaned.length ? cleaned : null;
}

/** message_id is NOT NULL UNIQUE, and not every sender supplies one. */
export function buildMessageId(payload: { message_id?: string }, submissionId: string): string {
  if (payload.message_id) return payload.message_id;
  return `<generated.${submissionId}.${Date.now()}@voyani.tech>`;
}

export interface InboundRowInput {
  submissionId: string;
  toAddress: string;
  from: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  payload: { message_id?: string; in_reply_to?: string; references?: string | string[] };
  senderVerified: boolean;
  spamScore: number;
  spamReasons: string[];
  isSpam: boolean;
}

export function buildInboundReplyRow(input: InboundRowInput): Record<string, unknown> {
  const from = parseAddress(input.from);
  const now = new Date().toISOString();

  // body_preview and file_extension are GENERATED ALWAYS columns — Postgres rejects
  // any insert that names them. They are deliberately absent below.
  return {
    submission_id: input.submissionId,
    from_email: from.email,
    from_name: from.name,
    to_email: parseAddress(input.toAddress).email,
    subject: input.subject || '(No subject)',
    body_text: input.bodyText,
    body_html: input.bodyHtml ?? null,
    message_id: buildMessageId(input.payload, input.submissionId),
    in_reply_to: input.payload.in_reply_to ?? null,
    references: normalizeReferences(input.payload.references),
    status: input.isSpam ? 'spam' : 'processed',
    spam_score: input.spamScore,
    spam_reasons: input.spamReasons,
    is_spam: input.isSpam,
    is_sender_verified: input.senderVerified,
    received_at: now,
    processed_at: now,
  };
}

export interface AttachmentRowInput {
  inboundReplyId: string;
  filename: string;
  mimeType: string;
  size: number;
  storagePath: string;
  isInline: boolean;
  contentId?: string;
}

export function buildAttachmentRow(input: AttachmentRowInput): Record<string, unknown> {
  return {
    inbound_reply_id: input.inboundReplyId,
    file_name: input.filename,
    file_size: input.size,
    mime_type: input.mimeType,
    storage_path: input.storagePath,
    is_inline: input.isInline,
    content_disposition: input.isInline ? 'inline' : 'attachment',
    content_id: input.contentId ?? null,
  };
}

export type InboundSender = 'visitor' | 'admin' | 'stranger';

/**
 * Who wrote to reply+{id}@? The visitor is the normal case. The admin is Karisa
 * answering an alert from Gmail — that mail must be relayed to the visitor and
 * recorded as outbound, not stored as an unverified inbound and bounced back to her.
 * A self-test submission (visitor == admin) is treated as the visitor.
 */
export function classifyInboundSender(from: string, submissionEmail: string, adminEmail: string): InboundSender {
  const sender = parseAddress(from).email;
  if (sender === String(submissionEmail).trim().toLowerCase()) return 'visitor';
  if (sender === String(adminEmail).trim().toLowerCase()) return 'admin';
  return 'stranger';
}
