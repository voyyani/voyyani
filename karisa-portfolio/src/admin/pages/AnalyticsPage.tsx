import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import PageHead from '../components/PageHead';
import { Skeleton } from '../components/Skeleton';
import Icon from '../components/Icon';
import DailyChart from '../components/DailyChart';
import { AnalyticsService, downloadText, type AnalyticsMetrics } from '../../utils/analyticsService';
import { formatDuration, type Range } from '../../utils/analyticsMath';

const RANGES: Array<[Range, string]> = [['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days'], ['all', 'All time']];
const WORDS: Record<string, string> = { new: 'New', in_progress: 'In progress', responded: 'Responded', closed: 'Closed', low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' };

function Delta({ delta, range }: { delta: number | null; range: Range }) {
  if (range === 'all') return <span className="text-xs text-mark-500">all time</span>;
  const period = RANGES.find((r) => r[0] === range)?.[1];
  if (delta === null) return <span className="text-xs text-mark-500">no previous {period}</span>;
  return <span className="tabular text-xs text-mark-600">{delta > 0 ? '+' : ''}{delta}% vs previous {period}</span>;
}

function Figure({ value, label, children }: { value: React.ReactNode; label: string; children?: React.ReactNode }) {
  return (
    <div className="bg-cloth-100 px-4 py-4">
      <p className="adm-figure">{value}</p>
      <p className="mt-2 text-label uppercase tracking-[0.09em] text-mark-500">{label}</p>
      {children && <p className="mt-1">{children}</p>}
    </div>
  );
}

function Breakdown({ title, rows, total }: { title: string; rows: Array<{ key: string; count: number }>; total: number }) {
  return (
    <div className="adm-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <table className="w-full text-sm">
        <caption className="sr-only">{title}</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-cloth-300">
              <th scope="row" className="py-2 pr-3 text-left font-normal text-mark-700">{WORDS[r.key] ?? r.key}</th>
              <td className="w-full py-2"><div className="h-2 bg-cloth-200"><div className="h-2 bg-pindo" style={{ width: total ? `${(r.count / total) * 100}%` : 0 }} /></div></td>
              <td className="tabular py-2 pl-3 text-right">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AnalyticsPage({ client }: { client: any }) {
  const [range, setRange] = useState<Range>('30d');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setMetrics(null);
    try { setMetrics(await new AnalyticsService(client).getMetrics(range)); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unknown error'); }
  }, [client, range]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    try {
      const csv = await new AnalyticsService(client).exportSubmissionsCsv(range);
      downloadText(csv, `submissions-${range}-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('CSV downloaded');
    } catch (e) { toast.error(`Export failed: ${e instanceof Error ? e.message : 'unknown error'}`); }
  };

  const m = metrics;
  const f = m?.replies.funnel;
  const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '—');

  return (
    <div>
      <PageHead title="Analytics" actions={<button type="button" onClick={exportCsv} className="btn-quiet"><Icon name="paperclip" className="h-4 w-4" />Export CSV</button>} />

      <div role="group" aria-label="Period" className="mb-6 flex flex-wrap gap-2">
        {RANGES.map(([value, word]) => (
          <button key={value} type="button" aria-pressed={range === value} onClick={() => setRange(value)} className={`btn-quiet ${range === value ? 'border-pindo bg-pindo-wash text-pindo' : ''}`}>{word}</button>
        ))}
      </div>

      {error && <p role="alert" className="mb-4 border border-alarm px-4 py-3 text-sm text-alarm">Could not load analytics: {error}. <button type="button" onClick={load} className="link">Try again</button></p>}

      <div className="grid gap-px border-y border-cloth-300 bg-cloth-300 sm:grid-cols-2 lg:grid-cols-4">
        {m ? (
          <>
            <Figure value={m.submissions.current} label="Submissions"><Delta delta={m.submissions.delta} range={range} /></Figure>
            <Figure value={m.inbound.current} label="Replies received"><Delta delta={m.inbound.delta} range={range} /></Figure>
            <Figure value={m.replies.current} label="Replies sent"><Delta delta={m.replies.delta} range={range} /></Figure>
            <Figure value={formatDuration(m.responseMinutes)} label="Median first reply"><span className="text-xs text-mark-500">from enquiry to your first reply</span></Figure>
          </>
        ) : Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-cloth-100 px-4 py-4"><Skeleton className="h-8 w-14" /><Skeleton className="mt-3 h-3 w-24" /></div>)}
      </div>

      <section aria-labelledby="chart-h" className="mt-8">
        <h2 id="chart-h" className="mb-3 text-lg font-semibold">Submissions per day</h2>
        {m ? <DailyChart data={m.submissions.byDay} label="Submissions per day" /> : <Skeleton className="h-44 w-full" />}
      </section>

      {m && (
        <>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Breakdown title="By status" rows={m.submissions.byStatus} total={m.submissions.current} />
            <Breakdown title="By priority" rows={m.submissions.byPriority} total={m.submissions.current} />
          </div>

          <section aria-labelledby="delivery-h" className="mt-8">
            <h2 id="delivery-h" className="mb-3 text-lg font-semibold">Delivery of replies you sent</h2>
            {f && f.total === 0 ? (
              <p className="border border-cloth-300 px-4 py-8 text-center text-sm text-mark-700">No replies sent in this period.</p>
            ) : f && (
              <div className="grid gap-px border-y border-cloth-300 bg-cloth-300 sm:grid-cols-3 lg:grid-cols-5">
                <Figure value={f.sent} label="Sent"><span className="tabular text-xs text-mark-500">{pct(f.sent, f.total)} of {f.total}</span></Figure>
                <Figure value={f.delivered} label="Delivered"><span className="tabular text-xs text-mark-500">{pct(f.delivered, f.sent)} of sent</span></Figure>
                <Figure value={f.opened} label="Opened"><span className="tabular text-xs text-mark-500">{pct(f.opened, f.delivered)} of delivered</span></Figure>
                <Figure value={f.bounced + f.failed} label="Bounced or failed"><span className="text-xs text-mark-500">check the address</span></Figure>
                <Figure value={f.pending} label="Queued"><span className="text-xs text-mark-500">awaiting Resend</span></Figure>
              </div>
            )}
            <p className="mt-2 text-xs text-mark-500">Delivery and open events arrive through the Resend status webhook; "Opened" undercounts clients that block tracking pixels.</p>
          </section>
        </>
      )}
    </div>
  );
}
