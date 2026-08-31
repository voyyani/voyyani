import React from 'react';
import Panel from './Panel';
import { PanelHead } from './Band';
import { PANELS } from '../config/panels';

/**
 * Four habits, set as a ruled ledger rather than four identical cards.
 *
 * The card grid was the wrong container: it made four independent claims of equal
 * weight and gave each one a decorative icon. A habit is only worth stating here if it
 * produced a specific decision in the work above, so the structure is the pairing —
 * the habit on the left, the decision it caused on the right, and the project it
 * happened in named underneath. That pairing is the argument; the cards were furniture.
 *
 * Every `where` below points at something else on this page.
 */
const HABITS = [
  {
    habit: 'Design to a tolerance',
    body:
      'A spec that says "should be fast" cannot be checked. One that says "under 1.5s on a 3G connection" can. Raslipwani had a number attached to it before any of the optimisation work started.',
    where: 'Raslipwani Properties',
    href: '#projects',
  },
  {
    habit: 'Put the constraint in the material',
    body:
      "A safety interlock belongs in the mechanism, not the operating manual. Neema's permissions are enforced by PostgreSQL Row-Level Security, so hiding a button in the UI isn't what's protecting the data.",
    where: 'Neema Foundation',
    href: '#projects',
  },
  {
    habit: 'Load-test before you trust it',
    body:
      'The first version of a listings page is fine at 40 rows and painful at 400. Assume the second case and design the query for it, rather than discovering the limit in production.',
    where: 'Server-side pagination, Raslipwani',
    href: '#projects',
  },
  {
    habit: 'Measure, then claim',
    body:
      "If I can't point at where a number came from, it doesn't go on the page. That rule removed several figures from this site — including some that flattered me.",
    where: 'The commit history below',
    href: '#activity',
  },
];

const Philosophy = () => (
  <Panel id="philosophy" labelledBy="philosophy-heading">
    {(printed) => (
      <>
        <PanelHead
          id="philosophy-heading"
          heading={PANELS.philosophy.heading}
          jina={PANELS.philosophy.jina}
          lead={PANELS.philosophy.lead}
          printed={printed}
        />

        <ol className="mt-10 list-none border-t border-cloth-300 p-0">
          {HABITS.map((item) => (
            <li
              key={item.habit}
              className="grid gap-x-10 gap-y-3 border-b border-cloth-300 py-7 transition-colors duration-250 ease-press hover:bg-cloth-200 md:grid-cols-12"
            >
              <h3 className="font-display text-title font-bold text-mark-900 md:col-span-4">
                {item.habit}
              </h3>

              <div className="md:col-span-8">
                <p className="max-w-prose leading-relaxed text-mark-700">{item.body}</p>
                <a
                  href={item.href}
                  className="mt-3 inline-block text-label uppercase text-pindo no-underline hover:underline"
                >
                  Where it shows up: {item.where}
                </a>
              </div>
            </li>
          ))}
        </ol>
      </>
    )}
  </Panel>
);

export default Philosophy;
