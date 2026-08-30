import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { SITE } from '../config/site';

/**
 * Real 404 page.
 *
 * `App.jsx` previously answered every unmatched route with
 * `<Navigate to="/" replace />`. That is worse than showing nothing: it laundered any
 * URL — a typo, a stale link, a crawler probing for /wp-admin — into the homepage,
 * served with a 200. Search engines saw unlimited distinct URLs all returning identical
 * content, which is the textbook duplicate-content signal. (docs/AUDIT.md §3.3)
 *
 * A static SPA on Vercel cannot return a real HTTP 404 status — the rewrite has already
 * served index.html with a 200 by the time React runs. `noindex, nofollow` is the
 * correct mitigation: it is the signal search engines actually act on, and it keeps
 * these URLs out of the index regardless of the status code.
 */
const NotFound = () => (
  <>
    <SEO
      title="Page not found"
      description="This page does not exist on voyani.tech."
      url={`${SITE.url}/404`}
      noindex
    />

    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-5 text-center"
    >
      <p className="eyebrow mb-6">Error 404</p>

      <h1 className="mb-5 max-w-[22ch] text-display font-bold text-ink-50">
        That page doesn&rsquo;t exist.
      </h1>

      <p className="mb-10 max-w-prose text-ink-200">
        The link may be out of date, or the address may have a typo in it. Everything on this
        site is reachable from the homepage.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-signal">
          Back to homepage
        </Link>
        <a href={SITE.resume.href} download={SITE.resume.downloadAs} className="btn-ghost">
          Download résumé
        </a>
      </div>
    </main>
  </>
);

export default NotFound;
