import React, { useState } from 'react';
import StateMark from './StateMark';
import AttachmentPreview from './AttachmentPreview';
import { formatDateTime } from '../data/format';
import { sanitizeEmailHTML } from '@/utils/emailSanitizer';
import { toggleEmailImportant } from '@/hooks/useInboundEmails';

function Entry({ who, at, mark, children, tone = 'field' }) {
  const ground = tone === 'raised' ? 'bg-cloth-50' : tone === 'recessed' ? 'bg-cloth-200' : 'bg-cloth-100';
  return (
    <article className={`border border-cloth-300 ${ground}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-cloth-300 px-4 py-2">
        <p className="text-sm font-semibold text-mark-900">{who}</p>
        <div className="flex flex-wrap items-center gap-3">
          {mark}
          <time dateTime={at} className="text-xs text-mark-500">{formatDateTime(at)}</time>
        </div>
      </header>
      <div className="px-4 py-3 text-base leading-relaxed text-mark-900">{children}</div>
    </article>
  );
}

function InboundEntry({ item, client }) {
  const [open, setOpen] = useState(!item.held);
  const [important, setImportant] = useState(item.isImportant);
  const who = item.fromName ? `${item.fromName} <${item.fromEmail}>` : item.fromEmail;

  const flag = async () => {
    const next = !important;
    setImportant(next);
    const res = await toggleEmailImportant(item.id, next, client);
    if (!res.success) setImportant(!next);
  };

  return (
    <Entry
      who={who}
      at={item.at}
      tone={item.held ? 'recessed' : 'field'}
      mark={
        <>
          {item.held && <StateMark state="held">Held · {item.heldReason}</StateMark>}
          {!item.senderVerified && !item.held && <StateMark state="held">Sender differs</StateMark>}
          {!item.isRead && !item.held && <span className="text-xs font-medium text-pindo">Unread</span>}
          <button type="button" onClick={flag} aria-pressed={important} className="btn-quiet px-2 py-1 text-xs">{important ? 'Flagged' : 'Flag'}</button>
        </>
      }
    >
      {item.held && !open ? (
        <button type="button" onClick={() => setOpen(true)} className="link text-sm">Show held message</button>
      ) : (
        <>
          {item.subject && <p className="mb-2 text-sm text-mark-600">{item.subject}</p>}
          {item.bodyHtml ? (
            <div className="prose-email" dangerouslySetInnerHTML={{ __html: sanitizeEmailHTML(item.bodyHtml) }} />
          ) : (
            <p className="whitespace-pre-wrap">{item.bodyText}</p>
          )}
          {item.attachments.length > 0 && (
            <div className="mt-3 border-t border-cloth-300 pt-3">
              <AttachmentPreview attachments={item.attachments} replyId={item.id} client={client} />
            </div>
          )}
        </>
      )}
    </Entry>
  );
}

/** One conversation, in time order: the original, everything Karisa sent, everything that came back. */
export default function ConversationThread({ items, client }) {
  return (
    <ol className="space-y-3" aria-label="Conversation">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`}>
          {item.kind === 'original' && (
            <Entry who={`${item.name} <${item.email}>`} at={item.at} mark={<span className="text-xs text-mark-500">Original enquiry</span>}>
              <p className="whitespace-pre-wrap">{item.body}</p>
            </Entry>
          )}
          {item.kind === 'outbound' && (
            <Entry who="You" at={item.at} tone="raised" mark={
              <>
                {item.source === 'email_relay' && <span className="text-xs text-mark-500">via Gmail</span>}
                <StateMark state={item.emailStatus} />
              </>
            }>
              <p className="whitespace-pre-wrap">{item.body}</p>
            </Entry>
          )}
          {item.kind === 'inbound' && <InboundEntry item={item} client={client} />}
        </li>
      ))}
    </ol>
  );
}
