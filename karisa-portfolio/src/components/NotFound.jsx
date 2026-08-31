import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { SITE } from '../config/site';

/**
 * Real 404 page.
 *
 * `App.jsx` previously answered every unmatched route with `<Navigate to="/" replace />`.
 * That is worse than showing nothing: it laundered any URL — a typo, a stale link, a
 * crawler probing for /wp-admin — into the homepage, served with a 200. Search engines
 * saw unlimited distinct URLs all returning identical content, which is the textbook
 * duplicate-content signal. (docs/AUDIT.md §3.3)
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

    <main id="main" className="flex min-h-screen items-center px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-sheet bg-cloth-100 pindo">
        <div className="px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
          <div className="border-t-2 border-pindo pt-6 md:pt-8">
            <h1 className="jina max-w-[16ch]">That page doesn&rsquo;t exist.</h1>

            <p className="mt-7 max-w-prose text-lead text-mark-700">
              The link may be out of date, or the address may have a typo in it. Everything on
              this site is reachable from the homepage.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/" className="btn-pindo no-underline">
                Back to homepage
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href={SITE.resume.href}
                download={SITE.resume.downloadAs}
                className="btn-outline no-underline"
              >
                Download résumé
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </>
);

export default NotFound;
