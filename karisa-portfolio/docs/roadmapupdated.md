# Portfolio Revamp Roadmap — roadmapupdated.md

**Author:** Claude (audit + plan), for Karisa Voyani
**Date:** 2026-08-28
**Supersedes:** `ROADMAP.md`, `PROJECT_ROADMAP_UPDATED.md`, `AUDIT.md`, and every `PHASE*_*.md` file in this folder — those tracked the inbound-email/admin subsystem and self-rated the site "9.0/10 world-class" with zero screenshots to back it up. This document does not carry that rating forward. Treat this as the single source of truth going forward; archive the rest (see Phase 0.5).
**Goal:** turn this repo into a portfolio that gets Karisa hired (as an employee) or hired (as Voyani LLC) in 2026 — not a portfolio that scores well on a self-written rubric.

---

## 0. How to use this document

Each phase has: a goal, a numbered task list with exact files to touch, which Claude Code skill to invoke (if any), and a Definition of Done you can check against. Work top to bottom — later phases assume earlier ones landed. Do not start Phase 2 (visual redesign) before Phase 0 (real content wired in) — designing around placeholder content wastes the redesign.

Every task below was verified against the actual repo state on 2026-08-28, not against other docs' claims about it.

---

## 1. Executive Summary

**Real state, evidence-based (not the 9.0/10 in AUDIT.md):**

The engineering foundation is genuinely good — React 19, Vite 6, real passing Vitest coverage on core components, clean ESLint, no leaked secrets. Two of the three showcased projects are real, live, non-trivial platforms. There's a strong, differentiated personal story (Mechanical Engineer → Full-Stack Developer) that's currently wasted.

But the site as it stands would not convert a hiring manager or client, because:

1. **It has zero images.** `public/` contains a manifest, robots.txt, sitemap.xml, and vite.svg — no headshot, no product screenshot, nothing. Every project is a 900-line text modal.
2. **Real assets already exist but aren't connected**: a professional headshot, a resume (PDF + HTML + Markdown), and a third project (CAD Web Viewer) all sit at the repo root, unused by the live site.
3. **Recent engineering effort went to the wrong place** — the last several commits and ~144 doc-file changes are almost entirely the inbound-email/spam-detection/CRM admin system, not the public-facing story.
4. **There's a public `/admin` login link in the main nav** (`src/components/Navbar.jsx`), visible to every visitor including hiring managers.
5. **There is no About section on the live site at all.** `src/sections/AboutSection.jsx` exists but is a 0-byte dead stub; it was never built, never wired in.
6. Credibility signals are self-reported and unverifiable (99.9% uptime, precise 95% skill bars, "10,000+ lines of code") instead of provable (screenshots, live GitHub activity, a real before/after write-up).
7. Visual identity — dark navy/cyan/gold, animated gradient blobs, glassmorphism cards — is a competent execution of the most common AI-scaffolded-portfolio look of the era. It doesn't read as *Karisa's*.

**The fix, in one sentence:** stop building backend infrastructure nobody but you will see, wire in the real content you already have, show the work instead of describing it, and give the site a visual identity that isn't the default.

---

## 2. Evidence-Based Audit

### 2.1 What's genuinely strong — keep and lean on this

| Strength | Evidence |
|---|---|
| Modern, disciplined stack | React 19.1, Vite 6.3, TypeScript (partial), Tailwind, `package.json` |
| Real test coverage, not padding | `Hero.test.jsx`, `Projects.test.jsx`, `Skills.test.jsx`, `ContactForm.test.jsx`, `emailSanitizer.test.ts`, `emailValidation.test.ts` all present and exercised |
| Code-splitting already done | `React.lazy()` for Skills/Projects/Philosophy/ContactSection/Footer in `src/App.jsx:25-29` |
| No leaked secrets | Grepped for live API key patterns across `src/`, `supabase/`, `docs/` — every instance is a placeholder or `Deno.env.get(...)` |
| Two real, live, technically deep client projects | raslipwani.co.ke (real estate SaaS, RBAC, RLS, live) and neemafoundationkilifi.org (non-profit CMS, 5-tier RBAC, live) — both confirmed reachable |
| A genuinely differentiated narrative | Mechanical Engineering (CATIA, MATLAB, FEA, Shenyang Agricultural University) → Full-Stack Dev. Almost no other candidate has this. Currently reduced to a rotating badge in the hero and nothing else. |
| A real headshot and resume already exist | `profile-photo.png` (2MB, professional, repo root), `resume.pdf` / `resume.html` / `RESUME.md` (repo root) — none referenced anywhere in `karisa-portfolio/` |
| A third real project, undocumented on-site | "CAD Web Viewer" — Three.js/WebGL 3D model viewer, "reduced client review cycles by 65%" — described in `RESUME.md` line 88-93, absent from `src/components/Projects.jsx` |

