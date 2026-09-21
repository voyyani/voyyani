# Culture Szn — portfolio intake form

**Who this is for:** the Claude session running inside the Culture Szn repository.
**What it produces:** the raw material for a third project entry in Karisa's portfolio
(`karisa-portfolio/src/data/projects.js`), alongside Raslipwani Properties and Neema
Foundation Kilifi.

Fill this in by reading the repo, not by guessing. Every answer should be something you
could point to a file, a commit, a config value or a live URL for. Where you cannot,
write `UNKNOWN` — a blank is far more useful than a plausible invention, because the
portfolio has a hard rule that unverified claims do not reach the page.

Return the completed form as a single markdown file. Keep the section numbers so the
answers can be mapped back onto the portfolio schema.

---

## 0. Ground rules for filling this in

1. **Cite as you go.** After each factual claim, note where it came from:
   `(package.json)`, `(src/hooks/useThing.ts)`, `(commit abc1234)`, `(live: /route)`.
2. **Numbers need an artifact.** A figure (load time, coverage, bundle size, user count,
   Lighthouse score) may only be reported together with *who measured it, against what,
   on what date, and where the report lives*. A number with no artifact goes in
   §8b "Unsourced figures" — not in §8a.
3. **Shipped means shipped.** Only list features that are reachable on the current
   default branch and (if there is a live site) on the live site. Commented-out routes,
   feature-flagged-off work and half-finished branches go in §14 "Not shipped".
4. **Record the commit you checked against.** `git rev-parse --short HEAD` and the
   branch name, plus today's date, go in §1. Every answer is "as of" that commit.
5. **Plain language.** Describe what the product does for the person using it before
   describing how it is built. No adjectives you can't defend ("blazing", "robust",
   "seamless").
6. **Don't flatter the project.** If the test suite is thin, say so. If auth is a
   hard-coded password, say so. The portfolio will decide what to show; your job is to
   be accurate.

---

## 1. Verification stamp

| Field | Answer |
|---|---|
| Repository URL | |
| Default branch | |
| Commit checked (`git rev-parse --short HEAD`) | |
| Date checked (YYYY-MM-DD) | |
| Is the repo public or private? | |
| Last commit date (`git log -1 --format=%cd`) | |
| First commit date (`git log --reverse --format=%cd \| head -1`) | |
| Total commits (`git rev-list --count HEAD`) | |
| Contributors (`git shortlog -sn`) — name + count | |

---

## 2. Identity

| Field | Answer |
|---|---|
| Official product name (exact casing — "Culture Szn"? "CultureSzn"? "CULTURE SZN"?) | |
| One-line tagline (≤ 60 chars, what it *is*, e.g. "Real estate booking & client management") | |
| Category — pick one: `Full-Stack` / `Frontend` / `Backend` / `Mobile` / `Design System` / `Tooling` / other (say what) | |
| Who is the client / owner? (organisation, individual, personal project, side business) | |
| Where are they based? (city/county/country — the other two entries name Kikambala and Ganze, Kilifi) | |
| What sector? (e.g. events, fashion, music, media, e-commerce, community) | |
| Karisa's role (sole developer / lead / contributor — and if contributor, which parts) | |
| Was this paid client work, a personal project, or something else? | |
| Timeline: when did work start and when did it ship (or is it still in progress)? | |

---

## 3. What it does — in plain language

