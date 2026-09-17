import { describe, it, expect } from 'vitest';
import { parseFilters, serializeFilters, applyFilters, decorateRow, DEFAULT_FILTERS } from './submissionsQuery';

const raw = (over: Record<string, unknown>) => ({
  id: 'a', name: 'Amina', email: 'amina@example.com', subject: 'Website', status: 'new',
  priority: 'normal', archived: false, created_at: '2026-09-10T10:00:00Z',
  submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [],
  ...over,
});

describe('parseFilters / serializeFilters', () => {
  it('round-trips non-default filters and drops defaults', () => {
    const f = { ...DEFAULT_FILTERS, status: 'closed' as const, q: 'amina', waiting: true };
    const s = serializeFilters(f).toString();
    expect(s).toBe('status=closed&q=amina&waiting=1');
    expect(parseFilters(new URLSearchParams(s))).toEqual(f);
  });
  it('ignores garbage values', () => {
    expect(parseFilters(new URLSearchParams('status=nope&sort=sideways&box=x'))).toEqual(DEFAULT_FILTERS);
  });
});

describe('decorateRow', () => {
  it('derives counts and the awaiting flag', () => {
    const row = decorateRow(raw({
      status: 'responded',
      submission_replies: [{ count: 2 }],
      inbound_replies: [
        { id: 'i1', is_read: false, received_at: '2026-09-12T08:00:00Z', status: 'processed' },
        { id: 'i2', is_read: true, received_at: '2026-09-11T08:00:00Z', status: 'processed' },
        { id: 'i3', is_read: false, received_at: '2026-09-13T08:00:00Z', status: 'spam' },
      ],
      submission_labels: [{ label_id: 'l1' }],
    }));
    expect(row.replyCount).toBe(2);
    expect(row.inboundUnread).toBe(1);          // spam does not count
    expect(row.lastInboundAt).toBe('2026-09-12T08:00:00Z');
    expect(row.awaiting).toBe(true);
    expect(row.labelIds).toEqual(['l1']);
  });
  it('a new submission with no traffic is awaiting; a closed one never is', () => {
    expect(decorateRow(raw({})).awaiting).toBe(true);
    expect(decorateRow(raw({ status: 'closed', inbound_replies: [{ id: 'i', is_read: false, received_at: 'x', status: 'processed' }] })).awaiting).toBe(false);
  });
});

describe('applyFilters', () => {
  const rows = [
    decorateRow(raw({ id: '1', created_at: '2026-09-10T10:00:00Z' })),
    decorateRow(raw({ id: '2', status: 'responded', created_at: '2026-09-11T10:00:00Z' })),
    decorateRow(raw({ id: '3', status: 'closed', archived: true, name: 'Brian', created_at: '2026-09-12T10:00:00Z' })),
  ];
  it('hides archived by default and sorts newest first', () => {
    expect(applyFilters(rows, DEFAULT_FILTERS).map((r) => r.id)).toEqual(['2', '1']);
  });
  it('combines status, waiting and search without mutating input', () => {
    const before = rows.map((r) => r.id);
    expect(applyFilters(rows, { ...DEFAULT_FILTERS, waiting: true }).map((r) => r.id)).toEqual(['1']);
    expect(applyFilters(rows, { ...DEFAULT_FILTERS, box: 'all', q: 'brian' }).map((r) => r.id)).toEqual(['3']);
    expect(applyFilters(rows, { ...DEFAULT_FILTERS, sort: 'oldest' }).map((r) => r.id)).toEqual(['1', '2']);
    expect(rows.map((r) => r.id)).toEqual(before);
  });
});
