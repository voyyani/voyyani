import React, { useState } from 'react';
import Panel from './Panel';
import { PanelHead } from './Band';
import { trackEvent } from '../utils/analytics';
import { PANELS } from '../config/panels';

/**
 * A claim about a tool is only worth making if the reader can check it against the work
 * shown above, so every entry carries the project it shipped in rather than a
 * self-awarded percentage. Every `where` value points at a project in the work panel,
 * or at this site, or at the degree in the about panel.
 *
 * The group icons are gone. They were emoji — rendered differently on every platform,
 * unable to take the accent colour, and a template tell. The group names do the work.
 */

const SKILL_GROUPS = {
  Frontend: {
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
  Engineering: {
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
  const current = SKILL_GROUPS[activeGroup];

  return (
    <Panel id="skills" labelledBy="skills-heading">
      {(printed) => (
        <>
          <PanelHead
            id="skills-heading"
            heading={PANELS.skills.heading}
            jina={PANELS.skills.jina}
            lead={PANELS.skills.lead}
            printed={printed}
          />

          <div className="mt-9 flex flex-wrap gap-2" role="tablist" aria-label="Filter toolkit by area">
            {Object.keys(SKILL_GROUPS).map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => {
                  setActiveGroup(group);
                  trackEvent('skills_category_switch', { category: group });
                }}
                role="tab"
                aria-selected={activeGroup === group}
                className={`border px-4 py-2.5 text-sm font-semibold transition-colors duration-250 ease-press ${
                  activeGroup === group
                    ? 'border-pindo bg-pindo text-cloth-50'
                    : 'border-cloth-400 text-mark-700 hover:border-pindo hover:text-pindo'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="mt-6 border border-cloth-300 bg-cloth-50 p-5 md:p-7">
            <p className="text-mark-600">{current.description}</p>

            <ul className="mt-6 grid list-none gap-px border-t border-cloth-300 bg-cloth-300 p-0 pt-px sm:grid-cols-2">
              {current.items.map((skill) => (
                <li
                  key={skill.name}
                  className="flex items-baseline justify-between gap-4 bg-cloth-50 px-4 py-3.5"
                >
                  <span className="font-semibold text-mark-900">{skill.name}</span>
                  <span className="max-w-[55%] shrink-0 text-right text-label uppercase leading-snug text-pindo">
                    {skill.where}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </Panel>
  );
};

export default Skills;
