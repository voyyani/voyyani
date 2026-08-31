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
/**
 * `reversed` prints the head into the second colour: an indigo field with the jina
 * reversed out of it, bled to the panel's own edges. On cloth this is how a kanga
 * carries its jina — in a reserved band, not as a headline floating in the field — and
 * it is the one place the accent is allowed to own a whole region rather than a line.
 *
 * It is spent once, on the closing panel. Used on all eight it would be wallpaper; used
 * on the panel a visitor is meant to act in, it is the anchor the scroll builds toward.
 * The negative margins mirror <Panel>'s inner padding exactly — change one, change both.
 */
export const PanelHead = ({ id, heading, jina, lead, printed = true, reversed = false, children }) => (
  <div
    className={
      reversed
        ? `-mx-4 -mt-8 bg-pindo px-4 py-10 sm:-mx-8 sm:-mt-10 sm:px-8 sm:py-12 lg:-mx-12 lg:-mt-14 lg:px-12 lg:py-14 ${
            printed ? 'print-frame' : ''
          }`
        : `hem ${printed ? 'print-frame' : ''}`
    }
  >
    {reversed && <div className="mb-6 h-0.5 w-full bg-cloth-100 md:mb-8" aria-hidden="true" />}

    <p
      className={`jina ${printed ? 'print-jina' : ''} ${reversed ? 'text-cloth-50' : ''}`}
    >
      {jina || heading}
    </p>

    <div className={printed ? 'print-body' : undefined}>
      {jina ? (
        <h2
          id={id}
          className={`mt-6 max-w-[26ch] text-display font-semibold ${
            reversed ? 'text-cloth-100' : 'text-mark-700'
          }`}
        >
          {heading}
        </h2>
      ) : (
        <h2 id={id} className="sr-only">
          {heading}
        </h2>
      )}

      {lead && (
        <p className={`mt-5 max-w-prose text-lead ${reversed ? 'text-cloth-100' : 'text-mark-700'}`}>
          {lead}
        </p>
      )}

      {children}
    </div>
  </div>
);

/**
 * The measured band. Every panel that has figures states them in the same shape, in the
 * same place, in tabular type — the same facts in the same order on every object, so
 * they can be compared at a glance.
 *
 * `items` are `{ value, label, source?, href?, onClick? }`. A figure carries either an
 * `href` to the artifact that proves it or a `source` naming where it was measured —
 * this site's first product principle made structural rather than remembered.
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
          {item.source && <span className="band-source">{item.source}</span>}
        </a>
      ) : (
        <div key={item.label} className="band-cell">
          <span className="band-figure">{item.value}</span>
          <span className="band-label">{item.label}</span>
          {item.source && <span className="band-source">{item.source}</span>}
        </div>
      )
    )}
  </div>
);

export default Band;
