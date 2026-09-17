import React from 'react';

/**
 * State is a printed mark plus its own word, never a hue (DESIGN.md → The Printed
 * Mark Rule). The shape of the mark comes from index.css `.mark-state[data-state]`.
 */
const WORDS = {
  new: 'New',
  in_progress: 'In progress',
  responded: 'Responded',
  closed: 'Closed',
  waiting: 'Awaiting you',
  pending: 'Queued',
  sent: 'Sent',
  delivered: 'Delivered',
  opened: 'Opened',
  bounced: 'Bounced',
  failed: 'Failed',
  held: 'Held',
};

export default function StateMark({ state, children, className = '' }) {
  const s = state === 'clicked' ? 'opened' : state;
  return (
    <span className={`mark-state ${className}`} data-state={s}>
      {children ?? WORDS[s] ?? s}
    </span>
  );
}
