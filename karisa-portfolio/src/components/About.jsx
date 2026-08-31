import React from 'react';
import Panel from './Panel';
import { PanelHead } from './Band';
import ImageWithFallback from './ImageWithFallback';
import { SITE } from '../config/site';
import { PANELS } from '../config/panels';

/**
 * Every biographical detail below traces to the résumé. Nothing is invented.
 *
 * The portrait is a plate in the field, framed the way the hero's platform is framed:
 * one hairline, no rounding, no vignette. Under it, the same caption strip the work
 * panels use, so a person and a product are presented in the same grammar — which is
 * the argument the page is making about who does the work.
 */
const About = () => (
  <Panel id="about" labelledBy="about-heading">
    {(printed) => (
      <>
        <PanelHead
          id="about-heading"
          heading={PANELS.about.heading}
          jina={PANELS.about.jina}
          printed={printed}
        />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-12 lg:gap-14">
          <figure className="m-0 lg:col-span-4">
            <ImageWithFallback
              src={SITE.headshot.portrait}
              alt={SITE.headshot.alt}
              width={1024}
              height={1280}
              sizes="(max-width: 1024px) 100vw, 380px"
              className="border border-mark-900"
            />
            <figcaption className="flex items-baseline justify-between gap-4 border-x border-b border-cloth-300 bg-cloth-200 px-4 py-3">
              <span className="text-label uppercase text-mark-600">Based in</span>
              <span className="font-semibold text-mark-900">{SITE.location}</span>
            </figcaption>
          </figure>

          <div className="space-y-6 lg:col-span-8">
            <p className="max-w-prose text-lead text-mark-700">
              I trained as a mechanical engineer at Shenyang Agricultural University, where my
              thesis was on optimising mechanical systems using computational methods. Most of
              that degree came down to one question asked in different ways:{' '}
              <strong className="font-semibold text-mark-900">
                will this hold under load, and how do you know before you build it?
              </strong>
            </p>

            <p className="max-w-prose text-lead text-mark-700">
              I started writing code to answer that faster — MATLAB for analysis, CATIA for
              modelling, then the web. Since 2022 I&apos;ve built production platforms end to end
              for clients: database schema, authentication and permissions, the API layer, the
              frontend, and the deploy pipeline. Two of them are running today and are the two
              case studies on this page.
            </p>

            <p className="max-w-prose text-lead text-mark-700">
              Engineering leaves you with one habit above all: you design to a tolerance, then
              you verify. It&apos;s why I&apos;d rather cut a feature than ship one I can&apos;t
              measure, why &ldquo;it feels fast&rdquo; isn&apos;t a number, and why the
              permission checks on this site&apos;s client work live in the database rather than
              in a hidden button.
            </p>

            {/* The one pull-quote on the sheet. Set against the recessed ground rather
                than behind a coloured bar — the accent stays spent on evidence. */}
            <blockquote className="m-0 border border-mark-900 bg-cloth-200 px-6 py-6">
              <p className="max-w-prose font-display text-title font-semibold leading-snug text-mark-900">
                I take on client builds through {SITE.brand.replace('.tech', '')}, and I&apos;m
                open to a full-time role with a team that works this way. Either conversation is
                welcome.
              </p>
            </blockquote>

            <div className="flex flex-wrap gap-3 pt-1">
              <a href="#contact" className="btn-pindo no-underline">
                Start a project
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href={SITE.resume.href}
                download={SITE.resume.downloadAs}
                className="btn-outline no-underline"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 4v12M7 12l5 5 5-5M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download résumé
              </a>
            </div>
          </div>
        </div>
      </>
    )}
  </Panel>
);

export default About;
