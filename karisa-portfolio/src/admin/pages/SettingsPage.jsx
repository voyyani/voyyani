import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PageHead from '../components/PageHead';
import LabelsManager from '../components/LabelsManager';

const DEFAULTS = { notify_new_submission: true, notify_reply_pending: true, email_digest: false, digest_frequency: 'daily', notify_via_email: true };

const PREFS = [
  ['notify_new_submission', 'Email me when a new enquiry arrives'],
  ['notify_reply_pending', 'Email me when a visitor replies to a thread'],
  ['email_digest', 'Send a digest instead of individual emails'],
];

export default function SettingsPage({ client, user }) {
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    if (!client || !user?.id) return;
    client.from('notification_settings').select('*').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
      if (error) { toast.error(`Could not load preferences: ${error.message}`); return; }
      setPrefs({ ...DEFAULTS, ...(data ?? {}) });
    });
  }, [client, user?.id]);

  const update = async (fields) => {
    const next = { ...prefs, ...fields };
    setPrefs(next);
    const { error } = await client.from('notification_settings').upsert({ user_id: user.id, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) { toast.error(`Could not save: ${error.message}`); setPrefs(prefs); return; }
    toast.success('Saved');
  };

  const role = user?.app_metadata?.role || user?.user_metadata?.role || 'admin';

  return (
    <div className="space-y-10">
      <PageHead title="Settings" />

      <section aria-labelledby="notif-h">
        <h2 id="notif-h" className="mb-3 text-lg font-semibold">Notifications</h2>
        <p className="mb-4 max-w-prose text-sm text-mark-700">Alerts go to the address the edge functions are configured with (<code className="font-sans">ADMIN_EMAIL</code>). Replying to any alert from your mail app sends your answer to the visitor and records it in the thread.</p>
        <div className="adm-card divide-y divide-cloth-300">
          {PREFS.map(([key, word]) => (
            <label key={key} className="flex items-center gap-3 px-4 py-3 text-sm">
              <input type="checkbox" checked={Boolean(prefs?.[key])} disabled={!prefs} onChange={(e) => update({ [key]: e.target.checked })} className="h-4 w-4 accent-pindo" />
              {word}
            </label>
          ))}
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <label htmlFor="digest" className="text-mark-700">Digest frequency</label>
            <select id="digest" value={prefs?.digest_frequency ?? 'daily'} disabled={!prefs?.email_digest} onChange={(e) => update({ digest_frequency: e.target.value })} className="field-sm w-auto">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </section>

      <section aria-labelledby="labels-h">
        <h2 id="labels-h" className="mb-3 text-lg font-semibold">Labels</h2>
        <LabelsManager client={client} />
      </section>

      <section aria-labelledby="account-h">
        <h2 id="account-h" className="mb-3 text-lg font-semibold">Account</h2>
        <dl className="adm-card grid gap-y-2 px-4 py-3 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-mark-500">Signed in as</dt><dd>{user?.email}</dd>
          <dt className="text-mark-500">Role</dt><dd className="capitalize">{role.replace('_', ' ')}</dd>
        </dl>
      </section>
    </div>
  );
}
