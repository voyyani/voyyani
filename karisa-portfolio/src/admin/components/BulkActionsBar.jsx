import React, { useState } from 'react';
import Icon from './Icon';

/** Fixed to the bottom while a selection exists. Destructive actions confirm inline. */
export default function BulkActionsBar({ count, labels = [], onStatus, onArchive, onDelete, onLabel, onClear }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div role="region" aria-label="Bulk actions" className="fixed inset-x-0 bottom-0 z-20 border-t border-mark-900 bg-cloth-50">
      <div className="mx-auto flex max-w-sheet flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <p className="tabular mr-auto text-sm font-medium">{count} selected</p>

        <label className="sr-only" htmlFor="bulk-status">Set status</label>
        <select id="bulk-status" defaultValue="" onChange={(e) => { if (e.target.value) { onStatus(e.target.value); e.target.value = ''; } }} className="field-sm w-auto">
          <option value="" disabled>Set status…</option>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
        </select>

        {labels.length > 0 && (
          <>
            <label className="sr-only" htmlFor="bulk-label">Add label</label>
            <select id="bulk-label" defaultValue="" onChange={(e) => { if (e.target.value) { onLabel(e.target.value); e.target.value = ''; } }} className="field-sm w-auto">
              <option value="" disabled>Add label…</option>
              {labels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </>
        )}

        <button type="button" onClick={onArchive} className="btn-quiet"><Icon name="archive" className="h-4 w-4" />Archive</button>

        {confirming ? (
          <>
            <button type="button" onClick={() => { setConfirming(false); onDelete(); }} className="btn-alarm">Confirm delete {count}</button>
            <button type="button" onClick={() => setConfirming(false)} className="btn-quiet">Keep</button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="btn-alarm"><Icon name="trash" className="h-4 w-4" />Delete</button>
        )}

        <button type="button" onClick={onClear} className="btn-quiet" aria-label="Clear selection"><Icon name="close" className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
