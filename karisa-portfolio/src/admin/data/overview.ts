import type { SubmissionRow } from './submissionsQuery';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeOverview(rows: SubmissionRow[], now: Date = new Date()) {
  const weekAgo = new Date(now.getTime() - WEEK_MS).toISOString();
  const active = rows.filter((r) => !r.archived);
  return {
    awaiting: active.filter((r) => r.awaiting).length,
    unreadInbound: active.reduce((n, r) => n + r.inboundUnread, 0),
    newThisWeek: active.filter((r) => r.created_at >= weekAgo).length,
    respondedThisWeek: active.filter((r) => r.responded_at && r.responded_at >= weekAgo).length,
  };
}

export interface ActivityItem { id: string; at: string; submissionId: string; who: string; what: 'submitted' | 'replied' | 'you replied'; state?: string }

export function buildActivity(
  rows: SubmissionRow[],
  replies: Array<{ id: string; submission_id: string; created_at: string; email_status: string | null }>,
  inbound: Array<{ id: string; submission_id: string; received_at: string; from_name: string | null; from_email: string; status: string }>,
  limit = 10
): ActivityItem[] {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const name = (id: string) => byId.get(id)?.name ?? 'Unknown';
  const items: ActivityItem[] = [
    ...rows.map<ActivityItem>((r) => ({ id: `s-${r.id}`, at: r.created_at, submissionId: r.id, who: r.name, what: 'submitted', state: r.status })),
    ...replies.map<ActivityItem>((r) => ({ id: `r-${r.id}`, at: r.created_at, submissionId: r.submission_id, who: name(r.submission_id), what: 'you replied', state: r.email_status ?? 'pending' })),
    ...inbound.filter((i) => !['spam', 'quarantined', 'failed'].includes(i.status))
      .map<ActivityItem>((i) => ({ id: `i-${i.id}`, at: i.received_at, submissionId: i.submission_id, who: i.from_name ?? name(i.submission_id), what: 'replied' })),
  ];
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
