import type { InboundAttachment } from '@/utils/emailValidation';

export interface OriginalItem { kind: 'original'; id: string; at: string; body: string; name: string; email: string }
export interface OutboundItem {
  kind: 'outbound'; id: string; at: string; body: string; replyType: string;
  emailStatus: string; resendId: string | null; source: 'dashboard' | 'email_relay';
}
export interface InboundItem {
  kind: 'inbound'; id: string; at: string; subject: string; bodyText: string | null; bodyHtml: string | null;
  fromName: string | null; fromEmail: string; isRead: boolean; isImportant: boolean;
  held: boolean; heldReason: string | null; senderVerified: boolean; spamScore: number | null;
  attachments: InboundAttachment[];
}
export type ThreadItem = OriginalItem | OutboundItem | InboundItem;

type SubmissionLike = { id: string; name: string; email: string; message: string; created_at: string };
type ReplyLike = { id: string; reply_message: string; reply_type: string; email_status: string | null; resend_email_id: string | null; email_metadata: { source?: string } | null; created_at: string };
type InboundLike = {
  id: string; from_email: string; from_name: string | null; subject: string; body_text: string | null; body_html: string | null;
  received_at: string; is_read: boolean; is_important: boolean; status: string; spam_score: number | null;
  spam_reasons: string[] | null; sender_verified?: boolean | null; inbound_attachments?: InboundAttachment[];
};

const HELD = new Set(['spam', 'quarantined', 'failed']);

export function buildThread(submission: SubmissionLike, replies: ReplyLike[], inbound: InboundLike[]): ThreadItem[] {
  const items: ThreadItem[] = [
    { kind: 'original', id: submission.id, at: submission.created_at, body: submission.message, name: submission.name, email: submission.email },
    ...replies.map<OutboundItem>((r) => ({
      kind: 'outbound', id: r.id, at: r.created_at, body: r.reply_message, replyType: r.reply_type,
      emailStatus: r.email_status ?? 'pending', resendId: r.resend_email_id,
      source: r.email_metadata?.source === 'email_relay' ? 'email_relay' : 'dashboard',
    })),
    ...inbound.map<InboundItem>((i) => {
      const held = HELD.has(i.status);
      const heldReason = held ? (i.spam_reasons?.[0] ?? (i.status === 'quarantined' ? 'quarantined for review' : i.status)) : null;
      return {
        kind: 'inbound', id: i.id, at: i.received_at, subject: i.subject, bodyText: i.body_text, bodyHtml: i.body_html,
        fromName: i.from_name, fromEmail: i.from_email, isRead: i.is_read, isImportant: i.is_important,
        held, heldReason, senderVerified: i.sender_verified !== false, spamScore: i.spam_score,
        attachments: i.inbound_attachments ?? [],
      };
    }),
  ];
  // The original always leads; everything else in time order.
  const [original, ...rest] = items;
  rest.sort((a, b) => a.at.localeCompare(b.at));
  return [original, ...rest];
}

export function threadSummary(items: ThreadItem[]): { unreadInbound: number; awaitingReply: boolean; lastAt: string | null } {
  const live = items.filter((i) => i.kind !== 'inbound' || !i.held);
  const last = live[live.length - 1] ?? null;
  return {
    unreadInbound: items.filter((i) => i.kind === 'inbound' && !i.held && !i.isRead).length,
    awaitingReply: last === null || last.kind !== 'outbound',
    lastAt: last?.at ?? null,
  };
}
