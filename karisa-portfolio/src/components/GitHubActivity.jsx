import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { SITE } from '../config/site';
import activity from '../data/github-activity.json';

/**
 * Phase 3 — Proof Systems (docs/roadmapupdated.md).
 *
 * Every other number on this site is something Karisa says about himself. This one a
 * visitor can check: it's real public commit history, pulled by scripts/fetch-github-activity.mjs
 * and refreshed with `npm run sync:github`. Each repo row links to the repo it counts.
 *
 * Chart decisions (per the dataviz skill):
 *  - ONE series, so no legend — the heading names what is plotted. Four categorical
 *    hues would also break the single-accent identity from Phase 2.
 *  - Columns capped at 24px with the band's leftover left as air; 4px rounded cap,
 *    square at the baseline; hairline solid gridlines one step off the surface.
 *  - Labels are selective — the peak month only. A number on every column is chaos.
 *  - Months with no commits are plotted as real gaps rather than dropped. The
 *    three-month hole in mid-2026 is in the data; smoothing it would be the exact
 *    kind of flattery this phase exists to remove.
 *  - The tooltip never gates a value: there is a table view with all of them.
 */

const VB = { w: 760, h: 240 };
const PAD = { top: 16, right: 8, bottom: 34, left: 38 };
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
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
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

        {/* Gridlines: hairline, solid, one step off the surface */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={PAD.left + PLOT.w} y1={y(t)} y2={y(t)} stroke="#1E1E21" strokeWidth="1" />
            <text
              x={PAD.left - 10}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-ink-400 font-mono"
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
                  rx="4"
                  className={active ? 'fill-signal-hover' : 'fill-signal'}
                />
              )}
              {/* Square the bar off at the baseline — rx rounds all four corners */}
              {h > 4 && (
                <rect
                  x={cx - barW / 2}
                  y={PAD.top + PLOT.h - 4}
                  width={barW}
                  height={4}
                  className={active ? 'fill-signal-hover' : 'fill-signal'}
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
              {/* Every third month, so labels never collide */}
              {i % 3 === 0 && (
                <text
                  x={cx}
                  y={VB.h - 14}
                  textAnchor="middle"
                  className="fill-ink-400 font-mono"
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
          y={y(peak.commits) - 8}
          textAnchor="middle"
          className="fill-ink-50 font-semibold"
          style={{ fontSize: 12 }}
        >
          {peak.commits}
        </text>
      </svg>

      {hover !== null && (
        <div className="pointer-events-none absolute left-0 top-0 w-full" aria-hidden="true">
          <div
            className="absolute -translate-x-1/2 whitespace-nowrap border border-ink-700 bg-ink-950 px-2.5 py-1.5 font-mono text-[11px] text-ink-50"
            style={{ left: `${((PAD.left + band * hover + band / 2) / VB.w) * 100}%`, top: -6 }}
          >
            {monthLabel(months[hover].month, true)} — {months[hover].commits}
          </div>
        </div>
      )}
    </div>
  );
};

const GitHubActivity = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const [showTable, setShowTable] = useState(false);
  const { totals, months, repos, profileUrl, syncedAt } = activity;

  const stats = [
    { value: totals.commits, label: 'Public commits' },
    { value: totals.repos, label: 'Repositories' },
    { value: totals.months, label: 'Months of history' },
  ];

  return (
    <motion.section
      id="activity"
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } }}
      className="relative border-b border-ink-800 px-5 py-section md:px-10"
      aria-labelledby="activity-heading"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-10">
          <div className="eyebrow mb-5 text-signal">03 — Activity</div>
          <h2 id="activity-heading" className="mb-5 max-w-[20ch] text-display font-bold text-ink-50">
            The one set of numbers here you can check yourself
          </h2>
          <p className="max-w-prose text-lg leading-relaxed text-ink-300">
            Public commit history, pulled straight from the GitHub API. Every repository
            below links to the source it counts — including the quiet months.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="grid gap-px bg-ink-800 sm:grid-cols-3"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-ink-900 p-5">
              <div className="text-stat font-bold text-ink-50">{s.value}</div>
              <div className="eyebrow mt-1.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mt-6 panel p-5 md:p-7"
        >
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-semibold text-ink-50">Public commits per month</h3>
            <button
              onClick={() => setShowTable((v) => !v)}
              className="border border-ink-700 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-300 transition-colors duration-250 ease-signal hover:border-ink-500 hover:text-ink-50"
              aria-expanded={showTable}
            >
              {showTable ? 'Show chart' : 'Show table'}
            </button>
          </div>

          {showTable ? (
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Public commits per month</caption>
                <thead className="sticky top-0 bg-ink-900">
                  <tr className="border-b border-ink-700">
                    <th scope="col" className="py-2 text-left font-mono text-eyebrow uppercase text-ink-400">Month</th>
                    <th scope="col" className="py-2 text-right font-mono text-eyebrow uppercase text-ink-400">Commits</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((m) => (
                    <tr key={m.month} className="border-b border-ink-800">
                      <td className="py-2 text-ink-200">{monthLabel(m.month, true)}</td>
                      <td className="py-2 text-right text-ink-50" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {m.commits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <CommitChart months={months} />
          )}
        </motion.div>

        <motion.ul
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mt-6 grid gap-px bg-ink-800 md:grid-cols-2"
        >
          {repos.map((repo) => (
            <li key={repo.name} className="bg-ink-900 p-5">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink-50 underline decoration-ink-600 underline-offset-4 transition-colors duration-250 ease-signal hover:text-signal hover:decoration-signal"
                >
                  {repo.name}
                </a>
                <span className="shrink-0 font-mono text-[11px] text-ink-300" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {repo.commits} commits
                </span>
              </div>
              <p className="mb-3 font-mono text-[11px] text-ink-400">
                {repo.languages.slice(0, 3).map((l) => l.name).join(' · ')}
              </p>
              <p className="font-mono text-[11px] text-ink-400">
                {fmtDate(repo.firstCommit)} → {fmtDate(repo.lastCommit)}
              </p>
            </li>
          ))}
        </motion.ul>

        <motion.p
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          className="mt-5 font-mono text-[11px] text-ink-400"
        >
          Synced {fmtDate(syncedAt)} ·{' '}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-signal underline underline-offset-4"
          >
            verify at github.com/{profileUrl.split('/').pop()}
          </a>
          {' '}· forks excluded, so these count only work authored in {SITE.shortName}&apos;s own repositories
        </motion.p>
      </div>
    </motion.section>
  );
};

export default GitHubActivity;