### 2.2 Critical gaps, ranked by hiring impact

1. **No visual proof anywhere on the site.** `public/` has 4 files, none of them images. `src/components/Projects.jsx` (878 lines) describes both projects entirely in text — descriptions, bullet lists, "database schema" as monospace text blocks — with zero screenshots, GIFs, or embeds. A hiring manager gives a portfolio ~6 seconds before deciding whether to keep reading; there is currently nothing for them to look at.
2. **Effort went into the wrong subsystem.** `git log` shows the most recent commit is *"feat: implement world-class inbound email system with comprehensive tracking, spam detection, and analytics integration"* — full CRM: `SpamQuarantineView.tsx`, `ConversationTimeline.jsx`, `LabelsManager.tsx`, `BulkActionsBar.tsx`, an entire `AnalyticsPage.tsx`, four Supabase edge functions. This is backend infrastructure for managing contact-form leads. It has consumed most of the last month of work while the public story stayed static.
3. **A public `/admin` link sits in the main navbar** (`src/components/Navbar.jsx:53-59`), next to Skills/Projects/Philosophy/Contact, visible to every visitor. A hiring manager clicking around sees a login form for your CRM before they see your work.
4. **There is no About section.** The nav promises Skills → Projects → Philosophy → Contact. Nowhere on the page does it say who Karisa is, where he studied, or tell the ME→dev story in prose. `src/sections/AboutSection.jsx` is a 0-byte file — scaffolded, never built.
5. **Real assets are disconnected from the site**:
   - `profile-photo.png` has a LinkedIn badge baked into the bottom-right corner — needs a clean re-export or a crop, not usable as-is.
   - `RESUME.md` line 4 still has the literal placeholder `linkedin.com/in/yourprofile`, live.
   - CAD Web Viewer (a strong, differentiated project) isn't on the site.
   - No resume download link exists anywhere on the live site.
6. **Unverifiable "proof."** `Hero.jsx` claims "10+ Projects Completed"; the site shows 2. `RESUME.md` repeats "10+ Projects completed end-to-end." `Skills.jsx` assigns precise percentages (React 95%, Vite 85%, AWS 75%) with no methodology — this specific pattern reads as noise to senior engineers reviewing candidates. `Projects.jsx` claims "99.9% Uptime," "60% ↑ Performance," "1.2s Load Time" as static badges with no link to real data behind them.
7. **Visual identity is a template signature, not a brand.** Navy `#061220`/cyan `#61DAFB`/gold `#D4A017`, three animated blurred blobs behind the hero, glassmorphism cards with `backdrop-blur` — this exact combination is extremely common in 2025-2026 AI-scaffolded portfolios. It's competently executed and forgettable.
8. **Dead code and doc sprawl.** `src/sections/AboutSection.jsx`, `PhilosophySection.jsx`, `ProjectsSection.jsx`, `SkillsSection.jsx` are all 0-byte stubs. `docs/` has 49 files, many self-congratulatory phase-completion reports (`PHASE3_EXECUTIVE_SUMMARY.md`, `PHASE_5_6_7_COMPLETION_REPORT.md`, etc.) that contradict each other's stated "current rating." There's also a stray nested `karisa-portfolio/karisa-portfolio/docs/PHASE3_IMPLEMENTATION_REPORT.md` — an accidental duplicate path. Any technically literate reviewer who opens this repo (recruiters increasingly do) sees noise, not rigor.
9. **Identity fragmentation.** Site is `voyani.tech`; contact email in the resume is `karisa@thebikecollector.tech`; GitHub org is `voyyani`; LinkedIn is a placeholder. Four different identifiers for one person.
10. **`voyani.tech` (bare) 307-redirects, `www.voyani.tech` 200s.** Confirm this is an intentional 301 to the canonical `www` host, not an accident — check against `SEO.jsx`'s canonical tag, which should match exactly.

