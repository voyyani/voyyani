export type Status = 'new' | 'in_progress' | 'responded' | 'closed';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface ListFilters {
  status: 'all' | Status;
  box: 'active' | 'archived' | 'all';
  q: string;
  sort: 'newest' | 'oldest';
  waiting: boolean;
}

export const DEFAULT_FILTERS: ListFilters = { status: 'all', box: 'active', q: '', sort: 'newest', waiting: false };

const STATUSES = new Set(['all', 'new', 'in_progress', 'responded', 'closed']);
const BOXES = new Set(['active', 'archived', 'all']);
const SORTS = new Set(['newest', 'oldest']);

export function parseFilters(params: URLSearchParams): ListFilters {
  const status = params.get('status') ?? '';
  const box = params.get('box') ?? '';
  const sort = params.get('sort') ?? '';
  return {
    status: (STATUSES.has(status) ? status : 'all') as ListFilters['status'],
    box: (BOXES.has(box) ? box : 'active') as ListFilters['box'],
    q: params.get('q') ?? '',
    sort: (SORTS.has(sort) ? sort : 'newest') as ListFilters['sort'],
    waiting: params.get('waiting') === '1',
  };
}

export function serializeFilters(f: ListFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.status !== 'all') p.set('status', f.status);
  if (f.box !== 'active') p.set('box', f.box);
  if (f.q) p.set('q', f.q);
  if (f.sort !== 'newest') p.set('sort', f.sort);
  if (f.waiting) p.set('waiting', '1');
  return p;
}

/** One select string for every list query, so the row shape is the same everywhere. */
export const SUBMISSIONS_SELECT =
  'id, name, email, phone, subject, message, status, priority, notes, archived, archived_at, responded_at, created_at, updated_at, ' +
  'submission_replies(count), inbound_replies(id, is_read, received_at, status), submission_labels(label_id)';

export interface RawSubmissionRow {
  id: string; name: string; email: string; phone?: string | null; subject: string; message?: string;
  status: Status; priority: Priority | null; notes?: string | null; archived: boolean | null;
  archived_at?: string | null; responded_at?: string | null; created_at: string; updated_at?: string;
  submission_replies?: Array<{ count: number }>;
  inbound_replies?: Array<{ id: string; is_read: boolean; received_at: string; status: string }>;
  submission_labels?: Array<{ label_id: string }>;
}

export interface SubmissionRow extends RawSubmissionRow {
  replyCount: number;
  inboundUnread: number;
  lastInboundAt: string | null;
  awaiting: boolean;
  labelIds: string[];
}

const LIVE_INBOUND = new Set(['received', 'processing', 'processed']);

export function decorateRow(row: RawSubmissionRow): SubmissionRow {
  const live = (row.inbound_replies ?? []).filter((r) => LIVE_INBOUND.has(r.status));
  const inboundUnread = live.filter((r) => !r.is_read).length;
  const lastInboundAt = live.reduce<string | null>((m, r) => (m === null || r.received_at > m ? r.received_at : m), null);
  const awaiting = row.status !== 'closed' && (row.status === 'new' || inboundUnread > 0);
  return {
    ...row,
    replyCount: row.submission_replies?.[0]?.count ?? 0,
    inboundUnread,
    lastInboundAt,
    awaiting,
    labelIds: (row.submission_labels ?? []).map((l) => l.label_id),
  };
}

export function applyFilters(rows: SubmissionRow[], f: ListFilters): SubmissionRow[] {
  const q = f.q.trim().toLowerCase();
  const out = rows.filter((r) => {
    if (f.box === 'active' && r.archived) return false;
    if (f.box === 'archived' && !r.archived) return false;
    if (f.status !== 'all' && r.status !== f.status) return false;
    if (f.waiting && !r.awaiting) return false;
    if (q && !(r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q))) return false;
    return true;
  });
  return out.sort((a, b) => (f.sort === 'newest' ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at)));
}
