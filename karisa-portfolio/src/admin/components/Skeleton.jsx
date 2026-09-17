import React from 'react';

/** Loading is a placeholder in the shape of the content, never a spinner in it. */
export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`adm-skel ${className}`} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div role="status" aria-live="polite" className="space-y-px border-t border-cloth-300">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3 border-b border-cloth-300 px-3 py-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-3/4' : 'w-1/2'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ThreadSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Loading conversation…</span>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-16 w-5/6" />
      <Skeleton className="h-16 w-4/6" />
    </div>
  );
}
