import { type Range, rangeWindow, countBetween, deltaPct, bucketByDay, medianResponseMinutes, deliveryFunnel, countBy, toCsv } from './analyticsMath';

export interface Series { current: number; previous: number; delta: number | null }
export interface AnalyticsMetrics {
  range: Range;
  window: ReturnType<typeof rangeWindow>;
  submissions: Series & { byDay: Array<{ date: string; count: number }>; byStatus: Array<{ key: string; count: number }>; byPriority: Array<{ key: string; count: number }> };
  inbound: Series;
  replies: Series & { funnel: ReturnType<typeof deliveryFunnel> };
  responseMinutes: number | null;
}

const STATUS_ORDER = ['new', 'in_progress', 'responded', 'closed'];
const PRIORITY_ORDER = ['low', 'normal', 'high', 'urgent'];
const CSV_COLUMNS = ['id', 'created_at', 'name', 'email', 'phone', 'subject', 'status', 'priority', 'responded_at', 'archived'];

function series(rows: Record<string, unknown>[], w: ReturnType<typeof rangeWindow>, key: string): Series {
  const current = countBetween(rows, w.start, w.end, key);
  const previous = countBetween(rows, w.prevStart, w.prevEnd, key);
  return { current, previous, delta: deltaPct(current, previous) };
}

export class AnalyticsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private client: any) {}

  async getMetrics(range: Range, now: Date = new Date()): Promise<AnalyticsMetrics> {
    const w = rangeWindow(range, now);
    const since = w.prevStart.toISOString();
    const [s, r, i] = await Promise.all([
      this.client.from('submissions').select('id, status, priority, created_at, responded_at').gte('created_at', since),
      this.client.from('submission_replies').select('id, created_at, email_status').gte('created_at', since),
      this.client.from('inbound_replies').select('id, received_at, status').gte('received_at', since).in('status', ['received', 'processing', 'processed']),
    ]);
    for (const q of [s, r, i]) if (q.error) throw new Error(q.error.message);
    const subs = s.data ?? []; const reps = r.data ?? []; const inb = i.data ?? [];
    const inWindow = subs.filter((x: { created_at: string }) => x.created_at >= w.start.toISOString());
    const repsInWindow = reps.filter((x: { created_at: string }) => x.created_at >= w.start.toISOString());
    return {
      range,
      window: w,
      submissions: { ...series(subs, w, 'created_at'), byDay: bucketByDay(inWindow, w.start, w.end), byStatus: countBy(inWindow, 'status', STATUS_ORDER), byPriority: countBy(inWindow, 'priority', PRIORITY_ORDER) },
      inbound: series(inb, w, 'received_at'),
      replies: { ...series(reps, w, 'created_at'), funnel: deliveryFunnel(repsInWindow) },
      responseMinutes: medianResponseMinutes(inWindow),
    };
  }

  /** Exported columns are deliberate: internal notes and message bodies stay in the CRM. */
  async exportSubmissionsCsv(range: Range, now: Date = new Date()): Promise<string> {
    const w = rangeWindow(range, now);
    const { data, error } = await this.client.from('submissions').select(CSV_COLUMNS.join(', ')).gte('created_at', w.start.toISOString()).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return toCsv(data ?? [], CSV_COLUMNS);
  }
}

export function downloadText(text: string, filename: string, type = 'text/csv;charset=utf-8;'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
