import React, { useState, useId } from 'react';
import Panel from './Panel';
import { PanelHead, Band } from './Band';
import { SITE } from '../config/site';
import { PANELS } from '../config/panels';
import activity from '../data/github-activity.json';

/**
 * Every other number on this site is something Karisa says about himself. This one a
 * visitor can check: real public commit history, pulled by
 * scripts/fetch-github-activity.mjs and refreshed with `npm run sync:github`. Each repo
 * row links to the repo it counts.
 *
 * Chart decisions:
 *  - ONE series, so no legend — the heading names what is plotted. A second hue would
 *    also break the single-accent rule this identity is built on.
 *  - Columns capped at 24px with the band's leftover left as air; square at both ends,
 *    because nothing else in this world has a rounded corner.
 *  - Labels are selective: the peak month only. A number on every column is chaos.
 *  - Months with no commits are plotted as real gaps rather than dropped. The
 *    three-month hole in mid-2026 is in the data; smoothing it would be the exact kind
 *    of flattery this section exists to remove.
 *  - The tooltip never gates a value — there is a table view with all of them.
 */

const VB = { w: 760, h: 240 };
const PAD = { top: 20, right: 8, bottom: 34, left: 38 };
const PLOT = { w: VB.w - PAD.left - PAD.right, h: VB.h - PAD.top - PAD.bottom };
const MAX_BAR = 24;

const niceMax = (v) => {
  const step = v <= 20 ? 5 : v <= 60 ? 20 : 50;
  return Math.ceil(v / step) * step;
};

const monthLabel = (m, withYear) => {
  const d = new Date(`${m}-01T00:00:00Z`);
  const mon = d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
  return withYear ? `${mon} ${String(d.getUTCFullYear()).slice(2)}` : mon;
};

const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

const CommitChart = ({ months }) => {
  const [hover, setHover] = useState(null);
  const titleId = useId();
  const descId = useId();

  const max = niceMax(Math.max(...months.map((m) => m.commits)));
  const band = PLOT.w / months.length;
  const barW = Math.min(MAX_BAR, band - 8);
  const y = (v) => PAD.top + PLOT.h - (v / max) * PLOT.h;
  const ticks = [0, max / 3, (max / 3) * 2, max].map((t) => Math.round(t));
  const peak = months.reduce((a, b) => (b.commits > a.commits ? b : a));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        style={{ overflow: 'visible' }}
      >
        <title id={titleId}>Public commits per month</title>
        <desc id={descId}>
          {`${activity.totals.commits} commits across ${activity.totals.repos} public repositories, `}
          {`from ${fmtDate(activity.totals.firstCommit)} to ${fmtDate(activity.totals.lastCommit)}. `}
          {`Busiest month ${monthLabel(peak.month, true)} with ${peak.commits} commits. `}
          Full figures are in the table below the chart.
        </desc>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={PAD.left + PLOT.w} y1={y(t)} y2={y(t)} stroke="#DCD5C5" strokeWidth="1" />
            <text
              x={PAD.left - 10}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-mark-600"
              style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums' }}
            >
              {t}
            </text>
          </g>
        ))}

        {months.map((m, i) => {
          const cx = PAD.left + band * i + band / 2;
          const h = m.commits === 0 ? 0 : Math.max(2, PLOT.h * (m.commits / max));
          const active = hover === i;
          return (
            <g key={m.month}>
              {m.commits > 0 && (
                <rect
                  x={cx - barW / 2}
                  y={PAD.top + PLOT.h - h}
                  width={barW}
                  height={h}
                  className={active ? 'fill-pindo-deep' : 'fill-pindo'}
                />
              )}
              {/* Hit target: comfortably larger than the mark, and keyboard reachable */}
              <rect
                x={PAD.left + band * i}
                y={PAD.top}
                width={band}
                height={PLOT.h}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${monthLabel(m.month, true)}: ${m.commits} commit${m.commits === 1 ? '' : 's'}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                style={{ cursor: 'default' }}
              />
              {i % 3 === 0 && (
                <text
                  x={cx}
                  y={VB.h - 14}
                  textAnchor="middle"
                  className="fill-mark-600"
                  style={{ fontSize: 10 }}
                >
                  {monthLabel(m.month, true)}
                </text>
              )}
            </g>
          );
        })}

        {/* Selective direct label: the peak only */}
        <text
          x={PAD.left + band * months.indexOf(peak) + band / 2}
          y={y(peak.commits) - 9}
          textAnchor="middle"
          className="fill-mark-900 font-semibold"
          style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}
        >
          {peak.commits}
        </text>
      </svg>

      {hover !== null && (
        <div className="pointer-events-none absolute left-0 top-0 w-full" aria-hidden="true">
          <div
            className="tabular absolute -translate-x-1/2 whitespace-nowrap border border-mark-900 bg-cloth-50 px-2.5 py-1.5 text-sm text-mark-900"
            style={{ left: `${((PAD.left + band * hover + band / 2) / VB.w) * 100}%`, top: -8 }}
          >
            {monthLabel(months[hover].month, true)} — {months[hover].commits}
          </div>
        </div>
      )}
    </div>
  );
};

