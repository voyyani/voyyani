import React from 'react';
import { useSmoothScroll } from '../hooks/useScrollAnimation';
import { trackCTAClick } from '../utils/analytics';
import ImageWithFallback from './ImageWithFallback';
import { Band } from './Band';
import { SITE } from '../config/site';
import { PANELS } from '../config/panels';

/**
 * The lead kanga.
 *
 * The heaviest pindo on the sheet frames one screen-filling object: a client platform
 * that is running right now. Beneath the seam, the jina at true display scale, and
 * under it the measured band — every figure a link to the artifact that proves it.
 *
 * The argument is structural, not asserted. On a phone the mji comes first, so a
 * visitor sees shipped software inside the first second; on a desktop the claim and the
 * evidence land in the same viewport, either side of the frame.
 *
 * The h1 is the jina. Phase 1's content rules still hold: one fixed headline, no
 * rotating role badge, and no number that this page cannot substantiate.
 */
const Hero = () => {
  const scrollToSection = useSmoothScroll();

  const proofPoints = [
    {
      value: '3s → 1.2s',
      label: 'Page load, Raslipwani',
      href: '#projects',
      onClick: (e) => {
        e.preventDefault();
        scrollToSection('projects');
      },
    },
    {
      value: '2',
      label: 'Client platforms, shipped end to end',
      href: '#projects',
      onClick: (e) => {
        e.preventDefault();
        scrollToSection('projects');
      },
    },
    { value: 'B.Eng', label: 'Mechanical Engineering', href: SITE.resume.href },
  ];

  return (
    <section className="px-4 pb-section pt-[72px] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-sheet bg-cloth-100 pindo-full">
        <div className="grid lg:min-h-[calc(100svh-8rem)] lg:grid-cols-2">
          {/* The mji — the field. On a phone this is the first thing on the page. */}
          <figure className="order-1 m-0 flex flex-col justify-center gap-4 border-b border-cloth-300 bg-cloth-200 px-4 py-8 sm:px-8 lg:order-2 lg:border-b-0 lg:border-l lg:px-10 lg:py-12">
            <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span className="mark-state" data-state="live">
                Live — neemafoundationkilifi.org
              </span>
              <span className="text-label uppercase text-mark-500">Built and maintained by Karisa</span>
            </figcaption>

            <ImageWithFallback
              src="/images/projects/neema/home.jpg"
              alt="The Neema Foundation home page, built and maintained by Karisa: a full-bleed hero over a dark red gradient with donate and programmes calls to action"
              width={1600}
              height={1000}
              sizes="(max-width: 1024px) 100vw, 760px"
              priority
              className="border border-mark-900"
            />

            <p className="max-w-prose text-sm leading-relaxed text-mark-600">
              A non-profit CMS their own staff run — programmes, stories, events and
              donations, with no developer in the loop.
            </p>
          </figure>

          {/* The seam, the jina, the band. */}
          <div className="order-2 flex flex-col justify-center px-4 py-10 sm:px-8 lg:order-1 lg:px-10 lg:py-14">
            <div className="hem print-frame">
              <h1 className="jina-lead print-jina">
                <span className="sr-only">
                  {SITE.name} — {SITE.location}.{' '}
                </span>
                {PANELS.hero.jina}
              </h1>

              <div className="print-body">
                <p className="mt-7 max-w-prose text-lead text-mark-700">
                  Mechanical engineer turned full-stack developer, in {SITE.location}. I build
                  production platforms end to end — database schema through deployed frontend —
                  for organisations that need the thing to still work at 11pm on a slow
                  connection.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      trackCTAClick('See what I have shipped', 'projects');
                      scrollToSection('projects');
                    }}
                    className="btn-pindo"
                  >
                    See what I&apos;ve shipped
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      trackCTAClick('Available for hire', 'contact');
                      scrollToSection('contact');
                    }}
                    className="btn-outline"
                  >
                    Available for hire
                  </button>
                </div>
              </div>

              <Band items={proofPoints} columns={3} className="mt-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
