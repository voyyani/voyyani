import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHead from '../components/PageHead';
import StateMark from '../components/StateMark';
import { Skeleton } from '../components/Skeleton';
import { decorateRow, SUBMISSIONS_SELECT } from '../data/submissionsQuery';
import { computeOverview, buildActivity } from '../data/overview';
import { formatRelative } from '../data/format';

const Figure = ({ value, label, to }) => {
  const inner = (
    <>
      <p className="adm-figure">{value}</p>
      <p className="mt-2 text-label uppercase tracking-[0.09em] text-mark-500">{label}</p>
    </>
  );
  return to
    ? <Link to={to} className="block bg-cloth-100 px-4 py-4 transition-colors duration-250 ease-press hover:bg-cloth-200 hover:text-pindo">{inner}</Link>
    : <div className="bg-cloth-100 px-4 py-4">{inner}</div>;
};

export default function AdminDashboard({ client }) {
  const [rows, setRows] = useState(null);
  const [replies, setReplies] = useState([]);
  const [inbound, setInbound] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!client) return;
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [s, r, i] = await Promise.all([
      client.from('submissions').select(SUBMISSIONS_SELECT).order('created_at', { ascending: false }),
      client.from('submission_replies').select('id, submission_id, created_at, email_status').gte('created_at', since).order('created_at', { ascending: false }).limit(50),
      client.from('inbound_replies').select('id, submission_id, received_at, from_name, from_email, status').gte('received_at', since).order('received_at', { ascending: false }).limit(50),
    ]);
    if (s.error) { setError(s.error.message); return; }
    setError(null);
    setRows((s.data ?? []).map(decorateRow));
    setReplies(r.data ?? []);
    setInbound(i.data ?? []);
  }, [client]);

  useEffect(() => {
    if (!client) return undefined;
    load();
    const channel = client.channel('admin-overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_replies' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submission_replies' }, load)
      .subscribe();
    return () => client.removeChannel(channel);
  }, [client, load]);

  const overview = useMemo(() => (rows ? computeOverview(rows) : null), [rows]);
  const feed = useMemo(() => (rows ? buildActivity(rows, replies, inbound, 10) : []), [rows, replies, inbound]);

  return (
    <div>
      <PageHead title="Overview" meta={rows ? `${rows.filter((r) => !r.archived).length} active submissions` : null} />

      {error && <p role="alert" className="mb-4 border border-alarm px-4 py-3 text-sm text-alarm">Could not load the overview: {error}. <button type="button" onClick={load} className="link">Try again</button></p>}

      {/* The band: measured facts in one shape, separated by printed rules. */}
      <div className="grid gap-px border-y border-cloth-300 bg-cloth-300 sm:grid-cols-2 lg:grid-cols-4">
        {overview ? (
          <>
            <Figure value={overview.awaiting} label="Awaiting you" to="/admin/submissions?waiting=1" />
            <Figure value={overview.unreadInbound} label="Unread replies" to="/admin/submissions?waiting=1" />
            <Figure value={overview.newThisWeek} label="New this week" to="/admin/submissions" />
            <Figure value={overview.respondedThisWeek} label="Answered this week" to="/admin/submissions?status=responded" />
          </>
        ) : Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-cloth-100 px-4 py-4"><Skeleton className="h-8 w-12" /><Skeleton className="mt-3 h-3 w-24" /></div>)}
      </div>

      <section aria-labelledby="activity-h" className="mt-8">
        <h2 id="activity-h" className="mb-3 text-lg font-semibold">Last 30 days</h2>
        {rows === null ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : feed.length === 0 ? (
          <p className="adm-card px-4 py-8 text-center text-mark-700">Nothing has happened in the last 30 days. New enquiries from the site will appear here.</p>
        ) : (
          <ol className="divide-y divide-cloth-300 border-y border-cloth-300">
            {feed.map((f) => (
              <li key={f.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-sm">
                <time dateTime={f.at} className="tabular w-20 shrink-0 text-xs text-mark-500">{formatRelative(f.at)}</time>
                <Link to={`/admin/submissions/${f.submissionId}`} className="font-medium text-mark-900 hover:text-pindo">{f.who}</Link>
                <span className="text-mark-700">{f.what}</span>
                {f.state && <StateMark state={f.state} className="ml-auto" />}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
