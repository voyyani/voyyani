/**
 * The two client platforms, extracted verbatim from Projects.jsx during the Kanga Sheet
 * rebuild. Neema's figures were verified in a prior pass. Raslipwani's were re-verified
 * on 2026-09-14 against the repo at `d3e978b` and on 2026-09-16 against the live site —
 * see docs/RASLIPWANI_GO_LIVE.md §7 for every source. Culture SZN was added 2026-09-21
 * from the completed intake in docs/cultureszn.md, verified against its repo at `90007b2`.
 *
 * `liveStatus.checkedOn` is a real date someone opened the site. If you change a status,
 * change the date with it.
 */
export const PROJECTS = [
    {
      id: 1,
      title: "Raslipwani Properties",
      tagline: "Real estate booking & client management",
      // Shown on the card. Two sentences, plain language, no adjectives I can't defend.
      summary: "A property platform where buyers book viewings and staff run the whole pipeline — listings, bookings and client history — from one dashboard.",
      description: "A property management platform for a Kenyan real-estate agency based at Kikambala on the coast. The public side lets buyers search listings and book viewings; the admin side is where the agency actually works — managing properties, rescheduling bookings, tracking which client asked about which property, and keeping a record of every conversation.",
      // Verified against package.json @ d3e978b (2026-09-14). Clerk was removed in
      // raslipwani commit 14ac8e5 (auth is Supabase Auth); EmailJS was never in the
      // dependency tree (email is Resend via a Vercel serverless function). Cloudinary
      // is used as a hosted media CDN, not via an SDK.
      technologies: [
        "React 18.3",
        "Vite 6.3",
        "Supabase",
        "PostgreSQL",
        "Tailwind CSS",
        "React Query",
        "React Router",
        "React Hook Form",
        "Zod",
        "FullCalendar",
        "Framer Motion",
        "Supabase Auth",
        "Resend",
        "Vercel Analytics",
        "Cloudinary",
        "Vitest",
        "React Testing Library"
      ],
      /**
       * `source` is what makes a figure printable.
       *
       * Product Principle 1: a number on the page links to the artifact that proves it,
       * or it does not go on the page. The card and the modal render ONLY the metrics
       * carrying a `source`, so an unsourced figure cannot reach display scale by
       * accident. Nothing has been deleted — the entries below without a `source` are
       * retained verbatim, and need one before they can be shown again.
       *
       * 2026-09-14 audit (docs/RASLIPWANI_GO_LIVE.md §7): "3s → 1.2s" only ever appeared
       * in self-authored status docs with no report behind it, and "90%" is not stated
       * anywhere in the repo — both lost their `source`. The two figures that do have an
       * artifact are the bundle budget and the coverage ratchet.
       */
      metrics: [
        {
          label: "First-load JS",
          value: "−49%",
          source: "220.7 → 112.8 kB gzip, bundle-budget.json in the repo, measured 2026-09-08 and enforced in CI"
        },
        {
          label: "Test coverage",
          value: "58%",
          source: "Lines, from the committed coverage report of 2026-09-08; CI floor is 57%"
        },
        {
          label: "A11y gate",
          value: "≥ 95",
          source: "lighthouserc.json — Lighthouse CI fails the build below 0.95 accessibility, on every push"
        },
        // Unsourced — retained, not shown. Each needs a measured source (who ran it,
        // against what, on what date) before it can go back on the page.
        { label: "Page Load", value: "3s → 1.2s" },
        { label: "Test coverage target", value: "90%" },
        { label: "Active Users", value: "100+" },
        { label: "Mobile Lighthouse", value: "95/100" }
      ],
      category: "Full-Stack",
      challenge: "The first version loaded every property and every booking on page load. That was fine with 40 listings and painful by 400, and the agency's staff were the ones paying for it, all day, on slow connections.",
      solution: "Three changes did most of the work. Server-side pagination so a page fetches 20 rows instead of the whole table. A 500ms debounce on search, which stopped firing a query per keystroke. And React Query with a tiered stale time — 30 seconds for live data, 5 minutes as the default, 30 minutes for static content — so navigating back to a list you just left is instant instead of a refetch. Optimistic updates with rollback came later, once the data layer was predictable enough to trust. The first-load bundle went from 221 kB to 113 kB gzipped, and that budget is now enforced in CI.",
      // Each bullet points at a file in the raslipwani repo (docs/RASLIPWANI_GO_LIVE.md §7.5).
      // Dropped 2026-09-14: "International market support (UN Housing portal)" — the routes
      // are shelved (commented out in src/App.jsx, commit 8075b2f), so it is not shipped.
      features: [
        "Property search & filtering by purpose, type, location and budget",
        "Property segments for diplomatic, corporate and student housing",
        "Viewing booking flow with in-person, virtual and 3D options",
        "Complete CRM with client lifecycle tracking",
        "Property interest tracking & communication timeline",
        "FullCalendar booking management with optimistic rescheduling",
        "Transactional email to admin and customer via Resend",
        "Multi-status workflow system (pending → confirmed → completed)",
        "Role-based admin access (admin / agent) on Supabase Auth",
        "Row-level security on every table, gated by a SECURITY DEFINER is_admin()",
        "CSV export for bookings and clients",
        "Internal admin notes on bookings",
        "Configurable settings with Quill-edited email templates",
        "Business hours management that drives the booking calendar",
        "Responsive mobile-first design with a bottom nav for admins",
        "SEO optimized with react-helmet-async and a sitemap",
        "Comprehensive testing suite (Vitest + RTL + axe-core)"
      ],
      // Verified in code 2026-09-14 — file references in docs/RASLIPWANI_GO_LIVE.md §7.3.
      // "Full-text search with PostgreSQL indexes" was dropped: there is no tsvector or
      // textSearch anywhere in the repo; search is ilike filtering.
      technicalHighlights: [
        "Server-side pagination (20 items/page, src/hooks/usePagination.js)",
        "Debounced search (500ms, src/hooks/useDebounce.js)",
        "React Query three-tier cache policy (30s live / 5min standard / 30min static)",
        "Optimistic UI updates with automatic rollback on booking reschedule",
        "Image delivery via Cloudinary CDN with an admin-configurable upload preset",
        "Every public and admin route lazy-loaded with React.lazy()",
        "Vitest coverage ratchet in CI (floor 57% lines, never lowered)",
        "Vercel Analytics & Speed Insights, both lazy-loaded",
        "Lighthouse CI on every push: accessibility ≥ 0.95 is a hard error",
        "Design-system budgets enforced by ESLint rules (palette, labels, file size, bundle)",
        "Comprehensive error boundaries & fallbacks"
      ],
      architecture: [
        "Frontend: React 18, built with Vite",
        "State: React Query for server state, Context for UI state",
        "Backend: Supabase (PostgreSQL + PostgREST + Auth + RLS)",
        "Storage: Cloudinary for optimized image delivery",
        "Auth: Supabase Auth with an admin_users role table",
        "Email: Resend via Vercel serverless functions",
        "Deployment: Vercel with serverless functions & CDN",
        "Testing: Vitest + React Testing Library + axe-core + jsdom",
        "CI/CD: GitHub Actions — lint, coverage, budgets, a11y, build, Lighthouse"
      ],
      // Structured rather than pre-formatted strings: this is tabular data and the modal
      // renders it as a table, so the shape belongs in the data, not in punctuation.
      // Counts are the net of CREATE TABLE + ADD COLUMN − DROP COLUMN across
      // supabase/migrations/000–013, parsed 2026-09-14 (docs/RASLIPWANI_GO_LIVE.md §7.4).
      databaseSchema: [
        { name: "properties", shape: "25 cols · 5 idx", holds: "Listings, availability and market segment" },
        { name: "bookings", shape: "26 cols · 12 idx", holds: "Viewings, reschedules, status history" },
        { name: "booking_notes", shape: "7 cols · 3 idx", holds: "Internal admin notes per booking" },
        { name: "clients", shape: "27 cols · 6 idx", holds: "CRM profiles" },
        { name: "client_property_interests", shape: "8 cols · 3 idx", holds: "Which client asked about which property" },
        { name: "client_communications", shape: "11 cols · 4 idx", holds: "Call, email and WhatsApp log per client" },
        { name: "email_templates", shape: "9 cols · 2 idx", holds: "Quill-edited transactional templates" },
        { name: "admin_users", shape: "4 cols", holds: "Supabase-Auth-linked admin and agent roles" },
        { name: "admin_settings", shape: "~70 cols · 1 idx", holds: "Single-row site config: Cloudinary, email, business hours, branding" }
      ],
      // Kept to things that are distinct from each other and from the sections above.
      keyAchievements: [
        "Halved the first-load bundle (221 → 113 kB gzip) and locked it in with a CI budget",
        "Replaced the agency's spreadsheet-based client tracking with a real CRM",
        "Booking pipeline handles reschedules and status changes without losing history",
        "Access control lives in PostgreSQL row-level security, not just the admin UI"
      ],
      adminFeatures: [
        "Dashboard with booking and client metrics",
        "FullCalendar integration (day/week/month/list views)",
        "Client management with search, filters & pagination",
        "Property management with paginated, debounced search",
        "Booking workflow with drag-and-drop rescheduling and rollback",
        "Communication timeline for all client interactions",
        "Email template editor with Quill rich text",
        "Business hours configuration",
        "Cloudinary upload settings with a test button",
        "CSV export for bookings & clients",
        "Booking notes and status badges",
        "Mobile bottom navigation for staff on the move"
      ],
      // Only the first line has an artifact behind it (bundle-budget.json). The rest are
      // retained as recorded but have no report; the modal does not render this array.
      performanceMetrics: [
        "First-load JS: 220.7 kB → 112.8 kB gzip (bundle-budget.json, 2026-09-08)",
        "Lighthouse CI thresholds on mobile: performance ≥ 0.90, accessibility ≥ 0.95 (error), best practices ≥ 0.90, SEO ≥ 0.90",
        "Initial Load: 1.2s (60% faster than baseline) — unsourced",
        "Time to Interactive: <2s on 3G networks — unsourced",
        "First Contentful Paint: <1s — unsourced",
        "API Response Time: <200ms average — unsourced",
        "Database Query Time: <50ms with indexes — unsourced",
        "Mobile Performance Score: 95/100 — unsourced",
        "Desktop Performance Score: 98/100 — unsourced"
      ],
      liveUrl: "https://raslipwani.co.ke",
      githubUrl: "https://github.com/voyyani/raslipwani",
      // Checked 2026-09-16 in headless Chromium: /, /properties, /services,
      // /services/viewing, /about, /contact and /admin/login all return 200 and render
      // the product. The maintenance window that ran through August is over.
      liveStatus: { state: "live", checkedOn: "16 Sep 2026" },
      // Captured from the live site on 2026-09-16 at 1440x900 @2x. The admin dashboard
      // needs Karisa's own login and is not captured.
      screenshots: [
        {
          src: "/images/projects/raslipwani/home.jpg",
          alt: "Raslipwani Properties home page: hero photo of a coastal villa at dusk with the headline 'Kenyan property, handled properly.' and a search panel for location, property type and budget",
          caption: "Home — search by location, purpose and budget straight from the hero"
        },
        {
          src: "/images/projects/raslipwani/properties.jpg",
          alt: "Listings page showing '12 Properties Found' as a grid of property cards with price, location, beds and baths, beside a filter panel for purpose, property type and sort order",
          caption: "Listings — server-side paginated grid with purpose, type and sort filters"
        },
        {
          src: "/images/projects/raslipwani/property.jpg",
          alt: "Property detail modal for 'Vipingo Prime Land for Sale – 900 Acres' at Ksh 3,500,000, with a photo carousel, description and 'Book a viewing' and 'Contact agent' buttons",
          caption: "Property detail — lazy-loaded modal with carousel and a direct route to booking"
        },
        {
          src: "/images/projects/raslipwani/viewing.jpg",
          alt: "Viewing booking page headed 'Choose Your Viewing Experience' with three options: In-Person Viewing, Virtual Tour and 3D Viewing Experience",
          caption: "Booking — the public side of the viewing pipeline the admin calendar manages"
        },
        {
          src: "/images/projects/raslipwani/services.jpg",
          alt: "Services page headed 'Kenya Real Estate Services' with 'Book a Viewing' and 'Get Consultation' calls to action above a grid of service cards",
          caption: "Services — sales, acquisition, valuation and management, each linking into the booking flow"
        }
      ],
      index: "01"
    },
    {
      id: 2,
      title: "Neema Foundation Kilifi",
      tagline: "Non-profit site with a CMS their team actually runs",
      summary: "A public site and content system for a Kilifi non-profit, built so their staff can publish programmes, stories and events themselves — without calling a developer.",
      description: "The public website and admin system for a faith-based non-profit in Ganze, Kilifi County, working in healthcare, education and youth empowerment. The brief was less about the website and more about who maintains it: everything a visitor sees — hero copy, programmes, stories, events, gallery albums, donation routes — is editable by their own staff, none of whom write code.",
      technologies: [
        "React 19",
        "TypeScript 5.9",
        "Vite 7",
        "Supabase",
        "PostgreSQL",
        "Tailwind CSS 3.4",
        "React Query v5",
        "React Router 7",
        "Framer Motion 12",
        "Three.js",
        "TipTap Editor",
        "Zod Validation",
        "React Hook Form",
        "Vercel Analytics",
        "DND Kit",
        "Lucide Icons"
      ],
      // Verified 2026-09-17 against the live site: after the client's redesign the
      // home and programmes pages report "3 programmes · running now" and "2,950+
      // people reached · since 2020". The earlier "4 active programs" / "10,000+ lives
      // touched" came from the old donate page (checked 29 Aug 2026), which no longer
      // publishes either figure. Smaller, but it is what the client says today.
      metrics: [
        {
          label: "Active Programmes",
          value: "3",
          source: "The client's own programmes page, checked 17 Sep 2026"
        },
        {
          label: "People Reached",
          value: "2,950+",
          source: "The client's own home page impact counters, checked 17 Sep 2026"
        },
        {
          label: "RBAC Tiers",
          value: "5",
          source: "The role tier column, on the specification"
        },
        // Unsourced — retained, not shown. See the note on the Raslipwani metrics.
        { label: "LCP Score", value: "<2.5s" },
        { label: "A11y Score", value: "95+" },
        { label: "Mobile First", value: "100%" }
      ],
      category: "Full-Stack",
      challenge: "A non-profit's site goes stale the moment it needs a developer to change anything. This one had to be editable by staff with no technical background — while still not letting a volunteer with gallery access accidentally edit the donation details.",
      solution: "A 5-tier role system, from Super Admin down to Viewer, with permissions granular enough that someone can be trusted with stories and events but not with site settings or user management. Content editing is TipTap with DOMPurify sanitising everything on the way in, and ordering is drag-and-drop rather than a number field nobody understands. The permission checks live in PostgreSQL Row-Level Security, not just the UI — hiding a button is not access control.",
      features: [
        "Dynamic Programs showcase with category filtering",
        "Interactive Impact metrics with animated counters",
        "Stories & Testimonials carousel system",
        "Events calendar with registration workflows",
        "Multi-pathway Donation system (Bank, Mobile, Sponsorship)",
        "Volunteer registration with role matching",
        "Partnership inquiry & corporate engagement",
        "Legacy giving & planned donations",
        "Board governance transparency section",
        "Three.js animated hero with reduced-motion support",
        "Smooth-scroll navigation with a11y fallbacks",
        "Trust bar with partner logos",
        "SEO optimized with meta management",
        "Contact forms with validation",
        "Bank details page with copy/print support",
        "Mobile-first responsive design",
        "Maintenance mode with admin override"
      ],
      technicalHighlights: [
        "React 19 with concurrent features & Suspense",
        "5-tier RBAC with 20+ granular permissions",
        "TipTap rich-text editor with image uploads",
        "DND Kit for drag-and-drop content ordering",
        "React Query v5 with intelligent cache invalidation",
        "Zod schema validation with React Hook Form",
        "Three.js hero with performance optimizations",
        "Framer Motion with reduced-motion detection",
        "PostgreSQL with Row-Level Security (RLS)",
        "Supabase Auth with session management",
        "Vercel Edge deployment with analytics",
        "TypeScript strict mode with ESLint 9"
      ],
      architecture: [
        "Frontend: React 19 + TypeScript + Vite 7 (HMR)",
        "State: React Query v5 (server) + Context (UI)",
        "Backend: Supabase (PostgreSQL + PostgREST + Auth)",
        "CMS: Custom admin with TipTap + DND Kit",
        "Auth: Supabase Auth with 5-tier RBAC",
        "Styling: Tailwind CSS 3.4 + Framer Motion 12",
        "3D: Three.js for hero animations",
        "Deployment: Vercel with Edge Functions",
        "Validation: Zod + React Hook Form"
      ],
      databaseSchema: [
        { name: "profiles", shape: "8 cols · 3 idx", holds: "Accounts and their role tier" },
        { name: "programs", shape: "18 cols · 5 idx", holds: "Programme content, editable by staff" },
        { name: "events", shape: "20 cols · 6 idx", holds: "Events and registrations" },
        { name: "impact_metrics", shape: "12 cols · 4 idx", holds: "The counters shown on the public site" },
        { name: "stories", shape: "15 cols · 5 idx", holds: "Testimonials and success stories" },
        { name: "board_members", shape: "12 cols · 3 idx", holds: "Governance profiles" },
        { name: "hero_content", shape: "10 cols · 2 idx", holds: "Hero slides, CMS-managed" },
        { name: "site_settings", shape: "15 cols · 2 idx", holds: "Branding and configuration" },
        { name: "contact_info", shape: "8 cols", holds: "Organisation contact details" },
        { name: "partners", shape: "10 cols · 3 idx", holds: "Partner organisations" }
      ],
      keyAchievements: [
        "Staff publish programmes, stories and events without developer involvement",
        "Permissions enforced in PostgreSQL RLS, so the API can't be talked around",
        "Rich-text input sanitised with DOMPurify before it ever reaches the database",
        "Three.js hero degrades to a static image under prefers-reduced-motion"
      ],
      adminFeatures: [
        "Real-time dashboard with donation & volunteer metrics",
        "Programs CRUD with rich-text descriptions",
        "Stories management with image galleries",
        "Events calendar with status workflows",
        "Board member profiles with bios",
        "Hero content slider management",
        "Impact metrics editor with icons",
        "Site settings with branding controls",
        "User management with role assignment",
        "Permission-based navigation",
        "Drag-and-drop content ordering",
        "TipTap WYSIWYG editor with extensions",
        "Image upload with preview",
        "Color picker for brand customization",
        "Activity audit logging",
        "Maintenance mode toggle"
      ],
      performanceMetrics: [
        "Largest Contentful Paint: <2.5s",
        "Cumulative Layout Shift: <0.1",
        "Total Blocking Time: <200ms",
        "Lighthouse Performance: 90+",
        "Lighthouse Accessibility: 95+",
        "Lighthouse SEO: 95+",
        "Mobile Performance: 95/100",
        "First Input Delay: <100ms"
      ],
      liveUrl: "https://neemafoundationkilifi.org",
      githubUrl: "https://github.com/voyyani/Neema-Foundation-Kilifi",
      liveStatus: { state: "live", checkedOn: "17 Sep 2026" },
      // Captured 2026-09-17 with scripts/capture-screenshots.mjs after the site's
      // editorial redesign (ruled-paper layout, impact counters). Alt text describes
      // what is in the frame, not what the page does — that is the caption's job.
      screenshots: [
        {
          src: "/images/projects/neema/home.jpg",
          alt: "Neema Foundation home page: bold headline 'Need meets God's grace' beside an aerial photo of the Ganze mission site, with Donate Now and See the programmes buttons and impact counters reading 2,950+ people reached, 3 programmes and founded 2020",
          caption: "Home — hero copy, imagery and impact counters are all editable from the admin CMS"
        },
        {
          src: "/images/projects/neema/programs.jpg",
          alt: "Programmes page headed 'The programmes' with counters for 3 programmes and 2,950+ people reached, category filters for Education and Community, and programme photo cards below",
          caption: "Programmes — CMS-driven listings with drag-and-drop ordering and category filters"
        },
        {
          src: "/images/projects/neema/donate.jpg",
          alt: "Donation page headed 'Give to the foundation' explaining M-Pesa and bank transfer giving, with a checklist of trust points and a 'Your gift' amount chooser below",
          caption: "Donate — multi-pathway giving (bank, mobile money, sponsorship)"
        },
        {
          src: "/images/projects/neema/media.jpg",
          alt: "Media page headed 'Photographs' with album filters for All, Programmes and Events above a large photo of a community event under a tent",
          caption: "Media — album gallery with filtering, populated entirely through the CMS"
        },
        {
          src: "/images/projects/neema/volunteer.jpg",
          alt: "Volunteer page headed 'Give your time in Ganze' listing medical, teaching, outreach and technical roles, with Apply to volunteer and See the roles buttons and a section titled 'The roles'",
          caption: "Volunteer — registration workflow with role matching"
        }
      ],
      index: "02"
    },
    {
      id: 3,
      title: "Culture SZN",
      tagline: "Catalogue and link-in-bio for a Nairobi music collective",
      summary: "The online home of a Nairobi music-and-design collective: every release playable in one tap, artist profiles, a journal and a newsletter — built for fans on mid-range Android phones over metered data.",
      description: "A catalogue site for Culture SZN, a Nairobi music-and-design collective (XiiX, Wavy SRF, Pipí Ciagi). A fan lands from a WhatsApp or Instagram link on any release page, taps once to play it on YouTube (or the Spotify embed when there is no YouTube link), sees the tracklist and every platform it is on, reads who the artist is, and shares it back. There is no admin side and no login: the team publishes by editing JSON, TypeScript and MDX files in the repo, and a scheduled GitHub Action keeps the Spotify discography current by committing a JSON catalogue daily. Paid client work, credited to VOYANI.",
      // Verified against package.json @ 90007b2 (2026-09-21). lucide-react is in the
      // dependency tree but imported nowhere in src/ or api/ — left off the list.
      // Playwright is a devDependency used only for design-review captures, not tests.
      technologies: [
        "React 19.2",
        "TypeScript 5.9",
        "Vite 7",
        "Tailwind CSS 4",
        "React Router 7",
        "Framer Motion 12",
        "MDX 3",
        "Vitest 3",
        "React Testing Library",
        "ESLint 9",
        "Vercel",
        "GitHub Actions",
        "Spotify Web API",
        "Resend",
        "Cloudinary",
        "YouTube Embed"
      ],
      /**
       * All three shown figures were measured on 2026-09-21 in a checkout of the
       * cultureszn repo at 90007b2 (docs/cultureszn.md §8a). The "before" chunk size is
       * a `vite build` of c5d41b0, the last commit of the February version, run the same
       * day in a scratch checkout — not a figure copied from a status doc.
       */
      metrics: [
        {
          label: "Largest JS chunk",
          value: "202 → 71 kB",
          source: "gzip. Before: vite build of c5d41b0 (one chunk, 690.28 kB / 202.34 kB gzip). After: npm run check:size at 90007b2 (react chunk 70.9 kB gzip). Both run 2026-09-21."
        },
        {
          label: "Tests",
          value: "133",
          source: "31 files, all passing — npm test at 90007b2 on 2026-09-21; lint, tests, build and the size gate run in CI on every push"
        },
        {
          label: "Bundle budget",
          value: "100 kB",
          source: "scripts/check-bundle-size.mjs fails CI when any chunk exceeds 100 kB gzip; measured largest chunk 70.9 kB on 2026-09-21"
        },
        // Unsourced — retained, not shown. Lighthouse has never been run against the
        // site (docs/LAUNCH.md says "Not yet measured"); the dead-code figure comes from
        // the audit's estimate, not from a totalled commit stat.
        { label: "Lighthouse mobile", value: "Perf ≥ 90 · A11y 100" },
        { label: "Dead code removed", value: "~4,500 lines" }
      ],
      category: "Frontend",
      challenge: "The first version did not build — 24 type errors — and its single 690 kB JavaScript chunk shipped Node polyfills and, worst, read the Spotify client secret from a VITE_-prefixed variable, which Vite inlines into the browser bundle. An audit found 30 defects: an OAuth flow that never validated its state parameter, encryption that discarded its IV, ~4,500 lines that never rendered, fabricated stats and stock photos presented as members, and a newsletter form that faked success on a timer. All of it aimed at fans on mid-range Android over metered data, where every kilobyte and every dead end costs something.",
      solution: "Rather than patch the Spotify player, the rebuild deleted every credentialed browser path and moved the only Spotify call into a scheduled job: a GitHub Action fetches the discography with client credentials, writes a JSON catalogue, and commits it. At build time that JSON is merged with the hand-curated release list, so the site renders from static data and never waits on a network call — and no secret exists anywhere a visitor can reach. Playback became a pure decision function: YouTube first, Spotify embed second, platform buttons last, with every embed behind a click-to-load facade so no third-party iframe loads before a tap. Then the payload was attacked directly — lazy routes, vendor chunks, per-artist and per-article chunks, console stripping — and a CI gate that fails when any chunk exceeds 100 kB gzip. The largest chunk went from 202 kB to 71 kB gzip, with a 133-test harness and CI that did not exist before.",
      features: [
        "Home with roster panels, a NOW PLAYING strip for the latest release and recent drops",
        "Artist profiles: bio, credits, verified platform links, discography as numbered stops",
        "Release pages with one-tap play, tracklist, description and every platform link",
        "YouTube-first playback with Spotify embed as fallback, both behind a tap",
        "Releases index grouped by year with a 'New' tape on the newest card",
        "Platform buttons for Spotify, Apple Music, SoundCloud, YouTube, Audiomack and Boomplay",
        "SZNals journal authored as MDX files, one chunk per article",
        "Join SZN: WhatsApp community link and a newsletter into a Resend audience",
        "Share row: WhatsApp, X and copy-link on every artist and release",
        "Route-board header with a lit 'current stop' indicator and mobile menu",
        "Per-route title, description, Open Graph card and schema.org JSON-LD, prerendered so WhatsApp previews work without a server",
        "Legacy /members/:slug redirects to /artists/:slug",
        "Skip link, landmark structure and labelled sections; reduced motion honoured",
        "Honest placeholders: a missing portrait paints the name on a colour panel, a missing link omits the button"
      ],
      // Each line points at a file in the cultureszn repo (docs/cultureszn.md §7c).
      technicalHighlights: [
        "Build-time catalogue merge: Spotify JSON joined to curated releases by album id (src/lib/catalog.ts)",
        "Scheduled sync in GitHub Actions: client-credentials token, paginated fetch, 429 backoff, no commit when nothing changed",
        "Playback as a pure decision: YouTube → Spotify → links (src/lib/playback.ts, unit-tested)",
        "Click-to-load facades for every third-party iframe; youtube-nocookie domain",
        "Home in the entry chunk, every other page lazy; react and motion vendor chunks; per-artist and per-article chunks",
        "Bundle budget gate in CI: fails above 100 kB gzip per chunk (scripts/check-bundle-size.mjs)",
        "Per-route static <head> prerendered from an SSR-built metadata module (scripts/prerender.mjs)",
        "Strict CSP (script-src 'self'), HSTS preload, frame-ancestors 'none', immutable caching for hashed assets",
        "Cloudinary f_auto,q_auto transforms with generated srcset; two self-hosted WOFF2 font subsets",
        "Data-honesty tests: no placeholder imagery or fabricated content can reach the page; every internal link must hit a declared route",
        "Newsletter endpoint with honeypot, server-side validation and Resend via plain fetch — no SDK"
      ],
      architecture: [
        "Frontend: React 19 + TypeScript (strict), built with Vite 7",
        "Styling: Tailwind CSS 4 bound to role tokens; self-hosted font subsets",
        "Routing: React Router 7, nine routes, every page but Home lazy-loaded",
        "Data: static modules in the repo — curated releases, artist profiles, MDX journal",
        "Catalogue: daily GitHub Action commits Spotify discography as JSON, merged at build",
        "Backend: one Vercel serverless function (newsletter → Resend)",
        "Media: Cloudinary for imagery; YouTube and Spotify embeds behind facades",
        "Deployment: Vercel static + security headers; prerendered per-route <head>",
        "CI/CD: GitHub Actions — lint, tests, build, bundle-size gate on every push"
      ],
      // There is no database. Content is files in the repo (src/data/*, content/sznals/*)
      // and the Spotify catalogue is a committed JSON file. The card says so in one line.
      databaseSchema: [],
      keyAchievements: [
        "Turned a codebase that would not compile and leaked a Spotify secret into a green, typed, tested build with CI gates",
        "Cut the largest JavaScript chunk from 202 kB to 71 kB gzip and locked the budget into CI",
        "Replaced a runtime OAuth player with a build-time catalogue: no secrets in the visitor's path",
        "Removed every fabricated element the audit found and codified 'never fabricate' as tests"
      ],
      // No admin side exists. The team publishes by editing files in the repo.
      adminFeatures: [],
      // Only the first two lines have artifacts (docs/cultureszn.md §8a); the modal does
      // not render this array.
      performanceMetrics: [
        "Largest JS chunk: 202.3 kB → 70.9 kB gzip (vite build of c5d41b0 vs check:size at 90007b2, 2026-09-21)",
        "Initial route: ≈135.6 kB gzip in three parallel chunks (react 70.9 + motion 37.0 + index 27.7)",
        "Lighthouse mobile targets: performance ≥ 90, accessibility 100, SEO ≥ 95 — unsourced, not yet measured"
      ],
      liveUrl: "https://www.cultureszn.com",
      githubUrl: "https://github.com/voyyani/cultureszn",
      // Checked 2026-09-21: / returns 200 and renders the product. Deep routes (/artists,
      // /releases/…, /join) return Vercel NOT_FOUND on direct load — a vercel.json routing
      // fix pending in the cultureszn repo; client-side navigation from / is unaffected.
      liveStatus: { state: "live", checkedOn: "21 Sep 2026" },
      // Captured 2026-09-21 with scripts/capture-screenshots.mjs against `vite preview`
      // of the cultureszn repo at 90007b2 — the same build the live site serves — because
      // the live deep routes 404 on direct load (see liveStatus).
      screenshots: [
        {
          src: "/images/projects/cultureszn/home.jpg",
          alt: "Culture SZN home page on black: the headline 'MADE IN NAIROBI.' in white and yellow, three tall photo panels of XiiX, Wavy SRF and Pipí Ciagi with name plates, and a green LED strip below reading NOW PLAYING · 6 AM · XiiX · Album with a Play button",
          caption: "Home — the roster leads; the newest drop follows on a lit NOW PLAYING strip. Home ships in the entry chunk; every other page loads on first visit"
        },
        {
          src: "/images/projects/cultureszn/release.jpg",
          alt: "Release page for 6 AM by XiiX: square cover art on the left, the title '6 AM' at display scale, a yellow plate reading Album · 31 January 2026, a green Play button beside a Spotify button, a numbered tracklist and a Share on WhatsApp button",
          caption: "Release — one tap plays on YouTube (or the Spotify embed as fallback); no third-party iframe loads before the tap"
        },
        {
          src: "/images/projects/cultureszn/artist.jpg",
          alt: "Artist page for XiiX: the name set at sign scale beside a black-and-white portrait, plates reading Hip-hop artist and Sabaki, Kenya, buttons for YouTube, Spotify, Apple Music and SoundCloud, then a Discography list starting with 6 AM",
          caption: "Artist — a body of work, not a feed. The full profile is its own chunk, fetched only when the page opens"
        },
        {
          src: "/images/projects/cultureszn/releases.jpg",
          alt: "Releases index headed '8 drops · newest first', grouped under 2026 and 2025 with four cover-art cards per row; the 6 AM card carries a red-and-white chevron tape reading New",
          caption: "Releases — curated data merged at build time with the Spotify catalogue; releases without cover art render as title tiles, not stock images"
        },
        {
          src: "/images/projects/cultureszn/sznals.jpg",
          alt: "SZNals journal index: a yellow plate reading 'The journal · culture, process, philosophy', a line saying the first SZNals are being written, then numbered rows under 'In the works' with titles, a summary and category plates, no dates",
          caption: "SZNals — MDX articles code-split per entry; drafts show category only, never an invented publish date"
        },
        {
          src: "/images/projects/cultureszn/join.jpg",
          alt: "Join SZN page: large heading, the line 'One message when something drops — a release, a SZNal, a show. No accounts. No noise.', a panel with an email field and a green Subscribe button, and the site footer below",
          caption: "Join SZN — newsletter into a Resend audience via one serverless function with honeypot and validation"
        }
      ],
      index: "03"
    }
];

export default PROJECTS;
