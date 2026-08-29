import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { trackEvent } from '../utils/analytics';

/**
 * Phase 1 (docs/roadmapupdated.md §6, Phase 3 option (a)).
 *
 * This section used to assign every tool a precise percentage — React 95%, Vite 85%,
 * AWS 75% — with an averaged "score" ring on top. There was no methodology behind any
 * of those numbers, they can't be falsified, and to an experienced reviewer a
 * self-awarded 95% reads as noise rather than evidence.
 *
 * They're replaced with the one thing about a tool that is checkable from this page:
 * where it was actually used. Every `where` value below points at a project in the
 * Projects section, or at this site, or at the degree in the About section.
 */

const SKILL_GROUPS = {
  'Frontend': {
    icon: '⚛️',
    description: 'What I reach for to build the interface.',
    items: [
      { name: 'React', where: 'Both client platforms + this site' },
      { name: 'TypeScript', where: 'Neema Foundation' },
      { name: 'Vite', where: 'Both client platforms + this site' },
      { name: 'Tailwind CSS', where: 'Both client platforms + this site' },
      { name: 'React Query', where: 'Both client platforms' },
      { name: 'Framer Motion', where: 'Both client platforms + this site' },
      { name: 'React Hook Form + Zod', where: 'Neema Foundation + this site' },
      { name: 'TipTap', where: "Neema Foundation's CMS editor" },
    ],
  },
  'Backend & Data': {
    icon: '🗄️',
    description: 'Where the data lives and who is allowed to touch it.',
    items: [
      { name: 'PostgreSQL', where: 'Both client platforms' },
      { name: 'Supabase', where: 'Both client platforms + this site' },
      { name: 'Row-Level Security', where: 'Neema Foundation, 5-tier roles' },
      { name: 'Supabase Auth', where: 'Neema Foundation' },
      { name: 'Clerk Auth', where: 'Raslipwani Properties' },
      { name: 'Edge Functions (Deno)', where: "This site's contact pipeline" },
      { name: 'Node.js', where: 'Tooling and build scripts' },
    ],
  },
  'Testing & Tooling': {
    icon: '🧪',
    description: 'How I find out whether it actually works.',
    items: [
      { name: 'Vitest', where: 'Raslipwani + this site' },
      { name: 'React Testing Library', where: 'Raslipwani + this site' },
      { name: 'Playwright', where: 'Screenshot capture for this site' },
      { name: 'ESLint', where: 'Every project' },
      { name: 'Sentry', where: 'This site' },
      { name: 'Vercel', where: 'Both client platforms' },
    ],
  },
  'Engineering': {
    icon: '📐',
    description: 'From the B.Eng, and still how I think about a system.',
    items: [
      { name: 'MATLAB', where: 'Computational methods, thesis work' },
      { name: 'CATIA', where: '3D modelling coursework' },
      { name: 'AutoCAD', where: 'Technical drawing' },
      { name: 'Finite Element Analysis', where: 'Structural analysis coursework' },
    ],
  },
};

const Skills = () => {
  const [activeGroup, setActiveGroup] = useState('Frontend');
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  const current = SKILL_GROUPS[activeGroup];

  return (
    <motion.section
      id="skills"
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } },
      }}
      className="relative border-b border-ink-800 px-5 py-section md:px-10"
      aria-labelledby="skills-heading"
    >
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mb-10"
        >
          <div className="eyebrow mb-5 text-signal">04 — Toolkit</div>

          <h2 id="skills-heading" className="mb-5 max-w-[20ch] text-display font-bold text-ink-50">
            What I use, and where I used it
          </h2>

          <p className="max-w-prose text-lg leading-relaxed text-ink-300">
            No self-assigned percentages — every tool here is listed with the project it
            shipped in, so you can check the claim against the work above.
          </p>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="mb-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter toolkit by area"
        >
          {Object.keys(SKILL_GROUPS).map((group) => (
            <motion.button
              key={group}
              onClick={() => {
                setActiveGroup(group);
                trackEvent('skills_category_switch', { category: group });
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              role="tab"
              aria-selected={activeGroup === group}
              className={`border px-4 py-2.5 text-sm font-medium transition-colors duration-250 ease-signal ${
                activeGroup === group
                  ? 'border-signal bg-signal text-ink-950'
                  : 'border-ink-700 text-ink-200 hover:border-ink-500 hover:text-ink-50'
              }`}
            >
              {group}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="panel p-6 md:p-8"
          >
            <p className="mb-7 text-ink-300">{current.description}</p>

            <ul className="grid gap-px bg-ink-800 sm:grid-cols-2">
              {current.items.map((skill, index) => (
                <motion.li
                  key={skill.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="flex items-start justify-between gap-4 bg-ink-900 p-4"
                >
                  <span className="font-semibold text-ink-50">{skill.name}</span>
                  <span className="max-w-[55%] shrink-0 text-right font-mono text-[11px] leading-snug text-signal">
                    {skill.where}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default Skills;