const GitHubActivity = () => {
  const [showTable, setShowTable] = useState(false);
  const { totals, months, repos, profileUrl, syncedAt } = activity;

  const stats = [
    { value: totals.commits, label: 'Public commits' },
    { value: totals.repos, label: 'Repositories' },
    { value: totals.months, label: 'Months of history' },
  ];

  return (
    <Panel id="activity" labelledBy="activity-heading">
      {(printed) => (
        <>
          <PanelHead
            id="activity-heading"
            heading={PANELS.activity.heading}
            jina={PANELS.activity.jina}
            lead={PANELS.activity.lead}
            printed={printed}
          />

          <Band items={stats} columns={3} printed={printed} />

          <div className="mt-8 border border-cloth-300 bg-cloth-50 p-5 md:p-7">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-title font-bold text-mark-900">
                Public commits per month
              </h3>
              <button
                type="button"
                onClick={() => setShowTable((v) => !v)}
                className="btn-quiet"
                aria-expanded={showTable}
              >
                {showTable ? 'Show chart' : 'Show table'}
              </button>
            </div>

            {showTable ? (
              <div className="max-h-[320px] overflow-y-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Public commits per month</caption>
                  <thead className="sticky top-0 bg-cloth-50">
                    <tr className="border-b border-mark-900">
                      <th scope="col" className="py-2 text-left text-label uppercase text-mark-600">Month</th>
                      <th scope="col" className="py-2 text-right text-label uppercase text-mark-600">Commits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {months.map((m) => (
                      <tr key={m.month} className="border-b border-cloth-300">
                        <td className="py-2 text-mark-700">{monthLabel(m.month, true)}</td>
                        <td className="py-2 text-right font-semibold text-mark-900">{m.commits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <CommitChart months={months} />
            )}
          </div>

          <ul className="mt-8 grid list-none gap-px border-t border-cloth-300 bg-cloth-300 p-0 pt-px md:grid-cols-2">
            {repos.map((repo) => (
              <li key={repo.name} className="bg-cloth-100 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link font-semibold"
                  >
                    {repo.name}
                  </a>
                  <span className="tabular shrink-0 text-sm text-mark-600">
                    {repo.commits} commits
                  </span>
                </div>
                <p className="mt-2 text-label uppercase text-mark-600">
                  {repo.languages.slice(0, 3).map((l) => l.name).join(' · ')}
                </p>
                <p className="tabular mt-1.5 text-sm text-mark-500">
                  {fmtDate(repo.firstCommit)} → {fmtDate(repo.lastCommit)}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-mark-600">
            Synced {fmtDate(syncedAt)} ·{' '}
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="link">
              verify at github.com/{profileUrl.split('/').pop()}
            </a>{' '}
            · forks excluded, so these count only work authored in {SITE.shortName}&apos;s own
            repositories
          </p>
        </>
      )}
    </Panel>
  );
};

export default GitHubActivity;
