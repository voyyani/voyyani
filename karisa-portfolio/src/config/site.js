/**
 * Single source of truth for identity, contact details and links.
 *
 * Added during Phase 0 ("Foundation & Truth", see docs/roadmapupdated.md) because the
 * same facts were stated differently in five places and three of them were wrong:
 *
 *   - Footer social link said  karisa@thebikecollector.tech
 *   - Footer contact block said karisa@thebikecollector.info
 *   - PrivacyPolicy said        privacy@voyani.tech
 *   - RESUME.md said            karisa@thebikecollector.tech  + linkedin.com/in/yourprofile
 *
 * Verified 2026-08-29 with `dig MX`: neither thebikecollector.tech nor
 * thebikecollector.info resolves at all (no A record, no MX), and voyani.tech has
 * A records but NO MX record. Every address the site published was undeliverable —
 * anyone who emailed Karisa got a bounce.
 *
 * Karisa confirmed voyanitech@gmail.com as the address to publish (2026-08-29). It is
 * also what resume.html and the links embedded in resume.pdf already use, and what the
 * deployed notification function forwards to
 * (supabase/functions/send-notification/index.ts:18) — so site, resume and backend now
 * agree for the first time.
 *
 * Optional later: a custom-domain address reads better on a portfolio. Adding an MX
 * record to voyani.tech (a forwarding service is enough) would let this become
 * karisa@voyani.tech. Change it here only — every component imports from this file.
 */

export const SITE = {
  name: 'Karisa Voyani',
  shortName: 'Karisa',
  brand: 'Voyani.tech',

  role: 'Mechanical Engineer → Full-Stack Developer',
  location: 'Nairobi, Kenya',

  /**
   * Canonical host — Phase 5 item 3, decided by Karisa 2026-08-29: `www` wins.
   *
   * This was `https://voyani.tech` (bare), which the canonical tag, the OG url and
   * sitemap.xml all published — while the apex host actually redirected to `www`.
   * So every canonical URL the site emitted pointed at a URL that redirects away.
   * `www` was chosen because it matches what DNS already does, making this a
   * tag-only change rather than a DNS reconfiguration.
   */
  url: 'https://www.voyani.tech',

  // Confirmed by Karisa, 2026-08-29. See the note above before changing.
  email: 'voyanitech@gmail.com',

  social: {
    github: 'https://github.com/voyyani',
    // The real profile, per resume.html and the links embedded in resume.pdf.
    // SEO.jsx previously published linkedin.com/in/karisa-voyani, which is not it.
    linkedin: 'https://linkedin.com/in/karisa-ngowa-b7630111b/',
  },

  resume: {
    href: '/Karisa-Voyani-Resume.pdf',
    // filename the browser saves it as
    downloadAs: 'Karisa-Voyani-Resume.pdf',
  },

  headshot: {
    portrait: '/images/karisa-headshot.jpg', // 1024x1280 (4:5)
    square: '/images/karisa-headshot-square.jpg', // 1024x1024
    alt: 'Karisa Voyani, Mechanical Engineer and Full-Stack Developer',
  },

  ogImage: 'https://www.voyani.tech/og-image.jpg',
};

export const mailto = (subject) =>
  `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export default SITE;
