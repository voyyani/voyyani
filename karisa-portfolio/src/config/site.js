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
 * Done, 2026-08-31: voyani.tech has an MX record via Resend Inbound and this is now
 * karisa@voyani.tech. See docs/EMAIL_ROADMAP.md.
 */

export const SITE = {
  name: 'Ngowa Karisa',
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

  /**
   * Changed 2026-08-31 from voyanitech@gmail.com. voyani.tech now has a Resend MX
   * record, so this address both sends (Resend, from the edge functions) and receives
   * (Resend Inbound -> handle-inbound-email -> forwarded to voyanitech@gmail.com).
   *
   * Verified before publishing: `dig +short MX voyani.tech` returns the Resend host and
   * a live send to this address arrived in Gmail. Do NOT change this without repeating
   * both checks — the whole point of this file is that the published address is real.
   */
  email: 'karisa@voyani.tech',

  social: {
    github: 'https://github.com/voyyani',
    // The real profile, per resume.html and the links embedded in resume.pdf.
    // SEO.jsx previously published linkedin.com/in/karisa-voyani, which is not it.
    linkedin: 'https://linkedin.com/in/karisa-ngowa-b7630111b/',
  },

  resume: {
    href: '/Ngowa-Karisa-Resume.pdf',
    // filename the browser saves it as
    downloadAs: 'Ngowa-Karisa-Resume.pdf',
  },

  headshot: {
    portrait: '/images/karisa-headshot.jpg', // 1024x1280 (4:5)
    square: '/images/karisa-headshot-square.jpg', // 1024x1024
    alt: 'Ngowa Karisa, Mechanical Engineer and Full-Stack Developer',
  },

  ogImage: 'https://www.voyani.tech/og-image.jpg',
};

export const mailto = (subject) =>
  `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export default SITE;
