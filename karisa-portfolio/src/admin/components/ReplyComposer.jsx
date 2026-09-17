import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Icon from './Icon';
import { replyFormSchema } from '../../utils/validationSchemas';
import { QUICK_REPLY_TEMPLATES, interpolateTemplate } from '../../utils/replyTemplates';

const MAX = 5000;

/** Inline under the thread. Calls the send-reply edge function; the session token is used and never printed. */
export default function ReplyComposer({ submission, client, onSent }) {
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(replyFormSchema),
    defaultValues: { submission_id: submission.id, reply_type: 'manual', reply_message: '' },
  });
  const message = watch('reply_message', '');

  const applyTemplate = (e) => {
    const id = e.target.value;
    if (!id) return;
    const template = Object.values(QUICK_REPLY_TEMPLATES).flat().find((t) => t.id === id);
    if (!template) return;
    setValue('reply_message', interpolateTemplate(template.content, { name: submission.name, subject: submission.subject }), { shouldValidate: true });
    setValue('reply_type', 'quick_reply');
    e.target.value = '';
  };

  const onSubmit = async (data) => {
    setSending(true);
    try {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (sessionError || !token) throw new Error('Your session has expired. Sign in again.');
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Send failed (HTTP ${res.status})`);
      }
      toast.success(`Reply sent to ${submission.email}`);
      reset({ submission_id: submission.id, reply_type: 'manual', reply_message: '' });
      onSent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reply failed. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="adm-card p-4" aria-label="Reply">
      <input type="hidden" {...register('submission_id')} />
      <input type="hidden" {...register('reply_type')} />
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <label htmlFor="reply_message" className="field-label mb-0">Your reply</label>
        <div className="flex items-center gap-3">
          <label htmlFor="template" className="sr-only">Start from a template</label>
          <select id="template" defaultValue="" onChange={applyTemplate} className="field-sm w-auto">
            <option value="">Start from a template…</option>
            {Object.entries(QUICK_REPLY_TEMPLATES).map(([category, list]) => (
              <optgroup key={category} label={category}>
                {list.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </optgroup>
            ))}
          </select>
          <span className={`tabular text-xs ${message.length > MAX - 100 ? 'text-alarm' : 'text-mark-500'}`}>{message.length}/{MAX}</span>
        </div>
      </div>
      <textarea
        id="reply_message"
        rows={6}
        {...register('reply_message')}
        aria-invalid={errors.reply_message ? 'true' : undefined}
        aria-describedby={errors.reply_message ? 'reply-error' : undefined}
        className="field text-base"
        placeholder={`Reply to ${submission.name}…`}
      />
      {errors.reply_message && <p id="reply-error" className="mt-2 text-sm text-alarm">{errors.reply_message.message}</p>}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-mark-500">Sent from karisa@voyani.tech. Their reply lands back in this thread.</p>
        <button type="submit" disabled={sending} className="btn-pindo px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:bg-cloth-400">
          <Icon name="send" className="h-4 w-4" />{sending ? 'Sending…' : 'Send reply'}
        </button>
      </div>
    </form>
  );
}
