# Changelog

**Status:** Live
**Last updated:** 2026-09-18

All notable changes to the Ngowa Karisa portfolio (voyani.tech), newest first.
Format follows [Keep a Changelog](https://keepachangelog.com); dates come from git history.

This file replaces the ~40 phase- and week-completion reports that used to live in
`docs/`. Those are preserved in [`archive/`](./archive/) but are no longer maintained,
and several of them contradict each other — where an archived doc disagrees with this
file or with the code, the code wins.

---

## [Unreleased] — 2026-09-18 — The admin sheet: `/admin` on the Kanga system, one thread per submission, Gmail replies in the loop

Plan and audit: [`adminplan.md`](./adminplan.md) (§0 findings F1–F15, A1–A8; §1 design contract).
Deploy steps: [`admin/DEPLOY.md`](./admin/DEPLOY.md). Branch `worktree-admin-revamp-plan`,
commits `d1de312..e9f1bdc`.

### Added
- `/admin/submissions/:id` — one chronological thread per submission (original message,
  every reply Karisa sent from the dashboard or from Gmail, every visitor reply), each
  outbound message carrying its Resend delivery state (queued / sent / delivered / opened /
  bounced / failed) as a printed `StateMark`. Held (quarantined) inbound mail is shown as
  held, not as a legitimate reply. Opening the thread marks its unread inbound as read.
  An inline `ReplyComposer` replaces the modal; it still calls `send-reply` and no longer
  logs the session token (F11).
- `/admin/settings` — notification preferences, labels (the old `LabelsManager`, inline),
  and account. The sidebar's dead link now lands (F13).
- `AdminLayout` is a layout route with an `<Outlet>` and mounts sonner's `<Toaster>`, so
  admin toasts render for the first time (F1).
- Gmail reply relay: `send-notification` deep-links each alert to
  `/admin/submissions/<id>` and sets `reply_to`; `handle-inbound-email` recognises a reply
  *from the admin* to that address, relays it to the visitor from `karisa@voyani.tech`, and
  records it in `submission_replies` with `email_metadata.source = 'email_relay'` (F2, F3).
- Analytics with real numbers: previous-period deltas from a second query, a zero-filled
  daily bucket chart as inline SVG (`DailyChart`), median response time in humane units,
  inbound replies counted, a delivery funnel, and an RFC-4180 CSV export that no longer
  dumps `notes` (A1–A7). All maths is in `src/utils/analyticsMath.ts`, unit-tested.
- Overview answers "what needs me": unread inbound, awaiting-you, and a real activity
  feed linking to threads, built by `src/admin/data/overview.ts`.
- Realtime: `supabase/migrations/20260917000000_admin_realtime.sql` puts `submissions`,
  `submission_replies` and `inbound_replies` on the `supabase_realtime` publication with
  `REPLICA IDENTITY FULL`; the list and the thread subscribe instead of polling (F8).
- Every email template on the brand via `_shared/emailTemplate.ts` (`renderEmail`), used by
  `send-notification`, `handle-inbound-email` and `send-reply`.
- A quiet "Admin" link in the footer's legal line.
- Pure, client-free data modules with tests: `src/admin/data/{format,submissionsQuery,
  thread,overview}.ts`; a chainable Supabase mock (`src/test/mockSupabase.js`) for page tests.

### Changed
- The admin wears the site's design system ("Operate mode", `DESIGN.md` → *The admin sheet*):
  `cloth`/`mark`/`pindo` tokens, square corners, no shadows, no gradients, no blur, no
  `dark:` variants, no Tailwind default palette, no emoji icons (inline SVG `Icon`), no
  framer-motion, skeleton loading. One 2px indigo rule (the top bar); page heads are a 1px
  ink rule. New primitives in `src/index.css`: `.adm-topbar .adm-nav-link .adm-head
  .adm-title .adm-figure .adm-table .adm-chip .adm-skel .adm-card .field-sm .btn-alarm`
  and `.mark-state[data-state]` for the admin state vocabulary.
- Submissions list: filters live in the URL, "Unanswered" is a filter rather than a sort
  that secretly filtered (F9, F10), rows stack below `md` instead of scrolling sideways,
  bulk delete asks first (F15), and the state array is no longer sorted in place.
- Login: inline errors, no motion, no empty "Demo Info" divider (F14).
- `tailwind.config.js`: the legacy `ink`/`signal` dark ramp is deleted; the config is now an
  ES module (`export default`), matching `"type": "module"`.
- `vitest.config.js`: `testTimeout` 15 s — the suite grew from 12 to 28 files and a cold
  first run on a 4-core box pushed one `userEvent` test past the 5 s default.

### Removed
- Twelve admin components with no future or no importers: `AdminSidebar`, `AdminNavbar`,
  `MobileDrawer`, `ResponsiveTable`, `ResponsiveFilters`, `ResponsiveModal`,
  `SpamQuarantineView`, `InboundRepliesFilter`, `ConversationTimeline`, `InboundEmailCard`,
  `ReplyModal`, `SubmissionDetailPanel` (F5, F7, F12). `useInboundEmails` keeps its helpers
  and drops the hook.
- `DESIGN.md` → *The Legacy Boundary Rule* (the ramp it guarded no longer exists).

### Verification (2026-09-18, this machine)
- Tests: `npx vitest run` — **28 files, 279 passed, 3 skipped** (baseline 12 files, 220
  passed, 3 skipped). One test in this pass was wrong and was fixed rather than skipped:
  `AdminLayout.test.jsx` queried `[data-sonner-toaster]` on an idle layout, but sonner
  renders nothing until a toast exists; it now fires a toast and finds it.
- Lint: `src/admin`, `tailwind.config.js` and `vitest.config.js` are clean (59 → 51
  problems; the 8 this branch owned are fixed). `npm run lint` overall still reports
  **51 errors, 0 warnings**, all pre-existing and all in files this branch did not touch
  (`src/components/*` test mocks with `require`, unused `motion` imports,
  `src/test/setup.js` globals, `vite.config.js` `__dirname`, `setup-database.js`,
  `src/utils/sentry.js`). Recorded, not fixed — out of scope for the admin.
- Build: `npm run build` succeeds in 1m 9s; CSS 45.8 kB; admin chunks
  `SubmissionDetailPage` 20.8 kB, `AnalyticsPage` 11.4 kB, `SubmissionsPage` 10.3 kB,
  `SettingsPage` 6.7 kB, `AdminDashboard` 4.9 kB (all before gzip); PWA precache 74 entries.
- Design detector (`impeccable detect`, 4.1.2) over `src/admin`, `src/index.css`,
  `tailwind.config.js`: **0 findings**, with and without project config. Ban greps
  (framer-motion, `dark:`, `bg-white/`, default palette, `rounded-*`, `shadow-*`,
  `backdrop-blur`, `gradient`, the four legacy hexes, `console.log`) over `src/admin`:
  **0 matches**.
- `deno check`: not run — Deno is not installed here. Run it before deploying.
- Visual: `/admin/login` captured at 390×844 and 1440×900 from `vite preview` — no
  horizontal overflow, no console errors. The signed-in pages were not captured: the
  worktree has no `.env.local`, so there is no Supabase client to sign in with.

### Open
- A8 — `analytics_events` RLS is `USING (true) WITH CHECK (true)`; see `AUDIT.md` §8.

---

## [Unreleased] — 2026-09-17 — Neema recaptured; GitHub activity refreshes itself

### Added
- `scripts/capture-screenshots.mjs` — one capture recipe for every project card
  (1440×900 @2x, fonts and lazy images settled, cache warmed, smooth-scroll disabled).
  Pages per project are listed in the script; `convert-screenshots.mjs` still does the
  jpg/webp/avif step.
- `.github/workflows/sync-github-activity.yml` — runs `sync:github` every Monday and
  commits `src/data/github-activity.json` to `main` when the numbers move, so the
  activity section no longer depends on someone remembering to re-sync.

### Changed
- Neema Foundation screenshots recaptured 2026-09-17 after the client's editorial
  redesign (ruled layout, impact counters, "Give to the foundation" / "Photographs" /
  "Give your time in Ganze" pages). Alt text in `projects.js` and the Hero figure
  rewritten to describe the new frames; `checkedOn` → 17 Sep 2026.
- Neema metrics follow the redesign: "Active Programs 4" → "Active Programmes 3" and
  "Lives Touched 10K+" → "People Reached 2,950+", which is what the client's home and
  programmes pages publish today (the old donate-page figures are gone). Smaller
  numbers, but the card would otherwise contradict its own screenshot.
- GitHub activity snapshot re-synced: 251 → 444 commits across the same 4 repos,
  last commit 2026-09-16 (was 2026-08-17); September 2026 is now the peak month.
  `fetch-github-activity.mjs` sends `GITHUB_TOKEN` when set, purely for the rate limit.

---

## [Unreleased] — 2026-09-16 — Raslipwani: live, captured, and re-sourced

Executes §6 of [`RASLIPWANI_GO_LIVE.md`](./RASLIPWANI_GO_LIVE.md). The client's
maintenance window is over: on 2026-09-16 every public route (`/`, `/properties`,
`/services`, `/services/viewing`, `/about`, `/contact`, `/admin/login`) returned 200 and
rendered the product in headless Chromium. `curl` still gets a 429 "Vercel Security
Checkpoint" — that is bot protection, not the app, and a real browser passes it.

### Added
- Five screenshots of the live site, captured 2026-09-16 at 1440×900 @2x and served as
  jpg + webp + avif from `public/images/projects/raslipwani/` (home, listings, property
  modal, viewing booking, services). The admin dashboard needs Karisa's login and is not
  captured.
- `scripts/convert-screenshots.mjs` — the Sharp conversion step from
  `IMAGE_OPTIMIZATION.md`, as a runnable script (needs `npm i --no-save sharp`).
- Three schema rows the card had never listed: `booking_notes`, `email_templates`,
  `admin_users`.

### Changed
- `liveStatus` → `{ state: "live", checkedOn: "16 Sep 2026" }`; the modal now says
  "View Live Platform" with no maintenance notice, and the test asserts that.
- Every Raslipwani figure re-checked against the repo at `d3e978b` (2026-09-14, §7 of
  the go-live doc). The card's sourced metrics are now the first-load bundle
  (−49 %: 220.7 → 112.8 kB gzip, `bundle-budget.json`), line coverage (58 %, committed report;
  CI floor 57 %) and the Lighthouse CI accessibility gate (≥ 0.95, `lighthouserc.json`).
- Hero proof point: "3s → 1.2s page load" → "−49 % first-load JS (221 → 113 kB)". The load-time
  figure only ever appeared in self-authored status docs with no report behind it.
- Stack: Clerk Auth → Supabase Auth (Clerk was removed in raslipwani `14ac8e5`); EmailJS
  → Resend (EmailJS was never in the dependency tree); added React Router, React Hook
  Form and Zod. Skills panel updated to match.
- Schema counts corrected from migrations 000–013: properties 25·5, bookings 26·12,
  clients 27·6, client_property_interests 8·3, client_communications 11·4,
  admin_settings ~70·1.
- Features: dropped "International market support (UN Housing portal)" — the routes are
  shelved (commented out in `src/App.jsx`, commit `8075b2f`). Added property segments,
  RLS, booking notes, the mobile admin nav and the a11y gate.
- Technical highlights: dropped "Full-text search with PostgreSQL indexes" — there is no
  `tsvector` or `textSearch` in the repo; search is `ilike` filtering. Stale time is now
  described as the three-tier policy it actually is (30 s / 5 min / 30 min).
- Project ordering comment rewritten: both projects now have captures, so the
  evidence-first sort is a no-op and Raslipwani (01) leads.

### Retained, unsourced, not rendered
- "3s → 1.2s", "90 % coverage target", "100+ active users", "95/100 mobile Lighthouse",
  and every line of `performanceMetrics` except the bundle figure. They stay in the data
  with no `source` until someone produces the artifact.

### Known issues
- Two captures (`properties`, `services`) were taken on a machine with no emoji font,
  so the site's emoji glyphs (📍, 🛏) render as boxes. Retake after
  `apt install fonts-noto-color-emoji`.
- The raslipwani property modal keeps its image at `opacity-0` when the image is already
  cached (the fade-in is bound to `onLoad`, which has fired before React attaches it).
  Worked around for the capture; the fix belongs in raslipwani.

## [2026-08-31] — Email: Resend on a real `voyani.tech`

Executes [`EMAIL_ROADMAP.md`](./EMAIL_ROADMAP.md). Phase 0 removed every undeliverable
address the site published; this makes the domain itself able to send and receive, and
publishes `karisa@voyani.tech` on the back of it.

**Not yet verified live.** DNS is complete — SPF, DKIM, DMARC and both MX records
resolve as of 2026-08-31 — and the code below is committed and type-checked. But the edge
functions have not been redeployed and the end-to-end send/receive test (roadmap Task 11,
Steps 1–5) has not been run. Until those are done, treat the published address as
configured-but-unproven.

### Added
- `supabase/functions/_shared/inbound.ts` + tests (25) — one pure, Deno-free module that
  shapes every inbound row. It exists because the inline version of this logic disagreed
  with `migrations/20260328000000_inbound_email_system.sql` in six separate ways.
- `supabase/functions/_shared/mail.ts` + tests (5) — `buildFrom`, `buildReplyAddress`,
  `buildThreadMessageId`. The sending identity now comes from `MAIL_FROM_ADDRESS` /
  `MAIL_FROM_NAME` / `MAIL_DOMAIN`, so changing the address is a secret update rather
  than a source edit in three files.
- Forwarding: mail sent directly to `karisa@voyani.tech` (or any other mailbox on the
  domain) is now re-sent to `voyanitech@gmail.com` with a provenance banner and the
  original sender in `reply_to`. Threaded, non-spam replies are forwarded too — before
  this they were visible only inside `/admin/submissions`.
- A `direct` inbound route. `extractSubmissionId()` matched only `reply+{uuid}@` and
  returned `400 Invalid recipient address format` for everything else, so a human
  emailing the address would have been rejected outright.

### Fixed
- **`handle-inbound-email` could never boot.** It declared `const bodyText` twice in the
  same block scope — a `SyntaxError` at module evaluation. Every line below it had
  therefore never run in production.
- Six schema mismatches in its `inbound_replies` insert: `sender_verified` →
  `is_sender_verified`; the `GENERATED ALWAYS` column `body_preview` was being written
  to; `references` was a `string` against a `text[]` column; `message_id` could be
  `undefined` against `NOT NULL UNIQUE`; `from_email` carried the raw
  `Jane <j@x.com>` header against a `CHECK` regex that rejects it. Plus
  `analytics_events.metadata` → `event_data`, and `filename`/`size` →
  `file_name`/`file_size` on `inbound_attachments`.
- Sender verification compared raw headers with `includes()`, so
  `Jane <jane@evil.com>` matched a submission from `e@vil.com` by substring. It now
  compares parsed bare addresses.

### Security
- Webhook signature verification now **fails closed** in both receivers.
  `handle-inbound-email` logged `'Invalid webhook signature - proceeding anyway for
  debugging'` and carried on with the `401` commented out; `handle-resend-webhook`
  returned `true` when no secret was set. Either one let anyone who learned the URL
  write rows into `inbound_replies`.

### Changed
- Published contact address: `voyanitech@gmail.com` → **`karisa@voyani.tech`**, one line
  in `src/config/site.js`. Footer, contact section, privacy policy and the JSON-LD
  `Person.email` all read from it. `voyanitech@gmail.com` remains the forward
  destination (`ADMIN_EMAIL`) and is no longer published anywhere on the site.
- Privacy policy's third-party disclosure named **EmailJS** as the processor of contact
  messages. Nothing had imported EmailJS since Phase 0 — the actual processors are
  Resend and Supabase, which the page now names instead.

### Removed
- `@emailjs/browser`, a dependency no source file imported, and its entry in the
  `forms` manual-chunk regex in `vite.config.js`.

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
- No screenshots exist for CAD Web Viewer (private client deployment); its card shows an
  explicit "capture pending" state rather than a fake or borrowed image. *(Raslipwani was
  in the same state until 2026-09-16 — see the entry above.)*
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
