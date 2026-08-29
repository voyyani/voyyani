import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import ImageWithFallback from './ImageWithFallback';
import { SITE } from '../config/site';

/**
 * New in Phase 1 (docs/roadmapupdated.md).
 *
 * The site previously had no About section at all — `src/sections/AboutSection.jsx`
 * was scaffolded as a 0-byte file and never built, so nothing on the page said who
 * Karisa is or why an engineer-turned-developer is worth hiring. The rotating role
 * badge in the hero was standing in for a story it had no room to tell.
 *
 * Every biographical detail below traces to RESUME.md. Nothing is invented.
 */
const About = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15, triggerOnce: true });

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.12 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      id="about"
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={container}
      className="relative border-b border-ink-800 px-5 py-section md:px-10"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div variants={item} className="mb-12">
          <div className="eyebrow mb-5 text-signal">01 — About</div>
          <h2 id="about-heading" className="max-w-[18ch] text-display font-bold text-ink-50">
            From load calculations to load balancing
          </h2>
        </motion.div>

        <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-16">
          {/* Portrait */}
          <motion.div variants={item} className="lg:col-span-2">
            <div className="relative">
              <ImageWithFallback
                src={SITE.headshot.portrait}
                alt={SITE.headshot.alt}
                width={1024}
                height={1280}
                sizes="(max-width: 1024px) 100vw, 420px"
                priority
                className="border border-ink-700"
              />
              <div className="hidden border border-t-0 border-ink-700 bg-ink-900 px-4 py-3 sm:block">
                <p className="eyebrow">Based in</p>
                <p className="mt-1 font-semibold text-ink-50">{SITE.location}</p>
              </div>
            </div>
          </motion.div>

          {/* Story */}
          <motion.div variants={item} className="lg:col-span-3 space-y-6">
            <p className="max-w-prose text-lg leading-relaxed text-ink-200">
              I trained as a mechanical engineer at Shenyang Agricultural University, where my
              thesis was on optimising mechanical systems using computational methods. Most of
              that degree came down to one question asked in different ways:{' '}
              <span className="font-medium text-ink-50">
                will this hold under load, and how do you know before you build it?
              </span>
            </p>

            <p className="max-w-prose text-lg leading-relaxed text-ink-200">
              I started writing code to answer that faster — MATLAB for analysis, CATIA for
              modelling, then the web. Since 2022 I&apos;ve built production platforms end to end
              for clients: database schema, authentication and permissions, the API layer, the
              frontend, and the deploy pipeline. Two of them are running today and are the two
              case studies on this page.
            </p>

            <p className="max-w-prose text-lg leading-relaxed text-ink-200">
              Engineering leaves you with one habit above all: you design to a tolerance, then
              you verify. It&apos;s why I&apos;d rather cut a feature than ship one I can&apos;t
              measure, why &ldquo;it feels fast&rdquo; isn&apos;t a number, and why the
              permission checks on this site&apos;s client work live in the database rather than
              in a hidden button.
            </p>

            <div className="border-l-2 border-signal bg-ink-900 p-5">
              <p className="leading-relaxed text-ink-200">
                I take on client builds through{' '}
                <span className="font-semibold text-signal">Voyani</span>, and I&apos;m open
                to a full-time role with a team that works this way. Either conversation is
                welcome.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={SITE.resume.href}
                download={SITE.resume.downloadAs}
                className="btn-signal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Resume
              </a>
              <a
                href={SITE.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default About;
