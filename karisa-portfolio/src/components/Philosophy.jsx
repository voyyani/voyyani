import React from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

/**
 * Phase 1 (docs/roadmapupdated.md task 5): trimmed to complement About rather than
 * repeat it.
 *
 * What was removed and why:
 *  - Four invented metrics presented as "Performance Target" — "99.9% Accuracy",
 *    "Zero Downtime", "-40% Load Time", "100% Coverage". None were measured; none
 *    corresponded to anything on the site. Exactly the kind of unfalsifiable number
 *    Phase 1 exists to delete.
 *  - A duplicated full-size right-hand panel that restated whichever card was active.
 *  - A closing block quote that said the same thing as the About section, at length.
 *
 * What's left is the one genuinely distinctive idea here: four engineering habits, each
 * tied to a specific decision visible in the case studies above.
 */
const Philosophy = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15, triggerOnce: true });

  // Inline stroke icons on a 24px grid rather than emoji: emoji render differently on
  // every platform, can't take the accent colour, and are a template tell.
  const principles = [
    {
      icon: (
        <>
          <path d="M3 20h18" /><path d="M6 20V9l6-5 6 5v11" /><path d="M9 20v-5h6v5" />
        </>
      ),
      title: 'Design to a tolerance',
      body:
        'A spec that says "should be fast" cannot be checked. One that says "under 1.5s on a 3G connection" can. Raslipwani had a number attached to it before any of the optimisation work started.',
    },
    {
      icon: (
        <>
          <rect x="4" y="4" width="16" height="16" rx="1" /><path d="M9 12h6" /><path d="M12 9v6" />
        </>
      ),
      title: 'Put the constraint in the material',
      body:
        "A safety interlock belongs in the mechanism, not the operating manual. Neema's permissions are enforced by PostgreSQL Row-Level Security, so hiding a button in the UI isn't what's protecting the data.",
    },
    {
      icon: (
        <>
          <path d="M12 4v16" /><path d="M5 8h14" /><path d="M5 8l-2 6h4l-2-6z" /><path d="M19 8l-2 6h4l-2-6z" />
        </>
      ),
      title: 'Load-test before you trust it',
      body:
        'The first version of a listings page is fine at 40 rows and painful at 400. Assume the second case and design the query for it, rather than discovering the limit in production.',
    },
    {
      icon: (
        <>
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-4.3-4.3" /><path d="M8 11h6" />
        </>
      ),
      title: 'Measure, then claim',
      body:
        "If I can't point at where a number came from, it doesn't go on the page. That rule removed several figures from this site — including some that flattered me.",
    },
  ];

  return (
    <motion.section
      id="philosophy"
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
      }}
      className="relative border-b border-ink-800 px-5 py-section md:px-10"
      aria-labelledby="philosophy-heading"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mb-10"
        >
          <div className="eyebrow mb-5 text-signal">05 — How I work</div>

          <h2 id="philosophy-heading" className="mb-5 max-w-[20ch] text-display font-bold text-ink-50">
            Four habits that came from the workshop
          </h2>

          <p className="max-w-prose text-lg leading-relaxed text-ink-300">
            Each of these shows up in a specific decision in the work above — not as a
            metaphor, as the reason something is built the way it is.
          </p>
        </motion.div>

        <div className="grid gap-px bg-ink-800 md:grid-cols-2">
          {principles.map((principle, index) => (
            <motion.article
              key={principle.title}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ delay: index * 0.08 }}
              className="bg-ink-900 p-6 transition-colors duration-250 ease-signal hover:bg-ink-850"
            >
              <div className="flex items-start gap-4">
                <svg
                  className="h-6 w-6 shrink-0 text-signal"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {principle.icon}
                </svg>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-ink-50">{principle.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-200">{principle.body}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Philosophy;
