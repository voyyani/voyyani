# Raslipwani — data-gathering brief for flipping the portfolio card to Live

**Run this inside the `raslipwani` repo** (`https://github.com/voyyani/raslipwani`).
The output is a single handoff file, `RASLIPWANI_HANDOFF.md`, plus a folder of
screenshots. The portfolio (`karisa-portfolio`) then consumes both — see §6.

Rule that governs everything below (from the portfolio's `src/data/projects.js`):
> A number on the page links to the artifact that proves it, or it does not go on the page.
> `liveStatus.checkedOn` is a real date someone opened the site. If you change a status,
> change the date with it.

So: every value you record needs a **source** (file path, command output, or URL + date).
Do not guess. If something cannot be sourced, write `UNSOURCED` and move on.

---

## 1. What the portfolio currently claims (verify each)

These live in `karisa-portfolio/src/data/projects.js`, project `id: 1`. Confirm or
correct each one against the repo. Mark ✅ (matches), ✏️ (corrected value), or ❌ (unsourced).

| Field | Current claim | Where to check in raslipwani |
|---|---|---|
| `technologies` | React 18.3, Vite 6.3, Supabase, PostgreSQL, Tailwind, React Query, FullCalendar, Framer Motion, Clerk Auth, Vercel Analytics, **EmailJS**, Cloudinary, Vitest, RTL | `package.json` — **EmailJS especially**: the portfolio itself just dropped EmailJS; if raslipwani still ships it, keep it; if not, remove it |
| `metrics[0]` Page Load `3s → 1.2s` | source: "case study" | Any Lighthouse/Vercel Speed Insights report, commit message, or PR that recorded the before/after |
| `metrics[1]` Test coverage target `90%` | source: "Vitest, stated target" | `vitest.config.*` → `coverage.thresholds`; also record **actual** coverage from `npx vitest run --coverage` |
| `metrics[2]` Active Users `100+` | UNSOURCED (hidden) | Supabase dashboard / Clerk user count / Vercel Analytics — only if you can cite it with a date |
| `metrics[3]` Mobile Lighthouse `95/100` | UNSOURCED (hidden) | Run Lighthouse against the live site once it's up; record score + date + URL tested |
| `technicalHighlights` | 20 items/page, 500ms debounce, 5-min stale time, PostgreSQL FTS, React.lazy, error boundaries | grep the source (§2.3) |
| `databaseSchema` | properties 15 cols·4 idx, bookings 25·7, clients 28·6, client_property_interests 7·3, client_communications 10·4, admin_settings 20+ | `supabase/migrations/` (§2.4) |
| `features` / `adminFeatures` | 17 + 12 items (UN Housing portal, CSV export, Quill editor, business hours, etc.) | Route inventory + component grep (§2.5) |
| `performanceMetrics` | TTI <2s on 3G, FCP <1s, API <200ms, DB <50ms, desktop 98/100 | Only keep those with a report behind them |
| `architecture` | "CI/CD: GitHub Actions" | `.github/workflows/` — does it exist? |
| `liveUrl` | `https://raslipwani.co.ke` | §3 |

---

## 2. Repo extraction — run these and paste output into the handoff

### 2.1 Identity & recency
```bash
git log -1 --format='%H %ad %s' --date=short
git log --format='%ad' --date=short | sort -u | sed -n '1p;$p'   # first & last commit dates
git log --oneline | wc -l
```

### 2.2 Stack versions (replaces the `technologies` list)
```bash
node -e '
const p=require("./package.json");
const all={...p.dependencies,...p.devDependencies};
for (const k of Object.keys(all).sort()) console.log(k, all[k]);
' | grep -iE "^(react|react-dom|vite|@supabase|tailwindcss|@tanstack/react-query|@fullcalendar|framer-motion|@clerk|@vercel|emailjs|@emailjs|cloudinary|vitest|@testing-library|react-helmet|quill|react-router|zod|resend) "
```
Also note anything major that is **not** on the portfolio's list.

### 2.3 Confirm the technical highlights actually exist in code
```bash
grep -rnE "range\(|\.limit\(|pageSize|PAGE_SIZE|itemsPerPage" src | head          # server-side pagination + page size
grep -rnE "useDebounce|debounce\(|setTimeout\(.*(300|400|500)" src | head           # debounce ms
grep -rnE "staleTime" src | head                                                    # React Query stale time
grep -rnE "onMutate|rollback|previous" src | grep -i mutat | head                   # optimistic updates
grep -rnE "textSearch|to_tsvector|tsvector|fts" src supabase | head                 # full-text search
grep -rnE "React\.lazy|lazy\(" src | head                                           # code splitting
grep -rnE "ErrorBoundary" src | head
grep -rnE "cloudinary" src | head
grep -rnE "emailjs|resend" src | head                                               # which email provider
```
Record the **actual** values (page size, debounce ms, staleTime) — replace the portfolio's if they differ.

### 2.4 Database schema (replaces `databaseSchema`)
```bash
ls supabase/migrations/
# Per table: column count and index count. Adjust table names if they differ.
for t in properties bookings clients client_property_interests client_communications admin_settings; do
  cols=$(grep -rhozE "create table[^;]*\b$t\b[^;]*;" supabase/migrations/ | tr -d '\0' | grep -cE '^\s+[a-z_]+ ' )
  idx=$(grep -rhiE "create (unique )?index .* on (public\.)?$t\b" supabase/migrations/ | wc -l)
  echo "$t: ~$cols cols · $idx idx"
done
```
If the migrations are messy, a live query is more trustworthy (Supabase SQL editor):
```sql
select c.relname as table_name,
       (select count(*) from pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped) as columns,
       (select count(*) from pg_index i where i.indrelid=c.oid) as indexes
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' order by 1;
```
Note any tables the portfolio doesn't mention.

### 2.5 Feature / route inventory (validates `features` + `adminFeatures`)
```bash
grep -rnE "<Route |path=" src | grep -vE "test|spec" | sed -E 's/.*path=["'\'']([^"'\'']+).*/\1/' | sort -u
ls src/pages src/components 2>/dev/null
grep -rlniE "csv|export" src | head
grep -rlniE "quill|tiptap" src | head
grep -rlniE "business.?hours|timezone" src | head
grep -rlniE "un.?habitat|un housing|international" src | head
grep -rniE "role|rbac|publicMetadata" src | grep -i clerk | head
```
For each of the 29 listed feature bullets: keep, reword, or drop. Drop anything you can't
point at a file for.

### 2.6 Tests & coverage
```bash
npx vitest run 2>&1 | tail -5
npx vitest run --coverage 2>&1 | grep -E "All files|Statements|Lines" | head -3
grep -nA6 "thresholds" vitest.config.* 2>/dev/null
```

### 2.7 CI/CD & deployment
```bash
ls .github/workflows/ 2>/dev/null || echo "NO GITHUB ACTIONS"
cat vercel.json 2>/dev/null
```

---

## 3. Live-site verification (this is what actually flips the flag)

Run on the day you intend to flip it. Record the date — it becomes `checkedOn`.

```bash
for path in / /properties /booking /about /contact /admin /login; do
  code=$(curl -s -o /tmp/r.html -w '%{http_code}' "https://raslipwani.co.ke$path")
  maint=$(grep -ciE "maintenance|coming soon|countdown|under construction" /tmp/r.html)
  echo "$path → HTTP $code, maintenance-words: $maint"
done
```
Pass condition: every public route returns 200 **and** `maintenance-words: 0`. Then open
the homepage in a browser and confirm you see the real product, not a countdown.

Also record:
- Lighthouse (mobile + desktop) on `/` and `/properties` — `npx lighthouse https://raslipwani.co.ke --preset=... --output=json` or Chrome DevTools. Score, date, which URL.
- Does the site still use the same domain? Any redirects?

---

## 4. Screenshots

Match the Neema capture so the two cards look like one system:
**1440×900 viewport @2x**, served as `.jpg` + `.webp` + `.avif`, into
`karisa-portfolio/public/images/projects/raslipwani/`.

Playwright is already a devDependency in the portfolio, so run this **from the portfolio repo**:
```js
// scripts/capture-raslipwani.mjs
import { chromium } from 'playwright';
const pages = [
  ['home',       'https://raslipwani.co.ke/'],
  ['properties', 'https://raslipwani.co.ke/properties'],
  ['property',   'https://raslipwani.co.ke/properties/<pick-a-real-slug>'],
  ['booking',    'https://raslipwani.co.ke/<booking-route>'],
  // admin pages need Karisa's login — capture manually or skip
];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
for (const [name, url] of pages) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `public/images/projects/raslipwani/${name}.png` });
}
await browser.close();
```
Then convert (Sharp, per `docs/IMAGE_OPTIMIZATION.md`): jpg q80, webp q80, avif q60; delete the png.
Target ≤ 90 KB per jpg (Neema's are 54–83 KB).

**Admin dashboard**: needs a real login. Either capture by hand at the same viewport, or
leave it out — do not use a staging/mock dashboard.

For each screenshot write an `alt` (what is literally on screen, incl. visible headline
text) and a `caption` (what it demonstrates) — same shape as Neema's entries.

---

## 5. Handoff file — `RASLIPWANI_HANDOFF.md`

```markdown
# Raslipwani handoff — <YYYY-MM-DD>

## Live check
- Checked on: <date>            ← becomes liveStatus.checkedOn ("14 Sep 2026" format)
- Routes tested / result: <paste §3 output>
- Lighthouse: mobile __ / desktop __ on <url>, <date>

## Stack (from package.json @ <commit>)
<list>
- EmailJS still in use? yes/no → <file>

## Verified highlights
- Page size: __  (<file:line>)
- Debounce: __ms (<file:line>)
- staleTime: __  (<file:line>)
- Optimistic updates: yes/no (<file>)
- Full-text search: yes/no (<migration or file>)
- Code splitting / error boundaries / Cloudinary: yes/no each

## Schema (source: migrations | live SQL, <date>)
| table | cols | idx | holds |

## Features — keep / reword / drop
<one line per bullet, with file path for keeps>

## Tests
- Pass/fail count, coverage %, configured threshold

## CI/CD
- GitHub Actions: yes/no ; Vercel: yes/no

## Performance figures with a source
<only those you can cite>

## Screenshots
| file | alt | caption |

## Corrections to the portfolio (things that were wrong)
<list>
```

---

## 6. Portfolio-side changes (done in `karisa-portfolio` after the handoff)

Every place the maintenance state is wired:

- [ ] `src/data/projects.js` id 1 —
  - `liveStatus` → `{ state: "live", checkedOn: "<date>" }`; delete the "Checked 2026-08-29 … maintenance" comment
  - `screenshots: []` → populated; delete the "No product screenshots yet" comment
  - `technologies`, `technicalHighlights`, `databaseSchema`, `features`, `adminFeatures` → corrected from handoff
  - `metrics` — add `source` to any figure the handoff sourced (Lighthouse), leave the rest unsourced/hidden
- [ ] `src/components/Projects.jsx:295-310` — the ordering comment says Raslipwani is last *because* it's in maintenance. Once both have captures, decide the order deliberately and rewrite the comment.
- [ ] `src/components/Projects.test.jsx:236-249` — test asserts "Visit Site Anyway" + "scheduled maintenance window". Flip it to assert "View Live Platform" and *no* maintenance notice.
- [ ] `src/components/Projects.jsx:50-52` `NoCaptureNotice` — still valid for any future project; no change unless it becomes dead code.
- [ ] `docs/CHANGELOG.md` — add an entry; remove/resolve line ~167 ("No screenshots exist for Raslipwani … until ~5 Sept 2026").
- [ ] `src/components/Hero.jsx`, `Philosophy.jsx`, `Skills.jsx` — mention Raslipwani (3s → 1.2s, Clerk, Vitest). Only touch if the handoff contradicts them.
- [ ] `npm test && npm run build` green before committing.





# Raslipwani — data-gathering brief for flipping the portfolio card to Live

**Run this inside the `raslipwani` repo** (`https://github.com/voyyani/raslipwani`).
The output is a single handoff file, `RASLIPWANI_HANDOFF.md`, plus a folder of
screenshots. The portfolio (`karisa-portfolio`) then consumes both — see §6.

Rule that governs everything below (from the portfolio's `src/data/projects.js`):
> A number on the page links to the artifact that proves it, or it does not go on the page.
> `liveStatus.checkedOn` is a real date someone opened the site. If you change a status,
> change the date with it.

So: every value you record needs a **source** (file path, command output, or URL + date).
Do not guess. If something cannot be sourced, write `UNSOURCED` and move on.

---

## 1. What the portfolio currently claims (verify each)

These live in `karisa-portfolio/src/data/projects.js`, project `id: 1`. Confirm or
correct each one against the repo. Mark ✅ (matches), ✏️ (corrected value), or ❌ (unsourced).

| Field | Current claim | Where to check in raslipwani | Verified 2026-09-14 @ `d3e978b` |
|---|---|---|---|
| `technologies` | React 18.3, Vite 6.3, Supabase, PostgreSQL, Tailwind, React Query, FullCalendar, Framer Motion, Clerk Auth, Vercel Analytics, **EmailJS**, Cloudinary, Vitest, RTL | `package.json` — **EmailJS especially**: the portfolio itself just dropped EmailJS; if raslipwani still ships it, keep it; if not, remove it | ✏️ **Drop EmailJS, Clerk.** Neither is in `package.json`; Clerk was removed in commit `14ac8e5` ("chore(auth): remove Clerk entirely"). Auth is **Supabase Auth** (`src/services/auth.js:26` `signInWithPassword`). Email is **Resend** (`api/send-email.js:1`, Vercel serverless). Cloudinary: no SDK — unsigned-upload via `cloud_name`/`upload_preset` stored in `admin_settings` + hosted asset URLs (`src/App.jsx:89`, `src/pages/admin/settings/CloudinarySettings.jsx`). Full list in §7.2 |
| `metrics[0]` Page Load `3s → 1.2s` | source: "case study" | Any Lighthouse/Vercel Speed Insights report, commit message, or PR that recorded the before/after | ❌ **UNSOURCED.** Only appears in self-authored status docs (`src/Docs/PROJECT_STATUS.md:150`, `SUMMARY.md:194`) with no report, commit or PR behind it. Sourced substitute: **first-load JS 220.7 → 112.8 kB gzip** (`bundle-budget.json`, measured 2026-09-08, enforced in CI) |
| `metrics[1]` Test coverage target `90%` | source: "Vitest, stated target" | `vitest.config.*` → `coverage.thresholds`; also record **actual** coverage from `npx vitest run --coverage` | ✏️ Configured CI floor is **57% lines / 56% stmts / 47% funcs / 45% branches** (`vitest.config.js:130-135`, ratchet, ROADMAP Phase 3 targets 70%). Actual (last run 2026-09-08, `coverage/coverage-final.json`): **58.02% lines / 57.11% stmts / 48.36% funcs / 46.54% branches**, 196 files. "90%" is not stated anywhere in the repo |
| `metrics[2]` Active Users `100+` | UNSOURCED (hidden) | Supabase dashboard / Clerk user count / Vercel Analytics — only if you can cite it with a date | ❌ UNSOURCED — no dashboard access from the repo; keep hidden |
| `metrics[3]` Mobile Lighthouse `95/100` | UNSOURCED (hidden) | Run Lighthouse against the live site once it's up; record score + date + URL tested | ❌ UNSOURCED — no recorded score. Lighthouse CI *does* run on every push (`.github/workflows/ci.yml` job "Lighthouse (mobile)", `lighthouserc.json`: perf ≥0.90 warn, a11y ≥0.95 **error**, 3 runs on `/`, `/properties`, `/contact`) — a passing run is the citable artifact; grab it from the Actions log |
| `technicalHighlights` | 20 items/page, 500ms debounce, 5-min stale time, PostgreSQL FTS, React.lazy, error boundaries | grep the source (§2.3) | ✏️ 20/page ✅ · 500 ms ✅ · 5-min staleTime ✅ (three-tier cache policy) · **PostgreSQL FTS ❌ drop** (no `tsvector`/`textSearch` anywhere in `src/` or `supabase/`) · React.lazy ✅ · ErrorBoundary ✅ · **add** optimistic updates w/ rollback. See §7.3 |
| `databaseSchema` | properties 15 cols·4 idx, bookings 25·7, clients 28·6, client_property_interests 7·3, client_communications 10·4, admin_settings 20+ | `supabase/migrations/` (§2.4) | ✏️ properties **25·5**, bookings **26·12**, clients **27·6**, client_property_interests **8·3**, client_communications **11·4**, admin_settings **~70·1**; plus **booking_notes 7·3, email_templates 9·2, admin_users 4·0** not on the portfolio. See §7.4 |
| `features` / `adminFeatures` | 17 + 12 items (UN Housing portal, CSV export, Quill editor, business hours, etc.) | Route inventory + component grep (§2.5) | ✏️ **UN Housing / International is SHELVED** (`src/App.jsx:162-165`, commit `8075b2f`) — drop or mark "shelved". CSV export ✅, Quill ✅, business hours ✅. See §7.5 |
| `performanceMetrics` | TTI <2s on 3G, FCP <1s, API <200ms, DB <50ms, desktop 98/100 | Only keep those with a report behind them | ❌ **All UNSOURCED** — none has a report. Only sourced figure: first-load bundle 112.8 kB gzip (`bundle-budget.json`) |
| `architecture` | "CI/CD: GitHub Actions" | `.github/workflows/` — does it exist? | ✅ `.github/workflows/ci.yml` — lint, test:coverage, palette/label/file-size ratchets, axe a11y, build, bundle report, no-console check, + separate Lighthouse (mobile) job. Deploy: Vercel (`vercel.json`, SPA rewrite, `api/` serverless) |
| `liveUrl` | `https://raslipwani.co.ke` | §3 | ⚠️ Domain resolves and is served by Vercel, but every route returned **HTTP 429 "Vercel Security Checkpoint"** to curl on 2026-09-14 (bot challenge, *not* a maintenance page — `maintenance-words: 0`). Must be confirmed in a browser. See §7.8 |

---

## 2. Repo extraction — run these and paste output into the handoff

### 2.1 Identity & recency
```bash
git log -1 --format='%H %ad %s' --date=short
git log --format='%ad' --date=short | sort -u | sed -n '1p;$p'   # first & last commit dates
git log --oneline | wc -l
```

### 2.2 Stack versions (replaces the `technologies` list)
```bash
node -e '
const p=require("./package.json");
const all={...p.dependencies,...p.devDependencies};
for (const k of Object.keys(all).sort()) console.log(k, all[k]);
' | grep -iE "^(react|react-dom|vite|@supabase|tailwindcss|@tanstack/react-query|@fullcalendar|framer-motion|@clerk|@vercel|emailjs|@emailjs|cloudinary|vitest|@testing-library|react-helmet|quill|react-router|zod|resend) "
```
Also note anything major that is **not** on the portfolio's list.

### 2.3 Confirm the technical highlights actually exist in code
```bash
grep -rnE "range\(|\.limit\(|pageSize|PAGE_SIZE|itemsPerPage" src | head          # server-side pagination + page size
grep -rnE "useDebounce|debounce\(|setTimeout\(.*(300|400|500)" src | head           # debounce ms
grep -rnE "staleTime" src | head                                                    # React Query stale time
grep -rnE "onMutate|rollback|previous" src | grep -i mutat | head                   # optimistic updates
grep -rnE "textSearch|to_tsvector|tsvector|fts" src supabase | head                 # full-text search
grep -rnE "React\.lazy|lazy\(" src | head                                           # code splitting
grep -rnE "ErrorBoundary" src | head
grep -rnE "cloudinary" src | head
grep -rnE "emailjs|resend" src | head                                               # which email provider
```
Record the **actual** values (page size, debounce ms, staleTime) — replace the portfolio's if they differ.

### 2.4 Database schema (replaces `databaseSchema`)
```bash
ls supabase/migrations/
# Per table: column count and index count. Adjust table names if they differ.
for t in properties bookings clients client_property_interests client_communications admin_settings; do
  cols=$(grep -rhozE "create table[^;]*\b$t\b[^;]*;" supabase/migrations/ | tr -d '\0' | grep -cE '^\s+[a-z_]+ ' )
  idx=$(grep -rhiE "create (unique )?index .* on (public\.)?$t\b" supabase/migrations/ | wc -l)
  echo "$t: ~$cols cols · $idx idx"
done
```
If the migrations are messy, a live query is more trustworthy (Supabase SQL editor):
```sql
select c.relname as table_name,
       (select count(*) from pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped) as columns,
       (select count(*) from pg_index i where i.indrelid=c.oid) as indexes
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r' order by 1;
```
Note any tables the portfolio doesn't mention.

### 2.5 Feature / route inventory (validates `features` + `adminFeatures`)
```bash
grep -rnE "<Route |path=" src | grep -vE "test|spec" | sed -E 's/.*path=["'\'']([^"'\'']+).*/\1/' | sort -u
ls src/pages src/components 2>/dev/null
grep -rlniE "csv|export" src | head
grep -rlniE "quill|tiptap" src | head
grep -rlniE "business.?hours|timezone" src | head
grep -rlniE "un.?habitat|un housing|international" src | head
grep -rniE "role|rbac|publicMetadata" src | grep -i clerk | head
```
For each of the 29 listed feature bullets: keep, reword, or drop. Drop anything you can't
point at a file for.

### 2.6 Tests & coverage
```bash
npx vitest run 2>&1 | tail -5
npx vitest run --coverage 2>&1 | grep -E "All files|Statements|Lines" | head -3
grep -nA6 "thresholds" vitest.config.* 2>/dev/null
```

### 2.7 CI/CD & deployment
```bash
ls .github/workflows/ 2>/dev/null || echo "NO GITHUB ACTIONS"
cat vercel.json 2>/dev/null
```

---

## 3. Live-site verification (this is what actually flips the flag)

Run on the day you intend to flip it. Record the date — it becomes `checkedOn`.

```bash
for path in / /properties /booking /about /contact /admin /login; do
  code=$(curl -s -o /tmp/r.html -w '%{http_code}' "https://raslipwani.co.ke$path")
  maint=$(grep -ciE "maintenance|coming soon|countdown|under construction" /tmp/r.html)
  echo "$path → HTTP $code, maintenance-words: $maint"
done
```
Pass condition: every public route returns 200 **and** `maintenance-words: 0`. Then open
the homepage in a browser and confirm you see the real product, not a countdown.

Also record:
- Lighthouse (mobile + desktop) on `/` and `/properties` — `npx lighthouse https://raslipwani.co.ke --preset=... --output=json` or Chrome DevTools. Score, date, which URL.
- Does the site still use the same domain? Any redirects?

---

## 4. Screenshots

Match the Neema capture so the two cards look like one system:
**1440×900 viewport @2x**, served as `.jpg` + `.webp` + `.avif`, into
`karisa-portfolio/public/images/projects/raslipwani/`.

Playwright is already a devDependency in the portfolio, so run this **from the portfolio repo**:
```js
// scripts/capture-raslipwani.mjs
import { chromium } from 'playwright';
const pages = [
  ['home',       'https://raslipwani.co.ke/'],
  ['properties', 'https://raslipwani.co.ke/properties'],
  ['property',   'https://raslipwani.co.ke/properties/<pick-a-real-slug>'],
  ['booking',    'https://raslipwani.co.ke/<booking-route>'],
  // admin pages need Karisa's login — capture manually or skip
];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
for (const [name, url] of pages) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `public/images/projects/raslipwani/${name}.png` });
}
await browser.close();
```
Then convert (Sharp, per `docs/IMAGE_OPTIMIZATION.md`): jpg q80, webp q80, avif q60; delete the png.
Target ≤ 90 KB per jpg (Neema's are 54–83 KB).

**Admin dashboard**: needs a real login. Either capture by hand at the same viewport, or
leave it out — do not use a staging/mock dashboard.

For each screenshot write an `alt` (what is literally on screen, incl. visible headline
text) and a `caption` (what it demonstrates) — same shape as Neema's entries.

---

## 5. Handoff file — `RASLIPWANI_HANDOFF.md`

```markdown
# Raslipwani handoff — <YYYY-MM-DD>

## Live check
- Checked on: <date>            ← becomes liveStatus.checkedOn ("14 Sep 2026" format)
- Routes tested / result: <paste §3 output>
- Lighthouse: mobile __ / desktop __ on <url>, <date>

## Stack (from package.json @ <commit>)
<list>
- EmailJS still in use? yes/no → <file>

## Verified highlights
- Page size: __  (<file:line>)
- Debounce: __ms (<file:line>)
- staleTime: __  (<file:line>)
- Optimistic updates: yes/no (<file>)
- Full-text search: yes/no (<migration or file>)
- Code splitting / error boundaries / Cloudinary: yes/no each

## Schema (source: migrations | live SQL, <date>)
| table | cols | idx | holds |

## Features — keep / reword / drop
<one line per bullet, with file path for keeps>

## Tests
- Pass/fail count, coverage %, configured threshold

## CI/CD
- GitHub Actions: yes/no ; Vercel: yes/no

## Performance figures with a source
<only those you can cite>

## Screenshots
| file | alt | caption |

## Corrections to the portfolio (things that were wrong)
<list>
```

---

## 6. Portfolio-side changes (done in `karisa-portfolio` after the handoff)

Every place the maintenance state is wired:

- [x] `src/data/projects.js` id 1 — done 2026-09-16 —
  - `liveStatus` → `{ state: "live", checkedOn: "<date>" }`; delete the "Checked 2026-08-29 … maintenance" comment
  - `screenshots: []` → populated; delete the "No product screenshots yet" comment
  - `technologies`, `technicalHighlights`, `databaseSchema`, `features`, `adminFeatures` → corrected from handoff
  - `metrics` — add `source` to any figure the handoff sourced (Lighthouse), leave the rest unsourced/hidden
- [x] `src/components/Projects.jsx:295-310` — comment rewritten; sort kept, Raslipwani (01) leads — the ordering comment says Raslipwani is last *because* it's in maintenance. Once both have captures, decide the order deliberately and rewrite the comment.
- [x] `src/components/Projects.test.jsx:236-249` — flipped — test asserts "Visit Site Anyway" + "scheduled maintenance window". Flip it to assert "View Live Platform" and *no* maintenance notice.
- [x] `src/components/Projects.jsx:50-52` `NoCaptureNotice` — unchanged, still used by CAD Web Viewer — still valid for any future project; no change unless it becomes dead code.
- [x] `docs/CHANGELOG.md` — entry added, known-issue line resolved — add an entry; remove/resolve line ~167 ("No screenshots exist for Raslipwani … until ~5 Sept 2026").
- [x] `src/components/Hero.jsx`, `Philosophy.jsx`, `Skills.jsx` — Hero figure swapped for the bundle budget, Skills Clerk→Supabase Auth; Philosophy untouched (no figure) — mention Raslipwani (3s → 1.2s, Clerk, Vitest). Only touch if the handoff contradicts them.
- [x] `npm test && npm run build` green before committing.

---

## 7. Collected repo data — 2026-09-14

Everything below was produced by running §2/§3 against `main` at
`d3e978bba4e3889b6b9b75f76a33826bee8112fb`. It is the raw material for
`RASLIPWANI_HANDOFF.md`; §7.9 is that file pre-filled. The full vitest suite was
**not** re-run (≈10 min); test/coverage numbers come from the last committed
`coverage/` output (2026-09-08) and `ROADMAP.md`.

### 7.1 Identity & recency
```
HEAD      d3e978bba4e3889b6b9b75f76a33826bee8112fb  2026-09-11
          feat: enhance PropertyModal with lazy loading and improved image carousel
first     2025-06-17
last      2026-09-11
commits   235
repo      https://github.com/voyyani/raslipwani
```

### 7.2 Stack (`package.json` @ `d3e978b`)

| Portfolio claim | Status | Actual |
|---|---|---|
| React 18.3 | ✅ | `react` / `react-dom` ^18.3.1 |
| Vite 6.3 | ✅ | `vite` ^6.3.5 |
| Supabase / PostgreSQL | ✅ | `@supabase/supabase-js` ^2.50.0; 14 SQL migrations in `supabase/migrations/` |
| Tailwind | ✅ | `tailwindcss` ^3.4.17 |
| React Query | ✅ | `@tanstack/react-query` ^5.90.19 |
| FullCalendar | ✅ | `@fullcalendar/{react,daygrid,timegrid,list,interaction}` ^6.1.20 |
| Framer Motion | ✅ | `framer-motion` ^12.43.0 |
| **Clerk Auth** | ❌ **drop** | Not in deps. Removed in `14ac8e5`. Replaced by **Supabase Auth** (`src/services/auth.js`) + `admin_users` table with `role IN ('admin','agent')` (`supabase/migrations/008_admin_users.sql:13`) |
| Vercel Analytics | ✅ | `@vercel/analytics` ^1.6.1 **+ `@vercel/speed-insights`** ^1.3.1 (both lazy-loaded, `src/App.jsx:71-77`) |
| **EmailJS** | ❌ **drop** | Not in deps, not in `src/`. Email is **Resend** ^6.25.0 via Vercel serverless `api/send-email.js` |
| Cloudinary | ✏️ reword | No SDK. Hosted media (`res.cloudinary.com`, `src/App.jsx:89`) + admin-configurable unsigned upload preset (`src/pages/admin/settings/CloudinarySettings.jsx`). Say "Cloudinary (media CDN)" not "Cloudinary SDK" |
| Vitest | ✅ | `vitest` ^4.0.17, `@vitest/coverage-v8` ^4.1.11, `@vitest/ui` |
| RTL | ✅ | `@testing-library/react` ^16.3.1, `jest-dom` ^6.9.1, `user-event` ^14.6.1 |

**Major things not on the portfolio list:** `react-router-dom` ^6.30.1, `react-hook-form` ^7.71.1 + `@hookform/resolvers` + `zod` ^4.3.5 (form validation), `react-helmet-async` ^2.0.5 (SEO), `react-quill` ^2.0.0 / `quill` ^2.0.3, `papaparse` ^5.5.3 (CSV), `date-fns` ^4.1.0, `lucide-react`, `react-hot-toast`, `resend`, `axe-core` ^4.13.0 (a11y tests), `@lhci/cli` ^0.15.1 (Lighthouse CI), ESLint 9 with custom rules in `eslint-rules/`.

### 7.3 Technical highlights — verified in code

| Highlight | Result | Source |
|---|---|---|
| Server-side pagination, **20 items/page** | ✅ | `src/hooks/usePagination.js:10` (`pageSize = 20`), `src/pages/admin/AdminProperties.jsx:55`, `src/pages/admin/ClientManagement.jsx:64` |
| Search debounce **500 ms** | ✅ | `src/hooks/useDebounce.js:9` (`delay = 500`), used at `AdminProperties.jsx:50`, `ClientManagement.jsx:46` |
| React Query staleTime **5 min** | ✅ (reword) | `src/services/cachePolicy.js:11-17` — three-tier policy `live` 30 s / `standard` 5 min / `static` 30 min; global default `STALE_TIME.standard` at `src/App.jsx:29` |
| Optimistic updates w/ rollback | ✅ **add** | `src/pages/admin/bookings/useBookingReschedule.js:22` (`onMutate`), tested in `src/pages/admin/__tests__/AdminBookings.test.jsx:263` |
| PostgreSQL full-text search | ❌ **drop** | No `tsvector`, `to_tsvector`, `textSearch` or `fts` in `src/` or `supabase/`. Search is `ilike`-style filtering |
| Code splitting (`React.lazy`) | ✅ | `src/App.jsx:34-82` — every public + admin route lazy-loaded; PropertyModal lazy-loaded too (`d3e978b`) |
| Error boundaries | ✅ | `src/components/ErrorBoundary.jsx`, wired in `src/App.jsx`, tested |
| Cloudinary | ✅ (media CDN) | `src/App.jsx:89`, `src/pages/admin/settings/CloudinarySettings.jsx` |
| Email provider | **Resend** | `api/send-email.js` (admin notification + customer confirmation) |
| Maintenance mode toggle | ℹ️ | `VITE_MAINTENANCE_MODE` env flag → `src/pages/MaintenancePage.jsx` (`src/App.jsx:93-118`). `.env` has it commented out (off) |

### 7.4 Database schema (source: `supabase/migrations/000-013`, parsed 2026-09-14)

Column counts are the net of `CREATE TABLE` + `ADD COLUMN` − `DROP COLUMN` across the
chain (000_baseline already includes what 002/003b re-add with `IF NOT EXISTS`).

| table | cols | idx | holds |
|---|---|---|---|
| `properties` | 25 | 5 | listings; `segment` ∈ `un-diplomatic / corporate / student` (013) |
| `bookings` | 26 | 12 | viewing appointments, status, admin fields (002, 003b) |
| `clients` | 27 | 6 | CRM contacts (001) |
| `client_property_interests` | 8 | 3 | client ↔ property interest join (001) |
| `client_communications` | 11 | 4 | call/email/WhatsApp log per client (001) |
| `admin_settings` | ~70 | 1 | single-row site config: Cloudinary, email, business hours, branding (003a + 005; 010 consolidates the legacy `settings` table into it) |
| `booking_notes` | 7 | 3 | admin notes on bookings (003b) — *not on portfolio* |
| `email_templates` | 9 | 2 | Quill-edited transactional templates (004) — *not on portfolio* |
| `admin_users` | 4 | 0 | Supabase-Auth-linked admin/agent roles (008) — *not on portfolio* |
| ~~`settings`~~ | — | — | dropped in 010 |

Also citable: RLS on every table with `public.is_admin()` SECURITY DEFINER gate (008/009),
emergency lockdown migration (007), definer-RPC closure (011/012). Migrations have their
own test folder `supabase/__tests__/`.

### 7.5 Feature / route inventory

Public routes (`src/App.jsx`): `/`, `/properties`, `/properties/:id`, `/property/:id`,
`/listings`, `/services`, `/services/viewing`, `/about`, `/contact`, `/contact-us`,
`/privacy`, `/terms`, `/maintenance`, `*`.
**Shelved (commented out):** `/international`, `/international/un-housing` — files kept
in `src/pages/International.jsx`, `src/pages/UNHousing.jsx`, `src/pages/international/`
(`src/App.jsx:46-51, 162-165`, commit `8075b2f`).
Admin routes (`/admin`, `/admin/login`): `index` Dashboard, `properties`, `bookings`,
`viewings`, `clients`, `clients/:id`, `settings`.

| Feature bullet | Verdict | File |
|---|---|---|
| UN Housing / International portal | **drop or mark shelved** | `src/App.jsx:162-165` (commented) |
| Property listings + detail modal/page | keep | `src/pages/Properties.jsx`, `PropertyDetail.jsx`, `src/components/PropertyModal*` |
| Property segments (diplomatic / corporate / student) | **add** | `supabase/migrations/013_property_segments.sql` |
| Viewing booking flow | keep | `src/features/bookings/Bookings.jsx`, `/services/viewing` |
| Booking email notifications | reword → "Resend transactional email (admin + customer)" | `api/send-email.js` |
| Admin dashboard | keep | `src/pages/admin/Dashboard.jsx` |
| Admin property CRUD w/ pagination + debounced search | keep | `src/pages/admin/AdminProperties.jsx` |
| Booking calendar (FullCalendar) w/ optimistic reschedule | keep | `src/pages/admin/AdminBookings.jsx`, `bookings/BookingCalendarView.jsx`, `bookings/useBookingReschedule.js` |
| Booking notes | **add** | `booking_notes` table, `src/pages/admin/BookingDetailModal.jsx` |
| Client CRM (contacts, interests, comms log) | keep | `src/pages/admin/ClientManagement.jsx`, `ClientDetail.jsx`, `ClientForm.jsx` |
| CSV export | keep | `src/utils/exportUtils.js` (papaparse), used in `AdminBookings.jsx` |
| Quill rich-text email templates | keep | `src/pages/admin/settings/EmailSettings.jsx`, `email_templates` table |
| Business-hours settings (drives calendar) | keep | `src/pages/admin/settings/BusinessHoursSettings.jsx`, `src/contexts/SettingsContext.jsx` |
| Cloudinary upload settings w/ test button | keep | `src/pages/admin/settings/CloudinarySettings.jsx` |
| Role-based admin access (admin / agent) | reword → Supabase Auth, not Clerk | `src/services/auth.js`, `migrations/008_admin_users.sql` |
| Row-level security | **add** | `migrations/009_auth_rls_policies.sql`, `006`, `007`, `012` |
| Mobile admin bottom nav | **add** | `src/pages/admin/AdminBottomNav.jsx` |
| Maintenance mode | keep (env-gated) | `src/pages/MaintenancePage.jsx` |
| SEO (helmet, sitemap) | keep | `react-helmet-async`, `public/sitemap*` |
| Design system w/ enforced budgets | **add** | `DESIGN.md`, `palette-budget.json`, `label-budget.json`, `file-size-budget.json`, `bundle-budget.json`, `eslint-rules/`, `src/design/` |
| Accessibility gate | **add** | `npm run test:a11y` (axe-core) in CI; Lighthouse a11y ≥ 0.95 is a hard error |

### 7.6 Tests & coverage (not re-run; last committed artefacts)

- Test files: **76** `*.test.*` under `src/`, `api/`, `supabase/` (`find`, 2026-09-14); `ROADMAP.md:70` records "70 files, 580 passing at the last full run"
- Coverage (`coverage/coverage-final.json`, generated 2026-09-08): **58.02 % lines · 57.11 % statements · 48.36 % functions · 46.54 % branches** across 196 files
- Configured CI floor (`vitest.config.js:130-135`): lines 57 · functions 47 · branches 45 · statements 56 — a ratchet ("raise as coverage grows, never lower"), Phase 3 target 70 %
- **The portfolio's "90 % target" has no source in the repo** → replace with "57 % ratcheting floor, 58 % actual" or drop

### 7.7 CI/CD & deployment

- **GitHub Actions: yes** — `.github/workflows/ci.yml`: job *Lint, test, build* (npm ci → lint → test:coverage → palette/label/file-size ratchets → axe a11y → build → bundle:report → check:console → upload dist) + job *Lighthouse (mobile)* (`@lhci/cli`, `lighthouserc.json`)
- **Vercel: yes** — `vercel.json` (framework vite, SPA rewrite excluding `/api/`), serverless functions in `api/` (`send-email.js`, `_lib/`); `server: Vercel` header on the live domain

### 7.8 Live-site check — PASSED 2026-09-16 in headless Chromium

```
/                 → HTTP 200, maintenance-words: 0, "Premium Real Estate in Kenya | Raslipwani Properties"
/properties       → HTTP 200, maintenance-words: 0, "Properties for Sale & Rent Across Kenya | …"
/services         → HTTP 200, maintenance-words: 1 (the word "Maintenance" in a Property Management service bullet — not a maintenance page)
/services/viewing → HTTP 200, maintenance-words: 0
/about            → HTTP 200, maintenance-words: 0
/contact          → HTTP 200, maintenance-words: 0
/admin/login      → HTTP 200, maintenance-words: 0, "Admin Sign In | Raslipwani Properties"
```
Home page renders the real product (hero "Kenyan property, handled properly.", search
panel, featured properties). `checkedOn` = **16 Sep 2026**. Screenshots captured the
same day (§4 done). Lighthouse on the live URL still not run.

#### Earlier attempt — 2026-09-14 (curl, blocked by the Vercel checkpoint)

```
/            → HTTP 429, maintenance-words: 0
/properties  → HTTP 429, maintenance-words: 0
/services    → HTTP 429, maintenance-words: 0
/about       → HTTP 429, maintenance-words: 0
/contact     → HTTP 429, maintenance-words: 0
/admin       → HTTP 429, maintenance-words: 0
/admin/login → HTTP 429, maintenance-words: 0
```
The 429 body is `<title>Vercel Security Checkpoint</title>` (Vercel Attack Challenge
Mode / bot protection), served with `server: Vercel`, same result with a Chrome
user-agent. It is **not** the app's maintenance page. `curl` cannot pass the JS
challenge, so the §3 pass condition is **unverified**, not failed. To flip the flag:
open `https://raslipwani.co.ke/` in a browser on the day, confirm the real home page,
and record that date as `checkedOn`. Consider turning Attack Challenge Mode off in the
Vercel project settings so Playwright (§4) and Lighthouse can reach the site.

- Lighthouse on the live URL: **not run** (blocked by the checkpoint). CI Lighthouse runs against `localhost:4173` preview only.
- Redirects: none observed (`url_effective` == requested URL).

### 7.9 Pre-filled `RASLIPWANI_HANDOFF.md`

```markdown
# Raslipwani handoff — 2026-09-14

## Live check
- Checked on: UNVERIFIED — HTTP 429 Vercel Security Checkpoint on every route (see §7.8). Re-check in a browser before flipping.
- Routes tested / result: 7 routes, all 429 challenge page, maintenance-words 0
- Lighthouse: not run on live URL (blocked). CI job "Lighthouse (mobile)" exists — cite a green run from Actions instead.

## Stack (from package.json @ d3e978b)
React 18.3.1 · Vite 6.3.5 · Supabase JS 2.50 (Postgres + Auth + RLS) · Tailwind 3.4.17 ·
TanStack Query 5.90 · FullCalendar 6.1.20 · Framer Motion 12.43 · React Router 6.30 ·
React Hook Form 7.71 + Zod 4.3 · react-helmet-async 2.0 · Quill 2 / react-quill 2 ·
papaparse 5.5 · Resend 6.25 (Vercel serverless) · Vercel Analytics 1.6 + Speed Insights 1.3 ·
Cloudinary (media CDN, no SDK) · Vitest 4.0 + RTL 16.3 + axe-core 4.13 · Lighthouse CI 0.15 · ESLint 9
- EmailJS still in use? **no** → replaced by Resend, `api/send-email.js`
- Clerk still in use? **no** → Supabase Auth, `src/services/auth.js` (removed in 14ac8e5)

## Verified highlights
- Page size: 20 (src/hooks/usePagination.js:10)
- Debounce: 500ms (src/hooks/useDebounce.js:9)
- staleTime: 5 min standard / 30 s live / 30 min static (src/services/cachePolicy.js:11-17; src/App.jsx:29)
- Optimistic updates: yes (src/pages/admin/bookings/useBookingReschedule.js:22)
- Full-text search: NO — drop from portfolio
- Code splitting: yes (src/App.jsx:34-82) · Error boundaries: yes (src/components/ErrorBoundary.jsx) · Cloudinary: yes, CDN only

## Schema (source: migrations, 2026-09-14)
| table | cols | idx | holds |
| properties | 25 | 5 | listings, segment |
| bookings | 26 | 12 | viewing appointments |
| clients | 27 | 6 | CRM contacts |
| client_property_interests | 8 | 3 | client↔property |
| client_communications | 11 | 4 | comms log |
| admin_settings | ~70 | 1 | site config |
| booking_notes | 7 | 3 | admin notes (new) |
| email_templates | 9 | 2 | Quill templates (new) |
| admin_users | 4 | 0 | roles (new) |

## Features — keep / reword / drop
See §7.5. Drop: UN Housing/International (shelved), PostgreSQL FTS. Reword: Clerk→Supabase Auth, EmailJS→Resend.
Add: property segments, optimistic reschedule, booking notes, RLS, mobile admin nav, design-system budgets, a11y gate.

## Tests
- 76 test files; 580 passing at last full run (ROADMAP.md:70); coverage 58.02% lines (2026-09-08); configured floor 57% lines. "90%" is unsourced.

## CI/CD
- GitHub Actions: yes (.github/workflows/ci.yml, 2 jobs) ; Vercel: yes (vercel.json + api/)

## Performance figures with a source
- First-load JS 220.7 → 112.8 kB gzip (bundle-budget.json, measured 2026-09-08, enforced by `npm run bundle:report` in CI)
- Lighthouse CI thresholds: perf ≥0.90, a11y ≥0.95 (error), BP ≥0.90, SEO ≥0.90 on mobile (lighthouserc.json) — thresholds, not scores
- Everything else on the portfolio (3s→1.2s, TTI, FCP, API, DB, 98/100) is UNSOURCED

## Screenshots
| file | alt | caption |
| — | not captured: live site behind Vercel Security Checkpoint on 2026-09-14 | — |

## Corrections to the portfolio (things that were wrong)
- Clerk Auth → Supabase Auth
- EmailJS → Resend
- "PostgreSQL FTS" → not implemented
- Coverage "90% target" → 57% floor / 58% actual
- databaseSchema counts → see table above (+3 tables missing)
- UN Housing portal → shelved, not public
- All performance figures except bundle size → unsourced
```