### 2.3 What's out of scope for this roadmap

The Supabase schema design, RBAC implementation, and general code quality of the inbound-email system are not audited here — see §7 for why it's being deprioritized rather than reviewed further.

---

## 3. Strategic Positioning

Answer from the brainstorming session: target audience is broad — both remote full-stack employer roles and freelance/agency (Voyani LLC) clients. The site needs to work for both without being wishy-washy about either.

**Positioning statement to build every section around:**

> Karisa builds production software the way he was trained to build physical systems: measured, load-tested, and shipped to hold up under real use. He ships full-stack platforms end-to-end — schema to deploy — for clients directly, and he's looking for a team that wants that same rigor as an employee.

**How this resolves the dual-audience problem:** don't fork the site into two paths. Lead with proof (real shipped work), let the CTA do the audience-splitting:
- Primary CTA: **"View my work"** (scrolls to Projects) — works for everyone.
- Secondary CTA pair, side by side, not a single ambiguous "Let's talk": **"Hire me"** (mailto / contact form, framed for employers) and **"Work with Voyani"** (framed for clients, links to a one-line description of engagement model). This costs one extra button and removes the ambiguity instead of forcing the copy to hedge.

**Retire:** the rotating "Mechanical Engineer / Full-Stack Developer / Problem Solver" badge cycling every 3.5s. It's a nice detail once; as the *entire* identity statement in the hero it under-delivers. Replace with one fixed, specific headline (see §5) and move the ME→dev *story* into the new About section where it can actually be told, not flashed.

---

## 4. New Information Architecture

Current: `Hero → Skills → Projects → Philosophy → Contact` (no About, no Blog, no Testimonials, public `/admin` link in nav).

**New structure:**

```
Hero
 ↓
About            [NEW] — the ME→dev story, education, photo, resume download
 ↓
Projects         [REBUILT] — screenshot-led, 3 projects (+ CAD Web Viewer), case-study depth on click
 ↓
Skills           [REBUILT] — grouped by how it's actually used, no fake percentages
 ↓
Writing          [NEW, Phase 4] — 2-3 real deep-dive posts, not a "blog" with a CMS
 ↓
Philosophy       [KEPT, trimmed] — the engineering-precision framing, shortened
 ↓
Testimonials     [NEW, Phase 4] — 2 short quotes from Raslipwani/Neema contacts
 ↓
Contact          [KEPT] — dual CTA per §3
 ↓
Footer           [KEPT] — remove public Admin link, keep resume download + social links (fixed, no placeholders)
```

Admin (`/admin`, `/admin/login`, `/admin/submissions`, `/admin/analytics`) stays live as unlinked routes for Karisa's own use — just not advertised in the public nav. See Phase 0 task 3.

---

## 5. Visual Design Direction

You chose "go bold" — a full departure from navy/cyan/gold + gradient blobs, not a refinement of it.

**Next concrete step (Phase 2, not done yet):** invoke the `design` skill to produce 2-3 real art-directed mockups as a canvas you can react to, rather than deciding blind from a text description. Rough candidate directions to prototype, for reference when that session starts:

1. **Technical-precision, executed literally.** Lean *harder* into the engineering angle than the current theme does, but with restraint: a light or off-white ground (not another dark-mode SaaS look), actual measurement/annotation marks used functionally (e.g., real dimension lines pointing at real metrics, not decorative), monospace used sparingly for data only. Feels like a spec sheet, not a sci-fi HUD.
2. **Editorial, quiet-confidence.** Light mode, strong single serif or slab display face for headings, generous whitespace, case studies read like a written piece with in-line screenshots — closer to how senior/staff engineers' personal sites read than to a "portfolio template." Minimal animation; motion reserved for content reveals only.
3. **Product-led / interactive.** Treats the portfolio itself as a shipped product: a real embedded live preview (iframe or looping screen-capture video) of Raslipwani/Neema right in the project card, not a modal you open to read about it. Motion is used to demonstrate interactivity (hover previews, live data), not decoration.

Retire regardless of which direction wins: the three animated blurred blobs, the percentage skill bars, the "Engineering × Development" pill badge, the rotating-role hero animation.

