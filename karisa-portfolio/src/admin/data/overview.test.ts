import { describe, it, expect } from 'vitest';
import { computeOverview, buildActivity } from './overview';
import { decorateRow } from './submissionsQuery';

const now = new Date('2026-09-17T12:00:00Z');
const row = (o: Record<string, unknown>) => decorateRow({ id: 'x', name: 'N', email: 'n@e.com', subject: 's', status: 'new', priority: 'normal', archived: false, created_at: '2026-09-16T10:00:00Z', submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [], ...o } as any);

describe('computeOverview', () => {
  it('counts what needs Karisa and what happened this week', () => {
    const rows = [
      row({ id: '1' }),
      row({ id: '2', status: 'responded', responded_at: '2026-09-15T10:00:00Z', inbound_replies: [{ id: 'i', is_read: false, received_at: '2026-09-16T11:00:00Z', status: 'processed' }] }),
      row({ id: '3', status: 'closed', created_at: '2026-08-01T10:00:00Z' }),
      row({ id: '4', archived: true }),
    ];
    expect(computeOverview(rows, now)).toEqual({ awaiting: 2, unreadInbound: 1, newThisWeek: 2, respondedThisWeek: 1 });
  });
});

describe('buildActivity', () => {
  it('merges submissions, inbound and outbound newest first', () => {
    const rows = [row({ id: '1', name: 'Amina', created_at: '2026-09-10T10:00:00Z' })];
    const replies = [{ id: 'r1', submission_id: '1', created_at: '2026-09-11T10:00:00Z', email_status: 'delivered' }];
    const inbound = [{ id: 'i1', submission_id: '1', received_at: '2026-09-12T10:00:00Z', from_name: 'Amina', from_email: 'a@e.com', status: 'processed' }];
    const feed = buildActivity(rows, replies, inbound, 10);
    expect(feed.map((f) => f.what)).toEqual(['replied', 'you replied', 'submitted']);
    expect(feed[1]).toMatchObject({ state: 'delivered', submissionId: '1' });
  });
});
