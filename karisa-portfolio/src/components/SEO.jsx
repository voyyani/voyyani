import React from 'react';
import { Helmet } from 'react-helmet-async';
import { buildSeoTags } from '../config/seo';

/**
 * Runtime half of the SEO setup.
 *
 * The tags themselves are defined once in `src/config/seo.js`. The Vite plugin in
 * vite.config.js renders that same definition into index.html at build time, so
 * crawlers and social scrapers get it with no JavaScript; this component renders it
 * again through Helmet so per-route overrides work (Phase 4's /writing/* pages will
 * pass their own title, description and url).
 *
 * The static tags carry `data-rh="true"`, which is the attribute react-helmet-async
 * uses to mark tags it owns. On mount, Helmet removes every `[data-rh="true"]` tag and
 * inserts its own — so the two sets replace rather than duplicate. See the header
 * comment in src/config/seo.js for the full reasoning.
 *
 * This component no longer hardcodes any copy: previously the same title, description
 * and schema were spelled out here AND (post-fix) would have been spelled out in
 * index.html, which is exactly the duplication that goes stale.
 */
const SEO = ({ title, description, keywords, image, url, type, noindex }) => {
  const tags = buildSeoTags({ title, description, keywords, image, url, type, noindex });

  // Search-engine verification. Both are optional; note that per docs/AUDIT.md §3.4
  // neither is currently set in Vercel, and DNS TXT verification is the more reliable
  // route because it does not depend on the page rendering at all.
  const googleVerification = import.meta.env.VITE_GOOGLE_VERIFICATION || '';
  const bingVerification = import.meta.env.VITE_BING_VERIFICATION || '';

  return (
    <Helmet>
      <title>{tags.title}</title>

      {tags.meta.map((m) =>
        m.property ? (
          <meta key={m.property} property={m.property} content={m.content} />
        ) : (
          <meta key={m.name} name={m.name} content={m.content} />
        )
      )}

      {tags.link.map((l) => (
        <link key={l.rel} rel={l.rel} href={l.href} />
      ))}

      {googleVerification && <meta name="google-site-verification" content={googleVerification} />}
      {bingVerification && <meta name="msvalidate.01" content={bingVerification} />}

      <meta name="language" content="English" />
      <meta name="theme-color" content="#0B0B0C" />
      <meta name="format-detection" content="telephone=no" />

      {tags.jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
