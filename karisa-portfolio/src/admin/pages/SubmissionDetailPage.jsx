import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageHead from '../components/PageHead';
import StateMark from '../components/StateMark';
import Icon from '../components/Icon';
import { ThreadSkeleton } from '../components/Skeleton';
import ConversationThread from '../components/ConversationThread';
import ReplyComposer from '../components/ReplyComposer';
import { buildThread, threadSummary } from '../data/thread';
import { formatDateTime } from '../data/format';
import { markEmailAsRead } from '@/hooks/useInboundEmails';

const STATUSES = [['new', 'New'], ['in_progress', 'In progress'], ['responded', 'Responded'], ['closed', 'Closed']];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export default function SubmissionDetailPage({ client }) {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [replies, setReplies] = useState([]);
  const [inbound, setInbound] = useState([]);
  const [labels, setLabels] = useState([]);
  const [labelIds, setLabelIds] = useState([]);
  const [userId, setUserId] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing | error
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    if (!client || !id) return;
    const [s, r, i, l, sl] = await Promise.all([
      client.from('submissions').select('*').eq('id', id).single(),
      client.from('submission_replies').select('*').eq('submission_id', id).order('created_at'),
      client.from('inbound_replies').select('*, inbound_attachments(*)').eq('submission_id', id).order('received_at'),
      client.from('labels').select('id, name, color').order('name'),
      client.from('submission_labels').select('label_id').eq('submission_id', id),
    ]);
    if (s.error || !s.data) { setState(s.error?.code === 'PGRST116' || !s.data ? 'missing' : 'error'); return; }
    setSubmission(s.data);
    setNotes(s.data.notes ?? '');
    setReplies(r.data ?? []);
    setInbound(i.data ?? []);
    setLabels(l.data ?? []);
    setLabelIds((sl.data ?? []).map((x) => x.label_id));
    setState('ready');
  }, [client, id]);

  useEffect(() => {
    if (!client) return undefined;
    client.auth.getUser().then(({ data }) => setUserId(data?.user?.id ?? null));
    load();
    const channel = client
      .channel(`admin-submission-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submission_replies', filter: `submission_id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_replies', filter: `submission_id=eq.${id}` }, load)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'submissions', filter: `id=eq.${id}` }, load)
      .subscribe();
    return () => client.removeChannel(channel);
  }, [client, id, load]);

  // Opening the thread is reading it.
  useEffect(() => {
    if (!userId || state !== 'ready') return;
    inbound.filter((m) => !m.is_read && !['spam', 'quarantined', 'failed'].includes(m.status))
      .forEach((m) => markEmailAsRead(m.id, userId, client));
  }, [inbound, userId, state, client]);

  const items = useMemo(() => (submission ? buildThread(submission, replies, inbound) : []), [submission, replies, inbound]);
  const summary = useMemo(() => threadSummary(items), [items]);

  const patch = async (fields, okMessage) => {
    const { error } = await client.from('submissions').update(fields).eq('id', id);
    if (error) { toast.error(`Could not save: ${error.message}`); return; }
    setSubmission((s) => ({ ...s, ...fields }));
    if (okMessage) toast.success(okMessage);
  };

  const toggleLabel = async (labelId) => {
    const has = labelIds.includes(labelId);
    const q = has
      ? client.from('submission_labels').delete().eq('submission_id', id).eq('label_id', labelId)
      : client.from('submission_labels').insert({ submission_id: id, label_id: labelId });
    const { error } = await q;
    if (error) { toast.error(`Could not update label: ${error.message}`); return; }
    setLabelIds((ids) => (has ? ids.filter((x) => x !== labelId) : [...ids, labelId]));
  };

  if (state === 'missing') {
    return (
      <div>
        <PageHead title="Not found" />
        <p className="text-mark-700">There is no submission with that id. It may have been deleted.</p>
        <Link to="/admin/submissions" className="btn-quiet mt-4"><Icon name="back" className="h-4 w-4" />Back to submissions</Link>
      </div>
    );
  }
  if (state === 'error') {
    return <p role="alert" className="border border-alarm px-4 py-3 text-sm text-alarm">Could not load this submission. <button type="button" onClick={load} className="link">Try again</button></p>;
  }
  if (state === 'loading') {
    return <div className="space-y-6"><div className="adm-skel h-9 w-1/2" /><ThreadSkeleton /></div>;
  }

  return (
    <div>
      <p className="mb-3"><Link to="/admin/submissions" className="link inline-flex items-center gap-1.5 text-sm"><Icon name="back" className="h-4 w-4" />Submissions</Link></p>
      <PageHead
        title={submission.subject}
        meta={<>{submission.name} · <a href={`mailto:${submission.email}`} className="link">{submission.email}</a>{submission.phone ? ` · ${submission.phone}` : ''}</>}
        actions={<>
          <StateMark state={submission.status} />
          {summary.awaitingReply && submission.status !== 'closed' && <StateMark state="waiting" />}
        </>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-label="Conversation" className="min-w-0 space-y-4">
          <ConversationThread items={items} client={client} userId={userId} />
          <ReplyComposer submission={submission} client={client} onSent={load} />
        </section>

        <aside className="space-y-6">
          <div>
            <label htmlFor="status" className="field-label">Status</label>
            <select id="status" value={submission.status} onChange={(e) => patch({ status: e.target.value }, 'Status updated')} className="field-sm">
              {STATUSES.map(([v, w]) => <option key={v} value={v}>{w}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="field-label">Priority</label>
            <select id="priority" value={submission.priority || 'normal'} onChange={(e) => patch({ priority: e.target.value }, 'Priority updated')} className="field-sm capitalize">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {labels.length > 0 && (
            <fieldset>
              <legend className="field-label">Labels</legend>
              <div className="flex flex-wrap gap-2">
                {labels.map((l) => (
                  <button key={l.id} type="button" aria-pressed={labelIds.includes(l.id)} onClick={() => toggleLabel(l.id)} className={`adm-chip ${labelIds.includes(l.id) ? 'border-pindo bg-pindo-wash text-pindo' : ''}`}>
                    <span className="h-2 w-2" style={{ background: l.color }} aria-hidden="true" />{l.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div>
            <label htmlFor="notes" className="field-label">Internal notes</label>
            <textarea id="notes" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (submission.notes ?? '') && patch({ notes }, 'Notes saved')} className="field-sm" placeholder="Only you see these." />
          </div>
          <dl className="space-y-1 border-t border-cloth-300 pt-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-mark-500">Received</dt><dd className="tabular text-right">{formatDateTime(submission.created_at)}</dd></div>
            {submission.responded_at && <div className="flex justify-between gap-3"><dt className="text-mark-500">First reply</dt><dd className="tabular text-right">{formatDateTime(submission.responded_at)}</dd></div>}
            <div className="flex justify-between gap-3"><dt className="text-mark-500">Messages</dt><dd className="tabular">{items.length}</dd></div>
          </dl>
          <div className="border-t border-cloth-300 pt-3">
            {submission.archived
              ? <button type="button" onClick={() => patch({ archived: false, archived_at: null }, 'Restored')} className="btn-quiet w-full">Restore from archive</button>
              : <button type="button" onClick={() => patch({ archived: true, archived_at: new Date().toISOString() }, 'Archived')} className="btn-quiet w-full"><Icon name="archive" className="h-4 w-4" />Archive</button>}
          </div>
        </aside>
      </div>
    </div>
  );
}
