import React from 'react';

/**
 * Two pieces of the kanga's compositional law, kept free of any hook so they can be
 * used inside the lead panel as well as inside <Panel>.
 *
 * The seam is the law: a 2px indigo rule with the jina hanging directly beneath it, at
 * the same place on every panel of the sheet. Nothing else on this site draws that rule.
 */

/**
 * The seam, the jina, and the section's real heading.
 *
 * `heading` is the h2 the document outline needs; `jina` is the printed claim. They are
 * different sentences doing different jobs, so both ship — the jina states, the heading
 * names. Pass `heading` alone and it is set as the jina itself.
 */
export const PanelHead = ({ id, heading, jina, lead, printed = true, children }) => (
  <div className={`hem ${printed ? 'print-frame' : ''}`}>
    <p className={`jina ${printed ? 'print-jina' : ''}`}>{jina || heading}</p>

    <div className={printed ? 'print-body' : undefined}>
      {jina ? (
        <h2 id={id} className="mt-6 max-w-[26ch] text-display font-semibold text-mark-700">
          {heading}
        </h2>
      ) : (
        <h2 id={id} className="sr-only">
          {heading}
        </h2>
      )}

      {lead && <p className="mt-5 max-w-prose text-lead text-mark-700">{lead}</p>}

      {children}
    </div>
  </div>
);

/**
 * The measured band. Every panel that has figures states them in the same shape, in the
 * same place, in tabular type — the same facts in the same order on every object, so
 * they can be compared at a glance.
 *
 * `items` are `{ value, label, href?, onClick? }`. A figure with an `href` links to the
 * artifact that proves it, which is this site's first product principle made structural.
 */
export const Band = ({ items, columns = 3, printed = true, className = '' }) => (
  <div
    className={`band ${printed ? 'print-band' : ''} ${className}`}
    style={{ '--band-cols': `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {items.map((item) =>
      item.href ? (
        <a
          key={item.label}
          href={item.href}
          onClick={item.onClick}
          className="band-cell group no-underline transition-colors duration-250 ease-press hover:bg-cloth-200"
        >
          <span className="band-figure transition-colors duration-250 ease-press group-hover:text-pindo">
            {item.value}
          </span>
          <span className="band-label">{item.label}</span>
        </a>
      ) : (
        <div key={item.label} className="band-cell">
          <span className="band-figure">{item.value}</span>
          <span className="band-label">{item.label}</span>
        </div>
      )
    )}
  </div>
);

export default Band;
