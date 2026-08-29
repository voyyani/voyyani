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
 * The only inbox that actually receives portfolio mail today is the one the deployed
 * notification function forwards to (supabase/functions/send-notification/index.ts:18).
 *
 * TODO(karisa): a custom-domain address reads better than a gmail on a portfolio.
 * Add an MX record for voyani.tech (a forwarding service is enough) and switch
 * `email` below to karisa@voyani.tech. Change it here only — everything imports it.
 */

export const SITE = {
  name: 'Karisa Voyani',
  shortName: 'Karisa',
  brand: 'Voyani.tech',

  role: 'Mechanical Engineer → Full-Stack Developer',
  location: 'Nairobi, Kenya',

  url: 'https://voyani.tech',

  // Deliverable today. See the note above before changing.
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

  ogImage: 'https://voyani.tech/og-image.jpg',
};

export const mailto = (subject) =>
  `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

export default SITE;
