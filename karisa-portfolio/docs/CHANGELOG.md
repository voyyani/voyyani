# Changelog

**Status:** Live
**Last updated:** 2026-08-29

All notable changes to the Ngowa Karisa portfolio (voyani.tech), newest first.
Format follows [Keep a Changelog](https://keepachangelog.com); dates come from git history.

This file replaces the ~40 phase- and week-completion reports that used to live in
`docs/`. Those are preserved in [`archive/`](./archive/) but are no longer maintained,
and several of them contradict each other — where an archived doc disagrees with this
file or with the code, the code wins.

---

## [Unreleased] — 2026-08-29 — Phase 0: Foundation & Truth

Executes Phase 0 and Phase 0.5 of [`roadmapupdated.md`](./roadmapupdated.md). The theme
is removing claims the site could not support and connecting real assets that already
existed but were never wired in. No visual redesign — that is Phase 2.

### Added
- Real product screenshots for Neema Foundation, captured from the live site at
  1440×900 @2x on 2026-08-29 and served as `.jpg`/`.webp`/`.avif`
  (`public/images/projects/neema/`). Project cards now lead with a screenshot
  instead of a wall of text.
- `src/config/site.js` — single source of truth for name, role, email, social links,
  résumé path and headshot paths. Added because the same facts were stated differently
  in five files and three of them were wrong.
- Downloadable résumé at `public/Karisa-Voyani-Resume.pdf`, linked from the navbar
  (desktop + mobile) and the footer. The PDF existed at the repo root but the live
  site never offered it.
- Professional headshot at `public/images/karisa-headshot.{jpg,webp,avif}` (4:5) plus a
  square variant, cropped from `profile-photo.png` to remove the LinkedIn watermark
  that was baked into the bottom-right corner.
- `public/og-image.jpg` (1200×630). `SEO.jsx` had pointed at this URL since January;
  the file had never existed, so every social share rendered a broken image.
- `public/icon-192.png` and `public/icon-512.png`. `manifest.json` had referenced both
  since the Week 4 PWA work; neither existed, so the PWA could not install correctly.
- Local `favicon-32.png` and `apple-touch-icon.png`, replacing a third-party Cloudinary
  request for a 1024×1024 PNG on every page load.
- Third project: **CAD Web Viewer** (Three.js/WebGL, commissioned). It was in
  `RESUME.md` but absent from the site, despite being the work that most directly
  evidences the mechanical-engineering → developer claim.
- `liveStatus` on each project, so the UI can disclose when a client site is in
  maintenance or is private rather than presenting a dead link as a live demo.
- LinkedIn added to the footer's social links.

### Changed
- Corrected Neema Foundation's metrics against its own live site: "Programs 15+" → 
  "Active Programs 4", and "RBAC Roles 6" → "RBAC Tiers 5" (the same object already
  described a *5*-tier system twice, so it contradicted itself).
- Hero stats now state what the page can back up: "10+ Projects Completed" → 
  "3 Platforms Shipped End-to-End" (the site shows 3), and "15+ Technologies" → 
  "B.Eng Engineering Degree".
- Raslipwani's "View Live Platform" button becomes "Visit Site Anyway" alongside a
  maintenance notice, because every route on that client site currently serves a
  scheduled-maintenance page (checked 2026-08-29).
- `RESUME.md`: replaced the dead `karisa@thebikecollector.tech` address and the literal
  `linkedin.com/in/yourprofile` placeholder; aligned the metrics table with the site.
- Project grid is now 3-up on large screens to fit the third project.
- `SEO.jsx` structured data reads identity from `site.js` instead of hardcoding it.
- `docs/`: reduced from 49 files to 6, with the rest moved to `archive/`.

### Fixed
- **Every published email address on the site was undeliverable.** Verified with
  `dig MX`: `thebikecollector.tech` and `thebikecollector.info` do not resolve at all
  (no A record, no MX), and `voyani.tech` has A records but no MX. The footer showed
  two different dead addresses and the privacy policy a third. All now resolve through
  `site.js` to the inbox the deployed notification function actually forwards to
  (`supabase/functions/send-notification/index.ts:18`).
- Wrong LinkedIn URL in `SEO.jsx`'s `sameAs` structured data
  (`linkedin.com/in/karisa-voyani`); the real profile is `karisa-ngowa-b7630111b`,
  per `resume.html` and the links embedded in `resume.pdf`.
- Duplicate `id="contact"` on both `ContactSection` and `Footer` — invalid HTML that
  made the `#contact` anchor ambiguous. Removed from the footer.
- Removed the newsletter signup form, which told every subscriber "Thank you for
  subscribing!" while only calling `console.log`. Nothing was ever stored or sent.
- Removed the unverifiable "99.9% Uptime" badge, directly contradicted by the client
  site being in maintenance.
- Removed the `@karisavoyani` Twitter handle from meta tags — an unverified
  placeholder that shipped with a `{/* Update with actual handle */}` note.
- Removed the invalid `style={{ focusRingColor }}` prop (not a CSS property).
- Guarded the project modal against projects that don't define `architecture`,
  `databaseSchema`, `performanceMetrics` or `adminFeatures` — previously it called
  `.map()` on them unconditionally and would crash on any project lacking one.
- **Test suite: 45 failures → 15** (158 → 188 passing, of 206). The whole
  `Projects.test.jsx` file (32 tests) had been failing because its `framer-motion`
  mock never exported `useReducedMotion`, which `Projects.jsx` imports; the file threw
  on import before rendering anything. Also fixed selectors that assumed a `div`
  wrapper the component doesn't render, and assertions carrying stale copy.

### Removed
- Public `/admin` link from the navbar (desktop and mobile). The routes still work by
  URL; they are simply no longer advertised to visitors, including hiring managers.
- Four 0-byte stub files: `src/sections/{AboutSection,PhilosophySection,ProjectsSection,SkillsSection}.jsx`.
- Stray nested `karisa-portfolio/karisa-portfolio/` path. Its one file was a distinct,
  longer Phase 3 security report and was preserved as
  `docs/archive/PHASE3_SECURITY_IMPLEMENTATION_REPORT.md`.

### Known issues
- No screenshots exist for Raslipwani (client site in maintenance until ~5 Sept 2026)
  or CAD Web Viewer (private client deployment). Both cards show an explicit
  "capture pending" state rather than a fake or borrowed image.
- 15 tests still fail, all pre-existing and unrelated to the public site: 7 in
  `ContactForm.test.jsx`, 3 in `Hero.test.jsx` (scroll indicator), 3 in email utils,
  2 in `Projects.test.jsx`.
- `eslint` reports 89 problems, all pre-existing. Most are a misconfiguration: the
  `react/jsx-uses-vars` rule is not enabled, so every component using `motion` in JSX
  is falsely reported as having an unused import.
- The résumé's "65% client review cycle reduction" and Raslipwani's performance figures
  remain self-reported. Phase 3 of the roadmap replaces these with verifiable proof.

---

## 2026-03-26 → 2026-03-27 — Inbound email & admin CRM

Large expansion of a contact-form back office: admin dashboard, submissions list with
bulk actions and labels, conversation timeline, reply modal with templates, spam
quarantine, analytics page, and four Supabase Edge Functions (`send-notification`,
`send-reply`, `handle-inbound-email`, `handle-resend-webhook`). Includes CSRF tokens,
persistent rate limiting, and email sanitisation.

Also added the public `/admin` navbar link that Phase 0 has now removed.

Roadmap §7 deprioritises further work here: it is infrastructure only Karisa sees, and
it absorbed most of the project's recent effort while the public-facing site stood still.
It remains live and functional. Archived detail:
[`archive/`](./archive/) (`EMAIL_SYSTEM_*`, `INBOUND_EMAIL*`, `PHASE*`).

## 2026-02-04 → 2026-02-13 — Content updates

Projects component rewritten with deeper per-project detail; TypeScript syntax removed
from the `.jsx` file. Hero iterations.

## 2026-01-20 — Week 4: monitoring, analytics, PWA

Google Analytics 4, Sentry, Web Vitals, cookie consent gating, `vite-plugin-pwa` with a
service worker and `manifest.json` (whose icons were missing until Phase 0). SEO work
and the Google Search Console setup guide.

## 2026-01-19 — Week 2: SEO & error handling

`react-helmet-async` SEO component with Open Graph, Twitter cards and Schema.org
structured data; error boundaries; `.npmrc` for React 19 on Vercel.

## 2026-01 — Week 1: performance & testing foundation

Removed unused Three.js (~59 packages), added Vitest + Testing Library, code-split five
sections with `React.lazy()`, Terser minification, manual vendor chunking, bundle
visualiser, and optimised `ParticleBackground` (IntersectionObserver pause, device-aware
particle counts, FPS throttling).

## 2025-06-21 → 2025-06-30 — Initial build

First release: React + Vite + Tailwind + Framer Motion portfolio with hero, skills,
projects, philosophy and contact sections; mobile-first responsive pass; Supabase and
EmailJS wiring.
