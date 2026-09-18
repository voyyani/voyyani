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
  /** The Resend `data.email_id` from an `email.received` webhook, when the payload came from one. */
  resendEmailId?: string;
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
    resend_email_id: input.resendEmailId ?? null,
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

/**
 * Resend's real `email.received` webhook is a thin envelope — metadata only, no body,
 * headers or attachment content. The full email is fetched separately from
 * GET /emails/receiving/{email_id}. Other event types (email.sent, email.delivered, ...)
 * arrive on the same endpoint in production and must be ignored, not treated as mail.
 *
 * A flat payload (top-level `from`/`to`, no `type`) is the legacy/test shape and stays
 * supported so existing callers and fixtures keep working.
 */
export interface ReceivedEvent {
  type: string;
  data?: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    message_id?: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type?: string;
      content_disposition?: string;
      content_id?: string;
    }>;
  };
}

export type InboundEnvelope =
  | { kind: 'received'; emailId: string }
  | { kind: 'flat' }
  | { kind: 'ignore'; type: string }
  | { kind: 'invalid' };

export function classifyInboundPayload(body: unknown): InboundEnvelope {
  if (!body || typeof body !== 'object') return { kind: 'invalid' };

  const obj = body as Record<string, unknown>;

  if (typeof obj.type === 'string') {
    if (obj.type === 'email.received') {
      const data = obj.data as Record<string, unknown> | undefined;
      const emailId = data?.email_id;
      if (typeof emailId === 'string' && emailId) {
        return { kind: 'received', emailId };
      }
      return { kind: 'invalid' };
    }
    return { kind: 'ignore', type: obj.type };
  }

  if (typeof obj.from === 'string' && Array.isArray(obj.to)) {
    return { kind: 'flat' };
  }

  return { kind: 'invalid' };
}

/**
 * The flat shape the handler has always consumed downstream — now also the target
 * shape `mergeReceivedEmail` produces from an `email.received` envelope plus the full
 * fetched email.
 */
export interface FlatInbound {
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  message_id?: string;
  in_reply_to?: string;
  references?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    id?: string;
    filename: string;
    content?: string;
    content_disposition?: 'attachment' | 'inline';
    content_id?: string;
    content_type?: string;
    size?: number;
  }>;
}

function headerLookup(headers: Record<string, string> | undefined, name: string): string | undefined {
  if (!headers) return undefined;
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : undefined;
}

export function mergeReceivedEmail(
  event: ReceivedEvent,
  full: {
    from?: string;
    to?: string[];
    subject?: string;
    html?: string | null;
    text?: string | null;
    headers?: Record<string, string>;
    message_id?: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type?: string;
      content_disposition?: string;
      content_id?: string;
      size?: number;
    }>;
  }
): FlatInbound {
  const data = event.data ?? {};

  const from = full.from ?? data.from ?? '';
  const to = full.to ?? data.to ?? [];
  const subject = full.subject ?? data.subject ?? '';
  const message_id = full.message_id ?? data.message_id;
  const attachments = full.attachments ?? data.attachments;

  return {
    from,
    to,
    subject,
    text: full.text ?? undefined,
    html: full.html ?? undefined,
    message_id,
    in_reply_to: headerLookup(full.headers, 'in-reply-to'),
    references: headerLookup(full.headers, 'references'),
    headers: full.headers,
    attachments: attachments?.map((a) => ({
      id: a.id,
      filename: a.filename,
      content_type: a.content_type,
      content_disposition: a.content_disposition as 'attachment' | 'inline' | undefined,
      content_id: a.content_id,
      size: 'size' in a ? (a as { size?: number }).size : undefined,
      content: undefined,
    })),
  };
}