**Definition of Done for Phase 2:** Karisa has picked one direction from real mockups (not a text description), and it's documented with exact tokens (colors, type scale, spacing scale) before any component gets rebuilt.

---

## 6. The Roadmap

### Phase 0 — Foundation & Truth (1–2 days) — ✅ DONE 2026-08-29 (2 items partially blocked)

**Goal:** wire in what already exists. No new design, no new copy voice yet — just stop hiding real assets and stop the bleeding on scope.

> **Status:** executed 2026-08-29. See [`CHANGELOG.md`](./CHANGELOG.md) for the full record.
> 8 of 10 items complete; items 7 and 8 are blocked on assets that don't exist yet
> (marked below). Several problems not in the original list were found and fixed
> along the way — most seriously, **every email address the site published was
> undeliverable**, and the entire `Projects.test.jsx` suite (32 tests) had been failing
> silently. Test failures overall went 45 → 15.

1. ✅ **Freeze further inbound-email/CRM work.** No new commits to `src/admin/**`, `supabase/functions/**` until Phase 5 unless it's a security fix. (See §7 for the full scope-back decision.)
2. ✅ **Remove the public Admin link.** `src/components/Navbar.jsx` — delete the `Link to="/admin"` block (lines ~53-59) and the divider next to it from the desktop nav, and its mobile-menu equivalent. The `/admin/*` routes stay in `src/App.jsx`, just unlinked — reach them by typing the URL.
3. ✅ **Get the headshot usable.** `profile-photo.png` (repo root) has a LinkedIn watermark baked into the bottom-right corner. Re-crop/re-export without it (or re-export the original if you have it without the badge). Save as `karisa-portfolio/public/images/karisa-headshot.jpg` (WebP too, per `ImageWithFallback`'s existing infra in `src/components/ImageWithFallback.jsx`, which is built but has nothing real to serve yet).
4. ✅ **Wire up the resume.** Copy `resume.pdf` (repo root) into `karisa-portfolio/public/resume.pdf`. Add a visible "Download Resume" link/button in `Navbar.jsx` and `Footer.jsx`.
5. ✅ **Fix the placeholder.** `RESUME.md` line 4: replace `linkedin.com/in/yourprofile` with the real LinkedIn URL, or remove the LinkedIn link entirely if there isn't a maintained profile — a dead placeholder is worse than no link.
6. ✅ **Reconcile the "10+ projects" claim.** Either it becomes literally true (add smaller real projects to the count) or the copy changes to something true and still strong: e.g., *"3 production platforms shipped end-to-end"* is a better sentence than an inflated round number once you also have real screenshots backing it — proof beats scale.
7. ⚠️ **PARTIAL — Capture real screenshots of the two live projects.** `raslipwani.co.ke` and `neemafoundationkilifi.org` — full-page hero screenshot + 2-3 key-screen screenshots each (dashboard, a key list/detail view). Raslipwani was rate-limiting automated requests (HTTP 429 via Cloudflare) when this was attempted headlessly; do this manually from a normal browser, or re-run a Playwright capture from a machine with full browser system deps (`libatk-1.0` etc. — this sandbox didn't have root to install them). Save to `karisa-portfolio/public/images/projects/raslipwani/` and `.../neema/`.
   **Done for Neema** (5 pages captured live at 1440x900 @2x, served as jpg/webp/avif).
   **Blocked for Raslipwani:** as of 2026-08-29 every route on that site serves the
   client's scheduled-maintenance page (countdown to ~5 Sept 2026), so there is no
   product UI to photograph. The card shows an explicit "capture pending" state and the
   modal discloses the maintenance window. **Re-run the capture after 5 Sept 2026**, or
   capture the admin dashboard yourself while logged in.
8. ⚠️ **PARTIAL — Add the missing third project.** Pull the "CAD Web Viewer" project (Three.js/WebGL model viewer, 65% review-cycle reduction) from `RESUME.md` lines 88-93 into `src/components/Projects.jsx`'s `projects` array. It needs at least one real screenshot or a short screen-capture GIF of the viewer in action — this is the project that most directly proves the ME→dev hybrid claim, don't let it stay text-only.
   **Project added** with full challenge/solution/features detail. **Still needs a visual:**
   it's commissioned client work with a private deployment, so nothing could be captured
   remotely. **Action for Karisa:** record a 5-10s screen capture of the viewer rotating a
   model and drop it in as `public/images/projects/cad-viewer/`. Until then the card shows
   an honest "capture pending — private client deployment" panel rather than a stock image.
9. ✅ **Delete dead code.** Remove the four 0-byte stub files: `src/sections/AboutSection.jsx`, `src/sections/PhilosophySection.jsx`, `src/sections/ProjectsSection.jsx`, `src/sections/SkillsSection.jsx`. (`ContactSection.jsx` stays — it's real and used.)
10. ✅ **Delete the stray duplicate path.** `karisa-portfolio/karisa-portfolio/` (nested folder containing one stray doc file) — confirm it's not referenced anywhere, then remove it.

**Definition of Done:** the live site has a real photo, a downloadable resume, no dead links, no public admin exposure, and 3 real projects each with at least one real image. Nothing about *design* has changed yet — this phase is entirely about truth and hygiene.

### Phase 0.5 — Documentation Consolidation — ✅ DONE 2026-08-29

1. ✅ Created [`docs/CHANGELOG.md`](./CHANGELOG.md) — Keep a Changelog format, newest first, grounded in git history rather than the old docs' self-assessments.
2. ✅ Moved all `PHASE*.md`, `WEEK*.md`, `EMAIL_SYSTEM_*.md`, `INBOUND_EMAIL*.md`, `PORTFOLIO_EMAIL_SYSTEM_SPEC.md` and `SYSTEM_OVERVIEW.md` into `docs/archive/`.
3. ✅ Archived `AUDIT.md`, `ROADMAP.md`, `PROJECT_ROADMAP_UPDATED.md`, `plan.md`, `README.md`, plus the point-in-time `voyani.tech-Coverage-2026-01-25/` GSC export. Nothing was deleted — 42 entries are preserved under `archive/`.
4. ✅ **49 files → 6.** `docs/` now holds: `roadmapupdated.md`, `CHANGELOG.md`, `ANALYTICS_SETUP_GUIDE.md`, `COMPONENT_ARCHITECTURE.md`, `GOOGLE_SEARCH_CONSOLE_SETUP.md`, `GSC_QUICKSTART.md`, `IMAGE_OPTIMIZATION.md`, `PRODUCTION_DEPLOYMENT_CHECKLIST.md`, and `archive/`.

**Definition of Done:** ✅ anyone opening `docs/` sees a small, current, non-contradictory set of files. `CHANGELOG.md` states explicitly that where an archived doc disagrees with the code, the code wins.

> **Note on the remaining four guides:** `COMPONENT_ARCHITECTURE.md`, `IMAGE_OPTIMIZATION.md`, `PRODUCTION_DEPLOYMENT_CHECKLIST.md` and `ANALYTICS_SETUP_GUIDE.md` were kept because their subject matter is still live, but they have **not** been re-verified against current code. `PRODUCTION_DEPLOYMENT_CHECKLIST.md` in particular is subtitled "Phase 3" and is email-system-centric. Audit them during Phase 5 and archive whatever no longer holds.

### Phase 1 — Narrative & Copy (2–3 days)

**Goal:** every sentence on the site should be something only Karisa could say, backed by something provable.

1. **Hero rewrite** (`src/components/Hero.jsx`):
   - Replace the rotating-role component with one fixed, specific headline built from §3's positioning statement. Keep it short — the current three-role rotation is doing narrative work that belongs in About instead.
   - Replace the `stats` array's round, unverifiable numbers ("10+ Projects", "15+ Technologies") with one or two specific, checkable facts (e.g. link straight to a live project, or a real GitHub stat pulled in Phase 3).
   - Two CTAs per §3, not one ambiguous one.
2. **Build the About section** (new `src/components/About.jsx`, replacing the deleted empty stub): headshot, the ME→dev story in 2-3 short paragraphs (education, the "why" behind the transition, what carries over — precision, tolerances, systems thinking), resume download repeated here.
3. **Rewrite Projects copy** (`src/components/Projects.jsx`): cut the wall-of-text pattern. Each project card leads with a screenshot; the always-visible summary is 1-2 sentences, not a paragraph. Move the deep technical detail (architecture, database schema, admin features) behind the existing modal, but rewrite it to read like an engineer describing a real decision, not a marketing feature list — cut `keyAchievements` items that restate the same "90% test coverage" style claim more than once across sections.
4. **Kill vanity metrics site-wide**: "99.9% Uptime," "10,000+ lines of production code" (footer stat row in `Projects.jsx` lines ~828-845), and the precise skill percentages in `Skills.jsx` all get replaced or removed per Phase 3's proof-system alternative.
5. **Trim Philosophy** (`src/components/Philosophy.jsx`) to complement the new About section instead of overlapping it — read both back to back and cut whichever repeats the other.

**Definition of Done:** read the whole site top to bottom out loud. Every claim should be either obviously true from something visible on the page (a screenshot, a link) or removed.

### Phase 2 — Visual Identity Overhaul (3–5 days)

**Goal:** replace the generic dark-navy/cyan/gold/gradient-blob identity with one of the three directions from §5, chosen from real mockups.

1. **Invoke the `design` skill** to produce the 2-3 candidate directions as an actual visual canvas (not more text description) — this is the concrete next step once Phase 0/1 content exists to design around.
2. Once a direction is picked, extract a real design system: color tokens, type scale, spacing scale, motion rules — into `tailwind.config.js` (currently 4482 bytes of largely default/unused custom config — audit what's actually used vs. cruft while touching this file).
3. Rebuild `Hero.jsx`, `Navbar.jsx`, `Footer.jsx`, `ParticleBackground.jsx` (or retire it — a canvas particle field may not fit the new direction; if it goes, delete the component and its device-detection logic rather than leaving it dark-mode-only and unused) against the new system.
4. Rebuild `Projects.jsx` and `Skills.jsx` visually once the new tokens exist (content from Phase 1/3 already correct, just re-skinned).

**Definition of Done:** a first-time visitor cannot mistake three screenshots of this site for a generic template — Lighthouse and test suite still green (`npm run test`, `npm run build`).

### Phase 3 — Proof Systems (3–5 days, uses the `dataviz` skill)

**Goal:** replace every self-reported number with something a visitor can verify themselves.

1. **Live GitHub activity**: pull real contribution/commit data via the GitHub API (public, no auth needed for public stats) and render it as an actual chart, not a static badge — invoke the `dataviz` skill for the chart treatment (color, form, accessibility) before writing it.
2. **Replace `Skills.jsx`'s percentage bars.** Options, pick one: (a) group tools by *which real project used them* (grounded, checkable against the project cards), or (b) drop numeric scoring entirely in favor of a clean grouped-tag layout. Either beats an unfalsifiable "React: 95%."
3. **Architecture diagrams for case studies.** `Projects.jsx`'s current "System Architecture" and "Database Schema" sections are monospace text lists (lines ~443-481) — replace with a real diagram per project (invoke `artifact-diagramming` guidance for how to draw one that shows the actual mechanism, not decoration) embedded as inline SVG.
4. **Screenshots/GIFs over text** for the "Admin Panel" and "Technical Highlights" subsections — a 5-second looped screen capture of the actual booking drag-and-drop or the RBAC permission matrix says more than the current bullet list.

**Definition of Done:** every quantitative claim on the site links to or is adjacent to the evidence for it.

### Phase 4 — Content & Trust (1–2 weeks, can run partly in parallel with Phase 3)

**Goal:** third-party proof and a small amount of real writing — quality over the "5 blog posts" quota the old `AUDIT.md` chased.

1. **Two testimonials**, not zero. Reach out to a real contact at Raslipwani and Neema Foundation for 2-3 sentences each on what shipping the platform changed for them. Build a small `Testimonials.jsx` — plain, no fabricated names/quotes.
2. **Two real deep-dive write-ups**, not five generic ones:
   - *"Raslipwani: cutting load time from 3s to 1.2s"* — an honest before/after with real numbers and the actual three techniques used (React Query caching, server-side pagination, debounced search), pulled from the existing `technicalHighlights` data and expanded with real screenshots/flamegraphs if available.
   - *"Building a 5-tier RBAC system for a non-profit CMS"* — the Neema Foundation permissions system, written as a real technical decision log (what you tried, what you cut, why).
   Both live as static pages/MDX under a new `Writing` nav item — no CMS needed for two posts.
3. **CAD Web Viewer gets its own short case study** given how differentiated it is — even 3-4 paragraphs plus a screen-capture GIF outperforms its current single-line resume mention.

**Definition of Done:** 2 testimonials live, 2 real write-ups live, CAD Web Viewer has a proper case study.

### Phase 5 — Technical Polish & Ship (3–5 days)

**Goal:** verify claims about performance/accessibility for real, rather than carrying forward the old audit's "predicted" Lighthouse scores.

1. Run an actual Lighthouse audit (not a prediction) against the deployed site post-redesign; fix what it flags.
2. Accessibility pass: keyboard nav through the whole page, skip-to-content link, contrast check on the new palette from Phase 2, focus states on the redesigned Projects modal/cards.
3. Confirm `voyani.tech` → `www.voyani.tech` is a real 301 (not a 307) if that's the intended canonical, and that `src/components/SEO.jsx`'s canonical tag and `public/sitemap.xml` agree with it.
4. Reconcile identity: pick one contact email (currently `karisa@thebikecollector.tech` in `RESUME.md` vs. whatever the live `ContactForm.jsx`/`SEO.jsx` use) and use it everywhere — site, resume, GitHub profile, LinkedIn.
5. Re-run the existing test suite (`npm run test:coverage`) and keep it green through the redesign — this project's testing discipline is a real strength, don't regress it chasing the visual work.
6. Before touching `supabase/functions/**` again for anything (even the Phase 0 freeze), run the `security-review` skill against any changes — these functions handle inbound webhook payloads and service-role keys.

**Definition of Done:** real (not predicted) Lighthouse scores recorded in this doc's changelog, accessibility issues from a manual pass fixed, one consistent identity across every channel.

### Phase 6 — Distribution (ongoing after ship)

1. Submit the updated sitemap via Google Search Console (setup guide already exists: `docs/GOOGLE_SEARCH_CONSOLE_SETUP.md` / `GSC_QUICKSTART.md` — verify still accurate post-redesign).
2. Update LinkedIn and GitHub profile bios/pinned repos to match the new positioning statement from §3.
3. Share the two Phase 4 write-ups where relevant technical communities would actually read them (not a blanket blast) — the Raslipwani performance post fits places where real numbers-backed engineering writing gets read.

---

## 7. Explicitly Deprioritized: the Inbound Email / CRM System

Per your decision: **scale it back, redirect the effort to content & design.** Concretely:

- No new features on `src/admin/**` or `supabase/functions/**` until Phase 5's security check, and even then only bug fixes — no new phases of the email/CRM system.
- It stays live and usable for Karisa's own lead management (it works, it's tested, no reason to rip it out) — it's just not part of the pitch to hiring managers, and it's no longer linked from the public nav (Phase 0 task 2).
- If in six months there's real product-market signal that this CRM subsystem itself is impressive enough to be a fourth case study (it is architecturally substantial — 5-tier RBAC, spam detection, webhook handling), that's a legitimate future call — but it needs the same treatment every other project gets first: real screenshots, a real narrative, not a docs folder of phase-completion reports.

---

## 8. Content Plan Reference

| Asset | Status | Action | Phase |
|---|---|---|---|
| Headshot | Exists, watermarked | Clean export → `public/images/` | 0 |
| Resume (PDF/HTML/MD) | Exists, unlinked, 1 placeholder URL | Wire in + fix placeholder | 0 |
| Raslipwani screenshots | Don't exist | Capture manually or via Playwright | 0 |
| Neema screenshots | Don't exist | Capture manually or via Playwright | 0 |
| CAD Web Viewer case study | Exists only as 1 resume line | Write short case study + capture GIF | 0 (add project), 4 (case study) |
| About section | Never built (0-byte stub) | Write and build | 1 |
| Testimonials (2) | Don't exist | Request from real clients | 4 |
| Deep-dive write-ups (2) | Don't exist | Write, grounded in real project data already in `Projects.jsx` | 4 |
| Live GitHub stats | Don't exist | Pull via GitHub API, chart via `dataviz` skill | 3 |

---

## 9. Technical Checklist (carry through, don't defer to the end)

- [ ] `npm run test` and `npm run lint` stay green after every phase
- [ ] `npm run build` bundle size doesn't regress past current baseline without a specific reason (check with `rollup-plugin-visualizer`, already configured)
- [ ] Every new image ships through `ImageWithFallback.jsx`'s existing WebP/AVIF path, not a raw `<img>`
- [ ] No secrets committed (repeat the grep from this audit before each merge: live API key patterns, `SUPABASE_SERVICE_ROLE_KEY` values, etc.)
- [ ] Accessibility: keyboard-only pass on every new/changed component
- [ ] Real Lighthouse run (not a predicted number) recorded after Phase 5

---

## 10. Success Metrics

Not "9.5/10 self-rating." Concrete and checkable:

- [ ] Every project on the site has ≥1 real screenshot/GIF — **1 of 3** (Neema has 5; Raslipwani blocked by client maintenance, CAD Viewer needs a screen capture from Karisa)
- [x] Resume is downloadable from the live site — navbar + footer, `public/Karisa-Voyani-Resume.pdf`
- [x] Zero placeholder URLs anywhere in shipped content — fixed the LinkedIn placeholder, the wrong LinkedIn in `SEO.jsx`, and the `@karisavoyani` Twitter handle
- [x] No public link to `/admin` from the marketing site — removed from desktop and mobile nav
- [ ] An About section exists on the live site — **Phase 1**; the 0-byte stub was deleted, the section itself is still to be written
- [ ] 2 testimonials live (currently 0) — **Phase 4**
- [ ] 2 real deep-dive write-ups live (currently 0) — **Phase 4**
- [ ] Visual design is distinguishable from the prior template look in a side-by-side screenshot (subjective but checkable by asking 3 people "does this look like a template?") — **Phase 2**
- [ ] Real (not predicted) Lighthouse Performance/Accessibility/SEO scores recorded in `docs/CHANGELOG.md` — **Phase 5**
- [x] *(added)* Every published contact address actually receives mail — all three were dead domains; now routed through `src/config/site.js`
- [x] *(added)* No fabricated UI — removed the newsletter form that only called `console.log` while telling users they'd subscribed

---

## 11. Immediate Next Actions

Phase 0 and 0.5 are done (2026-08-29). What's left needs Karisa specifically — these
are the only blockers no one else can clear:

1. **Confirm the contact email.** `src/config/site.js` now publishes
   `voyanitech@gmail.com`, chosen because it's the address the deployed notification
   function forwards to and it matches `resume.html`/`resume.pdf`. If that's wrong,
   change it in that one file. Better still: add an MX record to `voyani.tech` and
   switch to `karisa@voyani.tech` — a custom domain reads better than a gmail, and
   right now the domain has A records but cannot receive mail at all.
2. **Record a screen capture of the CAD Web Viewer** (5–10s of the viewer rotating a
   model is enough). It's the single strongest piece of evidence for the ME→dev story
   and it's the only project with no visual at all. Drop it in
   `public/images/projects/cad-viewer/`.
3. **Re-capture Raslipwani after ~5 Sept 2026**, when the client's maintenance window
   closes — or capture the admin dashboard now while logged in, which is the more
   impressive view anyway. Then clear `liveStatus` on that project in `Projects.jsx`.
4. **Verify two claims flagged during Phase 0** that could not be checked from outside:
   the Neema RBAC tier count (the data said 5 in two places and 6 in another — it's now
   5 everywhere), and Raslipwani's "100+ active users".
5. **Then start Phase 1** (About section + copy rewrite), and only after that Phase 2's
   `design` skill session — design against the rewritten copy, not the current copy.

---

## 12. Appendix: Verified Asset Inventory (as of 2026-08-28)

- `profile-photo.png` — repo root, 2,054,351 bytes, professional headshot, LinkedIn watermark bottom-right, portrait orientation. **Not in `karisa-portfolio/`.**
- `resume.pdf` — repo root, 3,116,347 bytes. **Not in `karisa-portfolio/public/`.**
- `resume.html` — repo root, 20,122 bytes.
- `RESUME.md` — repo root, 7,084 bytes, source of truth content for the resume; contains the CAD Web Viewer project and the placeholder LinkedIn URL.
- Live projects confirmed reachable on 2026-08-28: `www.voyani.tech` (200), `neemafoundationkilifi.org` (307, redirect — verify target), `raslipwani.co.ke` (429 to automated requests — Cloudflare; confirm manually in a real browser).
- `docs/` currently holds 49 files; see Phase 0.5 for consolidation.
