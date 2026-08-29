# Phase 4 — Content & Trust: Design

**Date:** 2026-08-29
**Status:** Approved, pending spec review
**Implements:** `docs/roadmapupdated.md` §6, Phase 4
**Branch:** `phase-0-foundation-and-truth`

---

## 1. Scope

Phase 4 delivers third-party proof and real long-form writing. Three items, one
of which was explicitly descoped during the design session:

| Roadmap item | Decision |
|---|---|
| 1. Two testimonials | **In.** Built with an approval gate; drafts written for Karisa to edit. |
| 2. Two deep-dive write-ups | **In.** New `/writing` route tree. |
| 3. CAD Web Viewer case study | **Deferred out of Phase 4** (Karisa's call, 2026-08-29). See §7. |

A fourth workstream — fixing the broken production deploy — is folded in because
Phase 4 cannot ship without it (§2).

### Out of scope

- Any change to `src/admin/**` or `supabase/functions/**` (Phase 0 freeze, still in force).
- The 10 pre-existing test failures on this branch (7 `ContactForm`, 3 email utils).
  They are unrelated to Phase 4 and are recorded as a baseline, not fixed here.
- Lighthouse/accessibility verification — that is Phase 5.

---

## 2. Deploy fix (prerequisite)

### The actual problem

`origin/main` is at `c4b52e4` — the pre-revamp inbound-email commit. Vercel's
production deployment tracks `main`. Every one of Phases 0, 0.5, 1, 2 and 3 lives
only on `phase-0-foundation-and-truth`, which has never been merged.

Verified against the live HTML at `https://www.voyani.tech` on 2026-08-29:

| Live site serves | This branch produces |
|---|---|
| `theme-color="#061220"` (pre-Phase-2 navy) | `#0B0B0C` |
| Cloudinary-hosted favicon | local `/favicon-32.png` |
| no `About` / `GitHubActivity` chunks | both present |

### On the environment variables

The premise that env vars were removed and broke the build does not hold, and the
spec records why so it is not re-litigated later:

- Nothing in this repo can modify Vercel's dashboard. The Vercel variables are intact.
- `.env` has never been in git — `.gitignore` excludes `.env*` except `.env.example`.
- `npm run build` was run on 2026-08-29 with **zero** `VITE_*` variables set. It
  completed green, 885 modules, 16 chunks.

What did change is that `src/lib/supabase.js` was **hardened** in Phase 0. It
previously called `createClient(supabaseUrl || '', supabaseAnonKey || '')`, which
throws `"supabaseUrl is required."` at import time. Because `App.jsx` imports it at
the top level, a missing admin-only credential white-screened the entire public
portfolio. It now exports `null` and callers null-check. That change makes the site
*more* resilient to missing env vars, not less.

### Changes

1. **New `karisa-portfolio/vercel.json`** — SPA rewrite sending all non-asset paths to
   `/index.html`. There is currently no `vercel.json` anywhere in the repo, so
   `/admin/login` and every future `/writing/*` URL hard-404 on Vercel even though `/`
   resolves. Required for Phase 4 regardless of the merge.
2. **Merge `phase-0-foundation-and-truth` → `main`.** This is the change that actually
   puts Phases 0–3 live. Requires Karisa's explicit go-ahead at the time of push —
   it is a production deploy.
3. **Karisa runs `vercel env pull karisa-portfolio/.env`** to restore local
   development credentials. This is the one step that cannot be done from the repo.

`vercel.json` rewrite must exclude real static assets so the SPA fallback does not
shadow `/assets/*`, `/images/*`, `/sitemap.xml`, `/robots.txt`, `/manifest.json`,
`/sw.js` or the résumé PDF.

---

## 3. Writing subsystem

### 3.1 Authoring format — decision

Three options were weighed:

| Option | Verdict |
|---|---|
| MDX (`@mdx-js/rollup`) | **Rejected.** A new build dependency and pipeline for two posts, and it does not cleanly embed the existing inline-SVG diagram components. |
| Markdown strings + a runtime parser | **Rejected.** Adds a parser dependency and loses the ability to embed `ProjectDiagram` at all. |
| **Plain JSX component per post + a metadata registry** | **Chosen.** No new dependency, full access to existing components, and the roadmap explicitly says "no CMS needed for two posts." |

### 3.2 File layout

```
src/writing/
  posts.js                          registry (metadata + lazy component per post)
  WritingIndex.jsx                  the /writing listing page
  PostLayout.jsx                    shared chrome: header, SEO, prose container, footer nav
  posts/
    raslipwani-performance.jsx
    neema-rbac.jsx
```

### 3.3 The registry

`posts.js` is the single source of truth for post metadata. Both the index page, the
homepage teaser, the router and the sitemap check read from it, so adding a third post
later is a one-entry change.

Each entry carries: `slug`, `title`, `dek`, `date` (ISO), `readingTime`, `tags`,
`description` (for meta), and `load` (a `() => import(...)` thunk).

### 3.4 Routing

In `App.jsx`, alongside the existing `/` and `/admin/*` routes:

- `/writing` → `WritingIndex`
- `/writing/:slug` → resolves against the registry; **unknown slug redirects to
  `/writing`** rather than rendering an empty layout.

Both lazy-loaded via `React.lazy`, matching how every other section in this file is
already loaded. They must sit outside the `HomePage` component.

### 3.5 Navbar — route awareness

`Navbar.jsx` currently defines `const LINKS = ['About', 'Projects', ...]` and renders
each as `<a href="#about">`. On a `/writing/*` route those anchors resolve against the
current path and silently do nothing.

`LINKS` becomes an array of `{ label, href }` objects. A `useLocation()` check (react-router
is already a dependency) rewrites section anchors to `/#about` form when the current path
is not `/`. A `Writing` entry is added pointing at `/writing`, rendered as a react-router
`<Link>` rather than an `<a>`.

Both the desktop list and the mobile menu render from the same `LINKS` array, so this is
one change, not two.

### 3.6 Homepage placement

Per the roadmap's §4 information architecture, the homepage order becomes:

```
Hero → About → Projects → Activity → Skills → Writing → Philosophy → Testimonials → Contact → Footer
```

The homepage `Writing` block is a teaser — the two post titles, deks and dates, linking
through to the real pages. It reads from the same registry, so it cannot drift out of
sync with `/writing`.

### 3.7 SEO

`SEO.jsx` already accepts `title`, `description`, `url` and `type` as props, so per-post
meta needs no refactor. One addition: an optional `article` prop carrying
`{ datePublished, dateModified }`, which emits an `Article` JSON-LD block alongside the
existing Person and WebSite schemas. When `article` is absent, output is byte-identical
to today's, so no existing call site changes behaviour.

### 3.8 Sitemap

`public/sitemap.xml` is rewritten. It is currently stale in three ways: `lastmod` reads
`2026-01-20` everywhere, four of its five entries are `#fragment` URLs that search
engines do not index as separate pages, and it uses bare `voyani.tech` while the live
host 307s to `www`.

New contents: `/`, `/writing`, and one entry per post. The `#fragment` entries are
dropped. Host and `lastmod` are made correct.

> The bare-vs-`www` canonical question (roadmap Phase 5, item 3) is **not** resolved
> here. The sitemap will use the same host as `SITE.url` so the two agree; deciding
> which host is canonical and making the redirect a real 301 stays in Phase 5.

### 3.9 Prose styling

A `.prose-signal` component class in `src/index.css`, in the existing `@layer components`
block next to `.eyebrow`, `.panel`, `.btn-signal` and `.btn-ghost`. It styles the
element tree a post produces — headings, paragraphs, lists, `blockquote`, `code`,
`figure`/`figcaption`, links.

It uses only the Phase 2 tokens already in `tailwind.config.js`: the `ink` ramp, the
single `signal` accent, Archivo for prose and JetBrains Mono for code, square corners.
`maxWidth.prose` (`68ch`) already exists in the config and sets the measure. No new
tokens are introduced — Phase 2's identity is settled and this phase does not reopen it.

---

## 4. The two write-ups

Both are expanded from data already in `src/components/Projects.jsx`. Nothing is invented.

### 4.1 "Cutting Raslipwani's load time from 3s to 1.2s"

`slug: raslipwani-performance`

Source material, all already in the repo:

- `challenge` — the fetch-everything symptom: fine at 40 listings, ~3s to first paint at 400.
- `solution` — the three fixes and their order.
- `technicalHighlights` — "Server-side pagination (20 items/page, 95% data reduction)",
  "Debounced search (500ms, 80% fewer API calls)", "React Query caching (5min stale time)".
- `metrics` — "Page Load: 3s → 1.2s".
- `ProjectDiagram` `projectId={1}` — the before/after request-path SVG, reused directly.

Structure: the symptom, who paid for it (agency staff, all day, on slow connections),
why it was slow, the three fixes each with its number, then optimistic updates with
rollback as the thing that came *after* the data layer became predictable enough to
trust — which is the honest sequencing and a better engineering story than listing four
techniques as equals.

### 4.2 "Building a 5-tier RBAC system for a non-profit CMS"

`slug: neema-rbac`

Source material:

- `challenge` — staff with no technical background must self-publish; a volunteer with
  gallery access must not reach donation details.
- `solution` — five tiers Super Admin → Viewer; TipTap + DOMPurify; drag-and-drop
  ordering; RLS in Postgres, "hiding a button is not access control."
- `technicalHighlights` — "5-tier RBAC with 20+ granular permissions", "PostgreSQL with
  Row-Level Security (RLS)", "DND Kit", "Zod + React Hook Form".
- `metrics` — "RBAC Tiers: 5" (already reconciled in Phase 0; one source said 6).
- `ProjectDiagram` `projectId={2}` — the convergence diagram, reused directly.

Structure: a decision log. The constraint, why five tiers and not three or ten, the
load-bearing decision (the check runs in the database, below both the UI and a
hand-rolled `curl`), what was cut, and what the tier count costs in practice.

### 4.3 Honesty constraints

- **No fabricated evidence.** There are no flamegraphs, profiler captures or Lighthouse
  traces in this repo. None will be invented, described, or implied.
- Numbers appear only where the repo already records them, and the posts say where they
  came from.
- Where a post would benefit from a fact the repo does not support, the source carries a
  `TODO(karisa):` comment that **never renders**. It is a note to the author, not
  shipped content.
- The Raslipwani post notes that the client site is currently behind a maintenance page
  (`liveStatus.state === 'maintenance'`, countdown to ~5 Sept 2026), consistent with what
  the project card already discloses.

---

## 5. Testimonials

### 5.1 The approval gate

Karisa asked for draft quotes he can edit. The risk that creates is a draft silently
going live as a real endorsement attributed to a real person. The design makes that
structurally impossible rather than relying on remembering.

`src/data/testimonials.js` — each entry is:

```js
{
  id, quote, name, role, org, project,
  approved: false,       // flipped to true ONLY after the client signs off
  sourceNote: '...'      // how/when the quote was obtained; never rendered
}
```

`src/components/Testimonials.jsx`:

- Filters to `approved === true` before rendering anything.
- Returns `null` when no entry is approved — the section does not appear on the page at
  all. No "testimonials coming soon" placeholder ships.
- Handles the one-approved case as a deliberate layout, not a two-column grid with a
  hole in it, since Karisa may well get one client back before the other.

### 5.2 Outreach

`docs/testimonial-outreach.md` — the two outreach emails, ready to send, one per client.
Each asks for the specific thing the roadmap wants: 2–3 sentences on what shipping the
platform changed for them, plus explicit permission to publish their name, role and
organisation on the site.

---

## 6. Tests

New:

- `Testimonials.test.jsx`
  - renders nothing when no entry is approved
  - renders only approved entries
  - **an unapproved quote's text never appears in the DOM** — this is the test that
    guards against a draft shipping as a real endorsement
- `writing/posts.test.js` — every registry entry has the required fields; slugs are unique
- `WritingIndex.test.jsx` — lists every post in the registry
- routing — `/writing/:slug` renders the matching post; an unknown slug redirects

Regression:

- `npm run lint` and `npm run build` stay green.
- `npm run test` failure count does not rise above the current baseline of **10**
  (7 `ContactForm`, 3 email utils). That baseline is reported as-is, not fixed and not
  quietly absorbed.
- Existing `Projects.test.jsx`, `Hero.test.jsx`, `Skills.test.jsx` and
  `GitHubActivity.test.jsx` keep passing — the `Navbar` `LINKS` change and the `SEO.jsx`
  `article` prop are the two edits with cross-component reach.

---

## 7. CAD Web Viewer — deferred, with reason

Phase 1 removed the CAD Web Viewer from the site at Karisa's request: it is commissioned
client work on a private deployment, nothing could be captured remotely, and it was the
only project with no visual at all. `Projects.jsx` now carries two projects and every
count on the page says 2.

Phase 4 item 3 would put it back. Karisa's decision on 2026-08-29 is to **leave it out of
Phase 4**. `roadmapupdated.md` is amended to record the deferral and this reasoning, so
the next reader does not re-open a settled question or treat the roadmap as unmet.

It remains in `RESUME.md`, which is a separate artifact and does not need a screenshot to
justify it.

---

## 8. Documentation updates

- `docs/roadmapupdated.md` — Phase 4 marked done; its Definition of Done amended to
  record the CAD deferral; §8 content-plan and §10 success-metrics rows updated;
  §11 "Immediate Next Actions" revised now that Phase 4 no longer gates on client outreach
  to *start*.
- `docs/CHANGELOG.md` — a Phase 4 entry in the existing Keep a Changelog format.

---

## 9. Definition of Done

- [ ] `vercel.json` exists; `/writing/*` and `/admin/*` resolve on Vercel rather than 404
- [ ] `phase-0-foundation-and-truth` merged to `main` and Phases 0–3 are live (gated on
      Karisa's go-ahead)
- [ ] `/writing` lists two posts; each has its own URL, title, meta description, canonical
      and `Article` JSON-LD
- [ ] Both write-ups are complete, grounded in repo data, with no fabricated evidence
- [ ] `Testimonials.jsx` ships with the approval gate and two editable drafts, rendering
      nothing until a quote is approved
- [ ] Outreach emails drafted in `docs/testimonial-outreach.md`
- [ ] Nav works from `/writing/*` back to homepage sections
- [ ] `lint` and `build` green; test failures still 10, with the new tests passing
- [ ] Roadmap and changelog updated, including the CAD deferral rationale
