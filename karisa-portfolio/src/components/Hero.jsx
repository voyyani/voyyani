import React from 'react';
import { motion } from 'framer-motion';
import { useSmoothScroll } from '../hooks/useScrollAnimation';
import { trackCTAClick } from '../utils/analytics';
import ImageWithFallback from './ImageWithFallback';
import { SITE } from '../config/site';

/**
 * Phase 2, "Product-Led" direction.
 *
 * The claim sits in a narrow left rail and a real, live client platform fills the rest
 * of the screen inside a browser frame. The argument is the point: a visitor sees
 * shipped software in the first second rather than reading an assertion about it.
 *
 * Phase 1's content rules still hold — one fixed headline, and every number links to
 * the thing that proves it.
 */
const Hero = () => {
  const scrollToSection = useSmoothScroll();

  const proofPoints = [
    { value: '3s→1.2s', label: 'Page load, Raslipwani', href: '#projects', onClick: () => scrollToSection('projects') },
    { value: '2', label: 'Client platforms, shipped end to end', href: '#projects', onClick: () => scrollToSection('projects') },
    { value: 'B.Eng', label: 'Mechanical Engineering', href: SITE.resume.href },
  ];

  const ease = [0.22, 1, 0.36, 1];

  return (
    <section className="relative min-h-screen border-b border-ink-800 pt-[57px]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:min-h-[calc(100vh-57px)] lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* Left rail — the claim */}
        <div className="flex flex-col justify-between border-ink-800 px-5 py-14 md:px-10 lg:border-r lg:py-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="eyebrow mb-6 text-signal"
            >
              {SITE.location} — B.Eng Mech
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.05 }}
              className="mb-6 text-display-xl font-bold text-ink-50 lg:text-display"
            >
              <span className="sr-only">{SITE.name} — {SITE.location}. </span>
              I build software the way I was trained to build machines.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.12 }}
              className="mb-9 max-w-prose text-base leading-relaxed text-ink-200"
            >
              Mechanical engineer turned full-stack developer. I ship production platforms
              end to end — database schema through deployed frontend — for clients who need
              the thing to still work at 11pm on a slow connection.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.19 }}
              className="flex flex-col gap-3 sm:flex-row lg:flex-col"
            >
              <button
                onClick={() => {
                  trackCTAClick('See what I have shipped', 'projects');
                  scrollToSection('projects');
                }}
                className="btn-signal"
              >
                See what I&apos;ve shipped
                <span aria-hidden="true">→</span>
              </button>
              <button
                onClick={() => {
                  trackCTAClick('Available for hire', 'contact');
                  scrollToSection('contact');
                }}
                className="btn-ghost"
              >
                Available for hire
              </button>
            </motion.div>
          </div>

          {/* Proof strip — each figure links to its evidence */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.3 }}
            className="mt-14 grid grid-cols-3 gap-4 border-t border-ink-800 pt-6"
          >
            {proofPoints.map((point) => (
              <a
                key={point.label}
                href={point.href}
                onClick={point.onClick ? (e) => { e.preventDefault(); point.onClick(); } : undefined}
                className="group block"
              >
                <div className="text-stat font-bold text-ink-50 transition-colors duration-250 ease-signal group-hover:text-signal">
                  {point.value}
                </div>
                <div className="eyebrow mt-1.5 leading-snug">{point.label}</div>
              </a>
            ))}
          </motion.div>
        </div>

        {/* Right — the shipped product, in a browser frame */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease, delay: 0.15 }}
          className="flex flex-col gap-4 border-t border-ink-800 bg-ink-900 px-5 py-10 md:px-10 lg:border-t-0 lg:py-16"
        >
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 bg-signal" aria-hidden="true" />
            <span className="eyebrow text-ink-200">Live — neemafoundationkilifi.org</span>
          </div>

          <figure className="m-0 border border-ink-700 bg-ink-850">
            <div className="flex items-center gap-2 border-b border-ink-700 px-3.5 py-2.5" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-ink-600" />
              <span className="h-2 w-2 rounded-full bg-ink-600" />
              <span className="h-2 w-2 rounded-full bg-ink-600" />
              <span className="ml-3 font-mono text-[10px] text-ink-400">neemafoundationkilifi.org</span>
            </div>
            <ImageWithFallback
              src="/images/projects/neema/home.jpg"
              alt="The Neema Foundation home page, built and maintained by Karisa: a full-bleed hero over a dark red gradient with donate and programmes calls to action"
              width={1600}
              height={1000}
              sizes="(max-width: 1024px) 100vw, 900px"
              priority
            />
            <figcaption className="border-t border-ink-700 px-3.5 py-3 text-sm text-ink-300">
              A non-profit CMS their own staff run — programmes, stories, events and donations,
              with no developer in the loop.
            </figcaption>
          </figure>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
