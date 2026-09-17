import React from 'react';

/**
 * The page's one rule. Title first, its count or meta beside it on the same baseline,
 * actions on the right — never a kicker above (DESIGN.md → The Label Is Interior Rule).
 */
export default function PageHead({ title, meta, actions }) {
  return (
    <header className="adm-head">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="adm-title">{title}</h1>
        {meta ? <p className="tabular text-sm text-mark-500">{meta}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
