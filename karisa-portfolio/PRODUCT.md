# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **prospective clients for Voyani** — non-profit directors, property and
small-business owners, and operations leads in Kenya and East Africa who need a
production web platform built end to end by one accountable person. They arrive from a
referral, a LinkedIn profile, or a shared link, often on a phone and often on a slow
connection, and they are deciding whether to trust a single developer with the system
their organisation will run on.

Secondary: **hiring managers and technical recruiters** evaluating Ngowa Karisa for a
full-time engineering role. The same evidence serves them; the page leads with the
client framing.

## Product Purpose

A personal portfolio and services site for Ngowa Karisa (trading as Voyani.tech). It
exists to convert a stranger into a conversation — a client enquiry first, a role
conversation second — by showing shipped, running client software rather than asserting
competence. Success is a submitted enquiry or a direct email, from someone who arrived
cold.

## Positioning

A mechanical engineer (B.Eng, Shenyang Agricultural University; thesis on optimising
mechanical systems with computational methods) who moved into full-stack development and
carried the discipline across: design to a stated tolerance, put the constraint in the
material rather than the manual, load-test before trusting, and measure before claiming.
Neighbouring portfolios cannot truthfully copy this because it is a real degree and a
real practice, visible in specific build decisions (Postgres Row-Level Security rather
than hidden buttons; a stated load-time target before optimisation began).

## Operating Context

Single-page marketing site plus a private `/admin` area (Supabase-authenticated) where
Karisa reads contact submissions, inbound email threads and analytics. Public sections
today: hero, about, projects/case studies, GitHub activity, toolkit, working principles,
contact. Enquiries arrive through a validated contact form (Supabase + a Deno edge
function that notifies by email) and through a published mailto. Visitors frequently
download the résumé PDF. Deployed on Vercel; `www.voyani.tech` is canonical.

## Capabilities and Constraints

- Stack is fixed and in place: React 19, Vite 6, Tailwind 3, React Router 7,
  framer-motion, react-hook-form + Zod, Supabase, Sentry, vite-plugin-pwa.
- Vitest suite must stay green (169 passing at time of writing); tests assert real
  copy and roles in Hero, Skills, Projects, GitHubActivity, ContactForm, NotFound.
- SEO metadata is injected into `index.html` at build time by the `inject-seo-meta`
  plugin in `vite.config.js` from `src/config/seo.js`; the build fails if the
  `<!--%SEO_META%-->` placeholder is removed.
- All identity and contact facts come from `src/config/site.js` — one source of truth.
- Known open production issues are recorded in `docs/AUDIT.md`: entry chunk ~821KB
  because `manualChunks` does not match `react-dom`, admin routes imported eagerly,
  no immutable cache headers on `/assets/*`, `robots.txt` sitemap pointing at the
  redirecting apex host, and no `alternateName` linking the former published name.
- Audience is frequently on mobile and on constrained Kenyan networks; weight and
  first-paint cost are product constraints, not preferences.

## Brand Commitments

- Published name: **Ngowa Karisa**. Formerly published as "Karisa Voyani" — both must
  remain linked in structured data so existing rankings are not orphaned.
- Trading brand: **Voyani.tech**. Location: Nairobi, Kenya.
- Contact address `voyanitech@gmail.com` is the only verified deliverable address;
  every previously published address bounced. Do not invent a new one.
- Voice: plain, measured, specific. No superlatives, no unfalsifiable numbers.

## Evidence on Hand

Real and usable:
- **Neema Foundation** (neemafoundationkilifi.org) — live non-profit CMS with five-tier
  Row-Level-Security roles, run by their own staff. Five real screenshots under
  `public/images/projects/neema/`.
- **Raslipwani Properties** — property platform, Clerk auth; a measured page-load
  improvement from 3s to 1.2s. Client site is in maintenance, so **no screenshots
  exist**.
- Résumé PDF (`public/Ngowa-Karisa-Resume.pdf`, currently 3.1 MB), headshot in
  jpg/webp/avif, `og-image.jpg`, GitHub activity synced to
  `src/data/github-activity.json`, and two authored SVG architecture diagrams.

Absent — must not be fabricated: **no testimonials** (two were requested from clients and
never returned), **no written case-study articles**, **no Lighthouse scores recorded**,
no pricing, no client roster beyond the two above, no admin-area screen captures.

## Product Principles

1. **Every claim is traceable.** A number on the page links to the artifact that proves
   it, or it does not go on the page.
2. **Shipped software is the argument.** Show the running product before describing it.
3. **One accountable builder, end to end.** Schema through deploy is the offer; the
   proof is that both live platforms were built that way.
4. **Engineering discipline is the differentiator**, expressed through specific
   decisions rather than as a metaphor.
5. **It must work at 11pm on a slow connection** — for the visitor as much as for the
   client's users.

## Accessibility & Inclusion

WCAG 2.1 AA is the standing floor and was explicitly enforced in a prior pass: text
contrast ratios were recomputed against every ground, a skip-to-content link is the first
focusable element, one visible focus treatment applies site-wide, and
`prefers-reduced-motion` disables animation globally. Mobile-first and low-bandwidth
tolerance are inclusion requirements for this audience, not optimisations.
