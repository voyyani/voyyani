import { describe, it, expect } from 'vitest';
import { buildThread, threadSummary } from './thread';

const submission = { id: 's1', name: 'Amina', email: 'amina@example.com', message: 'Hello', created_at: '2026-09-10T10:00:00Z' };
const replies = [
  { id: 'r1', submission_id: 's1', reply_message: 'Thanks', reply_type: 'manual', email_status: 'delivered', resend_email_id: 're1', email_metadata: null, created_at: '2026-09-10T12:00:00Z' },
  { id: 'r2', submission_id: 's1', reply_message: 'From my phone', reply_type: 'manual', email_status: 'sent', resend_email_id: 're2', email_metadata: { source: 'email_relay' }, created_at: '2026-09-12T12:00:00Z' },
];
const inbound = [
  { id: 'i1', submission_id: 's1', from_email: 'amina@example.com', from_name: 'Amina', subject: 'Re: Thanks', body_text: 'Great', body_html: null, received_at: '2026-09-11T09:00:00Z', is_read: false, is_important: false, status: 'processed', spam_score: 0.5, spam_reasons: null, sender_verified: true, inbound_attachments: [] },
  { id: 'i2', submission_id: 's1', from_email: 'x@spam.io', from_name: null, subject: 'WIN', body_text: 'lottery', body_html: null, received_at: '2026-09-11T10:00:00Z', is_read: false, is_important: false, status: 'spam', spam_score: 8, spam_reasons: ['keywords'], sender_verified: false, inbound_attachments: [] },
];

describe('buildThread', () => {
  it('interleaves original, outbound and inbound in time order', () => {
    const t = buildThread(submission, replies, inbound);
    expect(t.map((i) => `${i.kind}:${i.id}`)).toEqual(['original:s1', 'outbound:r1', 'inbound:i1', 'inbound:i2', 'outbound:r2']);
  });
  it('carries delivery state and relay source on outbound items', () => {
    const t = buildThread(submission, replies, inbound);
    const r2 = t.find((i) => i.id === 'r2');
    expect(r2).toMatchObject({ kind: 'outbound', emailStatus: 'sent', source: 'email_relay' });
  });
  it('marks spam and quarantined inbound as held with a reason', () => {
    const t = buildThread(submission, replies, inbound);
    expect(t.find((i) => i.id === 'i2')).toMatchObject({ kind: 'inbound', held: true, heldReason: 'keywords' });
    expect(t.find((i) => i.id === 'i1')).toMatchObject({ kind: 'inbound', held: false });
  });
});

describe('threadSummary', () => {
  it('counts unread non-held inbound and knows when the visitor spoke last', () => {
    const t = buildThread(submission, replies, inbound);
    expect(threadSummary(t)).toEqual({ unreadInbound: 1, awaitingReply: false, lastAt: '2026-09-12T12:00:00Z' });
    expect(threadSummary(buildThread(submission, [replies[0]], inbound))).toMatchObject({ awaitingReply: true });
    expect(threadSummary(buildThread(submission, [], []))).toMatchObject({ awaitingReply: true, lastAt: submission.created_at });
  });
});
