export type Range = '7d' | '30d' | '90d' | 'all';

const DAY_MS = 86400000;
const DAYS: Record<Exclude<Range, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

export function rangeWindow(range: Range, now: Date = new Date()) {
  if (range === 'all') {
    const start = new Date(0);
    return { start, end: now, prevStart: start, prevEnd: start };
  }
  const span = DAYS[range] * DAY_MS;
  const start = new Date(now.getTime() - span);
  return { start, end: now, prevStart: new Date(start.getTime() - span), prevEnd: start };
}

export function countBetween<T extends Record<string, unknown>>(rows: T[], start: Date, end: Date, key = 'created_at'): number {
  const s = start.toISOString(); const e = end.toISOString();
  return rows.filter((r) => { const v = r[key] as string; return v >= s && v < e; }).length;
}

export function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function utcDay(d: Date): string { return d.toISOString().slice(0, 10); }

export function bucketByDay<T extends Record<string, unknown>>(rows: T[], start: Date, end: Date, key = 'created_at'): Array<{ date: string; count: number }> {
  const dayStart = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  // Calendar days, not 24h steps: an N-day window touches N+1 UTC days. Cap 91 so '90d' keeps its partial first day.
  const days = Math.min(91, Math.max(1, Math.round((dayStart(end) - dayStart(start)) / DAY_MS) + 1));
  const first = new Date(dayStart(end) - (days - 1) * DAY_MS);
  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) counts.set(utcDay(new Date(first.getTime() + i * DAY_MS)), 0);
  for (const r of rows) {
    const day = String(r[key]).slice(0, 10);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return Array.from(counts, ([date, count]) => ({ date, count }));
}

export function medianResponseMinutes(subs: Array<{ created_at: string; responded_at: string | null }>): number | null {
  const mins = subs.filter((s) => s.responded_at).map((s) => (new Date(s.responded_at as string).getTime() - new Date(s.created_at).getTime()) / 60000).sort((a, b) => a - b);
  if (mins.length === 0) return null;
  const mid = Math.floor(mins.length / 2);
  return mins.length % 2 ? Math.round(mins[mid]) : Math.round((mins[mid - 1] + mins[mid]) / 2);
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 24 * 60) return `${(minutes / 60).toFixed(1).replace(/\.0$/, '')} h`;
  return `${(minutes / (24 * 60)).toFixed(1).replace(/\.0$/, '')} d`;
}

export function deliveryFunnel(replies: Array<{ email_status: string | null }>) {
  const n = (...s: string[]) => replies.filter((r) => s.includes(r.email_status ?? 'pending')).length;
  return {
    total: replies.length,
    sent: n('sent', 'delivered', 'opened', 'clicked'),
    delivered: n('delivered', 'opened', 'clicked'),
    opened: n('opened', 'clicked'),
    bounced: n('bounced'),
    failed: n('failed'),
    pending: n('pending'),
  };
}

export function countBy<T extends Record<string, unknown>>(rows: T[], key: string, order: string[]): Array<{ key: string; count: number }> {
  return order.map((k) => ({ key: k, count: rows.filter((r) => (r[key] ?? 'normal') === k).length }));
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [columns.join(','), ...rows.map((r) => columns.map((c) => cell(r[c])).join(','))].join('\r\n');
}
