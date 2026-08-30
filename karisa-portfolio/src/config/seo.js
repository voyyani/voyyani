/**
 * One definition of the site's SEO tags, rendered two ways.
 *
 * WHY THIS EXISTS
 *
 * Every `og:*`, `twitter:*`, canonical and JSON-LD tag used to be produced only by
 * `SEO.jsx` through react-helmet-async — that is, only after React mounted. The HTML
 * actually served was:
 *
 *     <body><div id="root"></div></body>
 *
 * ...with a head carrying nothing but a charset, a favicon and a generic description.
 * LinkedIn, X, Facebook, Slack, WhatsApp and iMessage do not execute JavaScript. They
 * read that HTML, find no `og:image` and no `og:title`, and render a bare link. Every
 * share of this site was broken, and the Person/WebSite structured data reached nothing.
 * (See docs/AUDIT.md §3.1.)
 *
 * The obvious fix — paste the tags into index.html — creates a second problem: two
 * copies of the same facts, drifting apart the first time either is edited.
 *
 * So the tags are defined ONCE here, as data, and rendered by two consumers:
 *
 *   1. `vite.config.js`  → `renderTagsToHtml()` bakes them into index.html at BUILD time,
 *                          so crawlers and social scrapers get them with zero JS.
 *   2. `SEO.jsx`         → maps the same data into Helmet elements at RUNTIME, so routes
 *                          added later (Phase 4's /writing/*) can override per page.
 *
 * Because both read this module, they cannot disagree.
 *
 * THE data-rh ATTRIBUTE
 *
 * Static tags are emitted with `data-rh="true"`. react-helmet-async marks the tags it
 * owns with exactly that attribute, and on mount it removes every `[data-rh="true"]` tag
 * before inserting its own. Marking the static tags therefore makes Helmet *replace*
 * them rather than append a duplicate set. Tags Helmet does not manage — the favicon and
 * the PWA manifest link — must NOT carry it, or Helmet would strip them and never put
 * them back.
 */

import { SITE } from './site.js';

/** Names this person has published under before. See docs/AUDIT.md §3.6. */
export const ALTERNATE_NAMES = ['Karisa Voyani', 'Karisa Ngowa'];

export const DEFAULTS = {
  // 57 characters. Google truncates the SERP title around 60, so this survives whole.
  title: `${SITE.name} — Mechanical Engineer & Full-Stack Developer`,
  // 142 characters. Descriptions are truncated around 155-160; this stays under it so
  // the sentence is never cut mid-clause.
  description:
    'Ngowa Karisa builds production software the way he was trained to build machines — ' +
    'full-stack platforms shipped end-to-end from Nairobi, Kenya.',
  keywords:
    'Ngowa Karisa, mechanical engineer Kenya, full-stack developer Kenya, React developer Nairobi, ' +
    'Supabase developer, PostgreSQL, software engineer Kenya, Nairobi developer, engineering portfolio',
  locale: 'en_US',
  type: 'website',
  // Trailing slash so the canonical matches the sitemap's <loc> exactly. Google treats
  // these as one URL, but publishing two spellings of the same address is avoidable noise.
  url: `${SITE.url}/`,
};

/**
 * Person + WebSite structured data.
 *
 * `alternateName` carries the previous published names deliberately: the site was
 * renamed from "Karisa Voyani", and without this the two identities compete in search
 * rather than resolving to one entity.
 */
const personSchema = (description, image) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE.url}/#person`,
  name: SITE.name,
  alternateName: ALTERNATE_NAMES,
  jobTitle: ['Mechanical Engineer', 'Full-Stack Developer'],
  url: SITE.url,
  image,
  description,
  email: `mailto:${SITE.email}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nairobi',
    addressCountry: 'KE',
  },
  nationality: { '@type': 'Country', name: 'Kenya' },
  knowsAbout: [
    'Mechanical Engineering',
    'Full-Stack Development',
    'React',
    'JavaScript',
    'TypeScript',
    'Supabase',
    'PostgreSQL',
    'Row-Level Security',
    'Role-Based Access Control',
    'CAD',
    'MATLAB',
    'Finite Element Analysis',
  ],
  sameAs: [SITE.social.github, SITE.social.linkedin],
});

const websiteSchema = (description) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: `${SITE.name} Portfolio`,
  url: SITE.url,
  description,
  inLanguage: 'en',
  // Ties the site to the person above rather than leaving two unrelated entities.
  author: { '@id': `${SITE.url}/#person` },
  publisher: { '@id': `${SITE.url}/#person` },
});

/**
 * Build the full tag set for a page.
 *
 * Returns plain data — no JSX, no HTML — so both renderers can consume it.
 * Pass overrides for a non-homepage route (Phase 4's write-ups will).
 */
export function buildSeoTags(overrides = {}) {
  const {
    title,
    description = DEFAULTS.description,
    keywords = DEFAULTS.keywords,
    image = SITE.ogImage,
    url = DEFAULTS.url,
    type = DEFAULTS.type,
    noindex = false,
  } = overrides;

  // The homepage title already names the person, so it stands alone. Only a page that
  // passes its own title gets the name appended — "Cutting load time from 3s to 1.2s |
  // Ngowa Karisa". The previous rule compared against a constant that the default title
  // never equalled, so the homepage rendered its name twice.
  const fullTitle = title ? `${title} | ${SITE.name}` : DEFAULTS.title;

  const meta = [
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'author', content: SITE.name },
    {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    },
    { name: 'geo.region', content: 'KE' },
    { name: 'geo.placename', content: 'Nairobi' },

    { property: 'og:type', content: type },
    { property: 'og:url', content: url },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: `${SITE.name} — ${SITE.role}` },
    { property: 'og:site_name', content: `${SITE.name} Portfolio` },
    { property: 'og:locale', content: DEFAULTS.locale },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:url', content: url },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: `${SITE.name} — ${SITE.role}` },
    // twitter:creator is intentionally absent — "@karisavoyani" was an unverified
    // placeholder. Add it only once a real handle exists.
  ];

  const link = [{ rel: 'canonical', href: url }];

  // A noindex page (the 404) should not advertise structured data for the whole site.
  const jsonLd = noindex ? [] : [personSchema(description, image), websiteSchema(description)];

  return { title: fullTitle, meta, link, jsonLd };
}

/* ------------------------------------------------------------------ *
 * HTML renderer — used by the Vite plugin at build time only.
 * ------------------------------------------------------------------ */

const escapeAttr = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * `</script>` inside a JSON string would terminate the script element early, so the
 * opening angle bracket is escaped. `<` is still valid JSON and parses identically.
 */
const escapeJsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

/** Render the tag set to a string of HTML for injection into index.html. */
export function renderTagsToHtml(tags, { indent = '    ' } = {}) {
  const lines = [];

  lines.push(`<title data-rh="true">${escapeAttr(tags.title)}</title>`);

  for (const m of tags.meta) {
    const key = m.property ? 'property' : 'name';
    const value = m.property || m.name;
    lines.push(`<meta data-rh="true" ${key}="${escapeAttr(value)}" content="${escapeAttr(m.content)}" />`);
  }

  for (const l of tags.link) {
    lines.push(`<link data-rh="true" rel="${escapeAttr(l.rel)}" href="${escapeAttr(l.href)}" />`);
  }

  for (const schema of tags.jsonLd) {
    lines.push(
      `<script data-rh="true" type="application/ld+json">${escapeJsonLd(schema)}</script>`
    );
  }

  return lines.join(`\n${indent}`);
}
