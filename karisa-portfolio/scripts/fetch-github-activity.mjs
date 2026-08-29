#!/usr/bin/env node
/**
 * Phase 3 — Proof Systems (docs/roadmapupdated.md).
 *
 * Pulls real public commit history from the GitHub API and writes
 * src/data/github-activity.json, which the GitHubActivity section renders.
 *
 * Run it with `npm run sync:github`. Re-run before a deploy to refresh the numbers.
 *
 * Why a build-time snapshot rather than a runtime fetch:
 *  - GitHub's /stats/* endpoints answer 202 ("computing") on a cold cache, which a
 *    visitor's browser would hit too — the section would render empty on first view.
 *  - Unauthenticated requests are limited to 60/hour, and this needs one per repo.
 *  - The chart must never be blank; a stale-but-labelled number beats an empty box.
 * The rendered section shows the sync date and links to the profile, so a reader can
 * check any figure against the source themselves.
 *
 * No token needed — every endpoint used here is public.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const USER = 'voyyani';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/github-activity.json');

const api = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': `${USER}-portfolio-build` },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`);
  return res.json();
};

/** Page through a repo's commits. Public repos only; caps out at 500. */
async function commitDates(repo) {
  const dates = [];
  for (let page = 1; page <= 5; page += 1) {
    const batch = await api(`/repos/${USER}/${repo}/commits?per_page=100&page=${page}`);
    dates.push(...batch.map((c) => c.commit.author.date.slice(0, 10)));
    if (batch.length < 100) break;
  }
  return dates.sort();
}

/** Continuous month range, so months with no commits render as real gaps. */
function monthSeries(from, to) {
  const out = [];
  const cur = new Date(`${from}-01T00:00:00Z`);
  const end = new Date(`${to}-01T00:00:00Z`);
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 7));
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return out;
}

const main = async () => {
  const all = await api(`/users/${USER}/repos?per_page=100&sort=pushed`);
  // Forks are someone else's history; they would inflate the totals.
  const owned = all.filter((r) => !r.fork);

  const repos = [];
  const monthly = new Map();

  for (const repo of owned) {
    const dates = await commitDates(repo.name);
    if (!dates.length) continue;
    const languages = await api(`/repos/${USER}/${repo.name}/languages`);
    for (const d of dates) {
      const m = d.slice(0, 7);
      monthly.set(m, (monthly.get(m) ?? 0) + 1);
    }
    repos.push({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      commits: dates.length,
      firstCommit: dates[0],
      lastCommit: dates[dates.length - 1],
      languages: Object.entries(languages)
        .sort((a, b) => b[1] - a[1])
        .map(([name, bytes]) => ({ name, bytes })),
    });
    process.stdout.write(`  ${repo.name}: ${dates.length} commits\n`);
  }

  repos.sort((a, b) => b.commits - a.commits);

  const keys = [...monthly.keys()].sort();
  const months = monthSeries(keys[0], keys[keys.length - 1]).map((month) => ({
    month,
    commits: monthly.get(month) ?? 0,
  }));

  const allDates = repos.flatMap((r) => [r.firstCommit, r.lastCommit]).sort();

  const payload = {
    syncedAt: new Date().toISOString().slice(0, 10),
    profileUrl: `https://github.com/${USER}`,
    totals: {
      commits: repos.reduce((n, r) => n + r.commits, 0),
      repos: repos.length,
      months: months.length,
      firstCommit: allDates[0],
      lastCommit: allDates[allDates.length - 1],
    },
    months,
    repos,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `\nWrote ${OUT}\n  ${payload.totals.commits} commits · ${payload.totals.repos} repos · ` +
      `${payload.totals.months} months (${payload.totals.firstCommit} → ${payload.totals.lastCommit})`
  );
};

main().catch((err) => {
  console.error(`\nFailed: ${err.message}`);
  console.error('The committed snapshot in src/data/github-activity.json is unchanged.');
  process.exit(1);
});
