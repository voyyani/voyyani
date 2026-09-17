import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Icon from './Icon';

const SWATCHES = ['#243D8F', '#8A5A08', '#A32014', '#3B3E45', '#1A2C68', '#5B5F67'];

/** Labels are user data; their colour is theirs to choose. Everything else is the system's. */
export default function LabelsManager({ client }) {
  const [labels, setLabels] = useState(null);
  const [draft, setDraft] = useState({ name: '', color: SWATCHES[0] });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data, error } = await client.from('labels').select('id, name, color, description').order('name');
    if (error) { toast.error(`Could not load labels: ${error.message}`); return; }
    setLabels(data ?? []);
  };
  useEffect(() => { load(); }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const { error } = await client.from('labels').insert({ name: draft.name.trim(), color: draft.color });
    if (error) { toast.error(`Could not create label: ${error.message}`); return; }
    setDraft({ name: '', color: SWATCHES[0] });
    toast.success('Label created');
    load();
  };

  const save = async (label) => {
    const { error } = await client.from('labels').update({ name: label.name.trim(), color: label.color }).eq('id', label.id);
    if (error) { toast.error(`Could not save: ${error.message}`); return; }
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    const { error } = await client.from('labels').delete().eq('id', id);
    if (error) { toast.error(`Could not delete: ${error.message}`); return; }
    toast.success('Label deleted');
    load();
  };

  return (
    <div className="adm-card p-4">
      <ul className="divide-y divide-cloth-300">
        {(labels ?? []).map((l) => (
          <li key={l.id} className="flex flex-wrap items-center gap-3 py-2">
            {editing?.id === l.id ? (
              <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="flex flex-1 flex-wrap items-end gap-2">
                <div>
                  <label htmlFor={`name-${l.id}`} className="field-label mb-1 text-xs">Name</label>
                  <input id={`name-${l.id}`} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="field-sm w-48" />
                </div>
                <div>
                  <label htmlFor={`color-${l.id}`} className="field-label mb-1 text-xs">Colour</label>
                  <input id={`color-${l.id}`} type="color" value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="h-9 w-12 border border-cloth-400 bg-cloth-50 p-0" />
                </div>
                <button type="submit" className="btn-quiet"><Icon name="check" className="h-4 w-4" />Save</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-quiet">Cancel</button>
              </form>
            ) : (
              <>
                <span className="adm-chip"><span className="h-2 w-2" style={{ background: l.color }} aria-hidden="true" />{l.name}</span>
                <span className="ml-auto flex gap-2">
                  <button type="button" onClick={() => setEditing(l)} className="btn-quiet px-2 py-1 text-xs">Edit</button>
                  <button type="button" onClick={() => remove(l.id)} className="btn-alarm px-2 py-1 text-xs" aria-label={`Delete label ${l.name}`}><Icon name="trash" className="h-3.5 w-3.5" /></button>
                </span>
              </>
            )}
          </li>
        ))}
        {labels && labels.length === 0 && <li className="py-3 text-sm text-mark-700">No labels yet.</li>}
      </ul>
      <form onSubmit={create} className="mt-4 flex flex-wrap items-end gap-2 border-t border-cloth-300 pt-4">
        <div>
          <label htmlFor="new-label" className="field-label">New label</label>
          <input id="new-label" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="field-sm w-48" placeholder="e.g. Client" />
        </div>
        <div>
          <label htmlFor="new-color" className="field-label">Colour</label>
          <input id="new-color" type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="h-9 w-12 border border-cloth-400 bg-cloth-50 p-0" />
        </div>
        <button type="submit" className="btn-pindo px-4 py-2 text-sm"><Icon name="tag" className="h-4 w-4" />Add</button>
      </form>
    </div>
  );
}