**3a. Two-sentence summary** (this goes on the project card; a visitor who reads nothing
else should understand what the product is and who it's for):

>

**3b. Full description** (one paragraph, 80–140 words; who the client is, what the public
side lets people do, what the private/admin side lets staff do — model it on: *"A
property management platform for a Kenyan real-estate agency… The public side lets
buyers search listings and book viewings; the admin side is where the agency actually
works…"*):

>

**3c. Who are the users?** List each distinct kind of user and what they do in the
product (e.g. "public visitor — browses the lineup and buys a ticket"; "organiser —
creates events and checks people in"; "admin — manages users and settings"):

-
-

---

## 4. The problem and the answer

The portfolio frames each project as one **challenge** and one **solution** — a single
technical or product problem that the case study argues about, not a list of everything
built. Pick the *one* thing this project turned on.

**4a. Challenge** (2–3 sentences. What was hard, or what was broken before, and who was
paying for it? Be concrete: numbers, volumes, pain, constraints):

>

**4b. Solution** (one paragraph. What specifically was done, in what order, and what
it changed. Name the mechanisms — the hook, the query pattern, the policy, the queue —
not just the outcome. If there's a measurable before/after, state it *with its source*):

>

**4c. Why this and not the obvious alternative?** (One or two decisions where a simpler
or more common approach was rejected, and why):

-

**4d. The one diagram.** The portfolio draws a hand-authored SVG per project that shows
the *mechanism* the case study argues (Raslipwani: the request path before/after
caching+pagination+debounce; Neema: the UI and a raw API request both landing on the
same RLS policy). Describe, in words, the single picture that would explain Culture
Szn's key decision — the boxes, the arrows, what's labelled, what the "before" vs
"after" or "path A vs path B" is:

>

---

## 5. Technologies

**5a. Dependency inventory.** Paste the relevant sections of `package.json` (or
equivalent: `requirements.txt`, `go.mod`, `pubspec.yaml`…) — `dependencies` and
`devDependencies` with versions. If there are multiple packages/workspaces, paste each.

```json

```

**5b. Curated technology list** (10–18 items, in the form the portfolio uses —
`"React 18.3"`, `"Supabase"`, `"Tailwind CSS"`, `"Vitest"`. Include major version where
it's meaningful. Only things actually in the dependency tree or actually used as a
service. Note anything that *looks* like it's used but isn't — e.g. a leftover import
of a removed library):

-
-

**5c. External services** (hosting, database, auth provider, email, payments, media CDN,
analytics, maps, SMS, etc.) — for each: what it's used for and where in the code it's
wired up:

| Service | Used for | Where (file / env var) |
|---|---|---|
| | | |

---

## 6. Architecture

Fill in every line that applies; delete lines that don't. Each answer should name the
actual thing (`"React 19 + TypeScript + Vite 7"`), not a category.

| Layer | Answer |
|---|---|
| Frontend framework + build tool | |
| Language (JS / TS — strict mode?) | |
| Styling | |
| State management (server state / UI state) | |
| Routing | |
| Forms + validation | |
| Backend / API (framework, or BaaS like Supabase/Firebase) | |
| Database (engine, hosted where) | |
| Auth (provider, session strategy, roles) | |
| File / media storage | |
| Email / notifications | |
| Payments (if any — provider, what flows) | |
| Background jobs / queues / cron (if any) | |
| Deployment (host, edge/serverless functions, CDN) | |
| CI/CD (what runs on push — lint, tests, build, budgets, Lighthouse?) | |
| Testing (frameworks, what's covered) | |
| Monitoring / analytics | |

**6b. Repo layout.** Paste `tree -L 2 -I node_modules` (or similar) and one line per
top-level directory saying what lives there:

```

```

---

## 7. Features

**7a. Public-facing features** (one line each, 8–17 items, each one traceable to a
route or component — append the file path in parentheses):

-
-

**7b. Admin / staff features** (one line each — the dashboard, CRUD screens, workflows,
exports, settings. If there is no admin side, say `NONE`):

-
-

**7c. Technical highlights** (8–12 items — the engineering decisions worth naming:
pagination strategy, caching policy, lazy-loading, RLS, optimistic updates, sanitisation,
reduced-motion handling, CI gates, budgets. Each with its file path. These are *not*
features; they're how the features are built well):

-
-

---

## 8. Metrics

### 8a. Sourced figures (these can be shown)

Only figures that have an artifact. For each: label, value, and a `source` sentence in
the portfolio's style — *"220.7 → 112.8 kB gzip, bundle-budget.json in the repo,
measured 2026-09-08 and enforced in CI"*.

| Label | Value | Source (who / what / when / where the report lives) |
|---|---|---|
| | | |

Things to look for: a committed coverage report, a bundle-size budget file,
`lighthouserc.json` thresholds, a `bundle-budget.json`, CI logs, a Web Vitals dashboard,
a database row count you can query, analytics you can screenshot, numbers the client
publishes on their own live site.

### 8b. Unsourced figures (recorded, not shown)

Figures that are claimed somewhere (README, old docs, memory) but have no artifact
behind them. List them so nothing is lost, and say where the claim came from.

| Label | Value | Where the claim appears | What would be needed to source it |
|---|---|---|---|
| | | | |

---

## 9. Database schema

If there's a relational database, list every table. Column and index counts should be
computed from the migrations (net of `CREATE TABLE` + `ADD COLUMN` − `DROP COLUMN`), not
estimated. If it's a document store, list collections and their shape instead. If there
is no database, write `NONE`.

| Table | Columns | Indexes | What it holds (plain language, ≤ 10 words) |
|---|---|---|---|
| | | | |

**9b. Access control at the data layer.** Is there row-level security / policies /
rules? Paste or summarise the key policy, and name the file. If access control is *only*
in the application layer, say so plainly.

>

**9c. Migrations.** How many, where do they live, and how are they applied?

>

---

## 10. Security & auth

- Auth provider and flow:
- Roles / permission tiers (name each, and what it can and can't do):
- Where permissions are enforced (DB policies / API middleware / UI only):
- Input sanitisation (rich text, uploads, forms):
- Secrets handling (env vars, what's committed vs not — check `.gitignore` and `git log -p` for leaked keys; if any were ever committed, note it):
- Anything a reviewer would flag as a weakness (be honest — this is for Karisa's eyes, not the page):

---

## 11. Performance & quality gates

- Test files: how many, what framework, what they cover (`find . -name "*.test.*" | wc -l`):
- Coverage: is there a report? Committed? Enforced floor in CI?
- Lint / type-check config and whether CI blocks on it:
- Bundle size: any budget? Measured value? (paste from the build output if nothing else)
- Lighthouse / Web Vitals: any config, any recorded run?
- Lazy loading / code splitting: where?
- Accessibility work: any audit, axe-core, reduced-motion handling, keyboard nav?

---

## 12. Live site

| Field | Answer |
|---|---|
| Live URL (production) | |
| Staging / preview URL (if any) | |
| Is it currently reachable? (open it — status code, does it render the product?) | |
| Date you checked it (YYYY-MM-DD) | |
| Does the live site match the default branch, or is it behind? | |
| Is there a public route that shows the *product* (not just a landing page)? Which? | |
| Are there routes behind login that would need Karisa's own credentials to screenshot? | |

**12b. Screenshot plan.** The portfolio captures 4–6 pages per project at 1440×900 @2x
via `scripts/capture-screenshots.mjs` (each is `[slug, path]`). Recommend the pages that
best show the product, in order, with a one-line note on what each frame shows:

| Slug | Path | What's in the frame |
|---|---|---|
| home | / | |
| | | |

**12c. For each screenshot, draft the alt text and caption.** Alt describes *what is in
the frame* (headline text, layout, what's pictured); caption says *what the page does /
why it matters* (e.g. *"Listings — server-side paginated grid with purpose, type and sort
filters"*). Draft these from what you know of the pages; Karisa will correct them
against the real captures.

-

---

## 13. Key achievements

3–5 lines, each distinct from the others and from the feature lists. Outcome-shaped, not
task-shaped: *"Replaced the agency's spreadsheet-based client tracking with a real CRM"*,
not *"Built a CRM"*. Each should be defensible from the repo or the live site.

-
-
-

---

## 14. Not shipped / caveats

Anything that exists in the repo but is not live, is disabled, is stubbed, or should not
be claimed: commented-out routes, feature flags off, TODOs in core flows, planned
integrations, abandoned branches. Also anything the README claims that the code doesn't
support.

-

---

## 15. Story material (for the Philosophy / Hero sections)

The portfolio also has a "Philosophy" section that pairs a working principle with a
specific project moment (*"A spec that says 'should be fast' cannot be checked. One that
says 'under 1.5s on a 3G connection' can."* — Raslipwani), and a Hero stat with an
artifact behind it.

**15a.** Is there one moment in this project's history — a bug, a rewrite, a constraint,
a decision — that illustrates a general principle about how Karisa works? Tell it in 2–4
sentences with the commit(s) it happened in.

>

**15b.** Is there one figure from this project with a hard artifact behind it that could
stand as a hero stat? (label + value + source, or `NONE`)

>

**15c.** Anything notable in the git history worth mentioning — a major refactor, a
migration between stacks, a performance sprint, a security fix? (commit range + one
line each):

-

---

## 16. Open questions for Karisa

Anything you could not determine from the repo and need a human to answer (client
figures, user counts, whether something is confidential, which admin screens may be
shown publicly, whether the repo can be linked):

-

---

*When done, save this as `cultureszn-answers.md` in the Culture Szn repo (or paste it
back) — it will be turned into the third `PROJECTS` entry, a `SITES` entry in the
screenshot script, and a `CultureSznDiagram` in `ProjectDiagram.jsx`.*
