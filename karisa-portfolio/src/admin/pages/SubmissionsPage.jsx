import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageHead from '../components/PageHead';
import StateMark from '../components/StateMark';
import Icon from '../components/Icon';
import { TableSkeleton } from '../components/Skeleton';
import BulkActionsBar from '../components/BulkActionsBar';
import { parseFilters, serializeFilters, applyFilters, decorateRow, SUBMISSIONS_SELECT, DEFAULT_FILTERS } from '../data/submissionsQuery';
import { formatRelative } from '../data/format';

const POLL_MS = 60000;

export const SubmissionsPage = ({ client }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [rows, setRows] = useState(null);           // null = loading
  const [labels, setLabels] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [loadError, setLoadError] = useState(null);

  const setFilters = (next) => setSearchParams(serializeFilters({ ...filters, ...next }), { replace: true });

  const fetchRows = useCallback(async () => {
    if (!client) return;
    const { data, error } = await client.from('submissions').select(SUBMISSIONS_SELECT).order('created_at', { ascending: false });
    if (error) { setLoadError(error.message); return; }
    setLoadError(null);
    setRows((data ?? []).map(decorateRow));
  }, [client]);

  useEffect(() => {
    if (!client) return undefined;
    fetchRows();
    client.from('labels').select('id, name, color').order('name').then(({ data }) => setLabels(data ?? []));
    const channel = client
      .channel('admin-submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, fetchRows)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_replies' }, fetchRows)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submission_replies' }, fetchRows)
      .subscribe();
    const poll = setInterval(fetchRows, POLL_MS);
    return () => { clearInterval(poll); client.removeChannel(channel); };
  }, [client, fetchRows]);

  const visible = useMemo(() => (rows ? applyFilters(rows, filters) : []), [rows, filters]);
  const awaitingCount = useMemo(() => (rows ?? []).filter((r) => !r.archived && r.awaiting).length, [rows]);
  const isFiltered = serializeFilters(filters).toString() !== '';

  const toggle = (id, on) => setSelected((prev) => { const n = new Set(prev); on ? n.add(id) : n.delete(id); return n; });
  const toggleAll = (on) => setSelected(on ? new Set(visible.map((r) => r.id)) : new Set());

  const bulk = async (label, fn) => {
    const ids = Array.from(selected);
    const { error } = await fn(ids);
    if (error) { toast.error(`${label} failed: ${error.message}`); return; }
    toast.success(`${label} ${ids.length} submission${ids.length === 1 ? '' : 's'}`);
    setSelected(new Set());
    fetchRows();
  };

  const bulkActions = {
    onStatus: (status) => bulk('Updated', (ids) => client.from('submissions').update({ status }).in('id', ids)),
    onArchive: () => bulk('Archived', (ids) => client.from('submissions').update({ archived: true, archived_at: new Date().toISOString() }).in('id', ids)),
    onDelete: () => bulk('Deleted', (ids) => client.from('submissions').delete().in('id', ids)),
    onLabel: (labelId) => bulk('Labelled', (ids) => client.from('submission_labels').upsert(ids.map((id) => ({ submission_id: id, label_id: labelId })), { onConflict: 'submission_id,label_id' })),
    onClear: () => setSelected(new Set()),
  };

  const labelById = useMemo(() => Object.fromEntries(labels.map((l) => [l.id, l])), [labels]);

  return (
    <div className="pb-24">
      <PageHead
        title="Submissions"
        meta={rows ? `${visible.length} shown · ${awaitingCount} awaiting you` : null}
        actions={<button type="button" onClick={fetchRows} className="btn-quiet"><Icon name="refresh" className="h-4 w-4" />Refresh</button>}
      />

      <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="q" className="field-label">Search</label>
          <input id="q" type="search" value={filters.q} onChange={(e) => setFilters({ q: e.target.value })} placeholder="Name, email or subject" className="field-sm" />
        </div>
        <div>
          <label htmlFor="status" className="field-label">Status</label>
          <select id="status" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })} className="field-sm">
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label htmlFor="box" className="field-label">Box</label>
          <select id="box" value={filters.box} onChange={(e) => setFilters({ box: e.target.value })} className="field-sm">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="field-label">Order</label>
          <select id="sort" value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value })} className="field-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm text-mark-700">
          <input type="checkbox" checked={filters.waiting} onChange={(e) => setFilters({ waiting: e.target.checked })} className="h-4 w-4 accent-pindo" />
          Awaiting me only
        </label>
      </form>

      {loadError && <p role="alert" className="mb-4 border border-alarm px-4 py-3 text-sm text-alarm">Could not load submissions: {loadError}. <button type="button" onClick={fetchRows} className="link">Try again</button></p>}

      {rows === null ? (
        <TableSkeleton rows={6} cols={5} />
      ) : visible.length === 0 ? (
        <div className="adm-card px-6 py-12 text-center">
          <p className="text-mark-700">{isFiltered ? 'No submissions match these filters.' : 'No submissions yet. The contact form on the site lands here.'}</p>
          {isFiltered && <button type="button" onClick={() => setSearchParams(serializeFilters(DEFAULT_FILTERS), { replace: true })} className="btn-quiet mt-4">Clear filters</button>}
        </div>
      ) : (
        <>
          {/* Stacked rows below md — tabular content is never a horizontal scroller. */}
          <ul className="divide-y divide-cloth-300 border-t border-cloth-300 md:hidden">
            {visible.map((r) => (
              <li key={r.id} className="flex gap-3 py-3">
                <input type="checkbox" aria-label={`Select ${r.name}`} checked={selected.has(r.id)} onChange={(e) => toggle(r.id, e.target.checked)} className="mt-1 h-4 w-4 accent-pindo" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link to={`/admin/submissions/${r.id}`} className="truncate font-medium text-mark-900 hover:text-pindo">{r.name}</Link>
                    <time dateTime={r.created_at} className="shrink-0 text-xs text-mark-500">{formatRelative(r.created_at)}</time>
                  </div>
                  <p className="truncate text-sm text-mark-700">{r.subject}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <StateMark state={r.status} />
                    {r.awaiting && <StateMark state="waiting" />}
                    {r.inboundUnread > 0 && <span className="tabular text-xs text-mark-600">{r.inboundUnread} unread</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <table className="adm-table">
              <caption className="sr-only">Contact submissions</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-8"><input type="checkbox" aria-label="Select all shown" checked={selected.size > 0 && selected.size === visible.length} onChange={(e) => toggleAll(e.target.checked)} className="h-4 w-4 accent-pindo" /></th>
                  <th scope="col">From</th>
                  <th scope="col">Subject</th>
                  <th scope="col">State</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Labels</th>
                  <th scope="col" className="text-right">Replies</th>
                  <th scope="col">Received</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td><input type="checkbox" aria-label={`Select ${r.name}`} checked={selected.has(r.id)} onChange={(e) => toggle(r.id, e.target.checked)} className="h-4 w-4 accent-pindo" /></td>
                    <td>
                      <Link to={`/admin/submissions/${r.id}`} className="font-medium text-mark-900 hover:text-pindo">{r.name}</Link>
                      <p className="text-xs text-mark-500">{r.email}</p>
                    </td>
                    <td className="max-w-xs"><p className="truncate" title={r.subject}>{r.subject}</p></td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <StateMark state={r.status} />
                        {r.awaiting && <StateMark state="waiting" />}
                      </div>
                    </td>
                    <td className="capitalize text-mark-700">{r.priority || 'normal'}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {r.labelIds.slice(0, 2).map((id) => labelById[id] && (
                          <span key={id} className="adm-chip"><span className="h-2 w-2" style={{ background: labelById[id].color }} aria-hidden="true" />{labelById[id].name}</span>
                        ))}
                        {r.labelIds.length > 2 && <span className="text-xs text-mark-500">+{r.labelIds.length - 2}</span>}
                      </div>
                    </td>
                    <td className="text-right">
                      {r.replyCount}
                      {r.inboundUnread > 0 && <span className="ml-2 text-xs text-pindo">{r.inboundUnread} unread</span>}
                    </td>
                    <td><time dateTime={r.created_at} className="text-mark-700">{formatRelative(r.created_at)}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selected.size > 0 && <BulkActionsBar count={selected.size} labels={labels} {...bulkActions} />}
    </div>
  );
};

export default SubmissionsPage;
