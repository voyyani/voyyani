import React from 'react';
import { SITE, mailto } from '../config/site';
import { PANELS } from '../config/panels';

/**
 * The selvedge at the foot of the sheet.
 *
 * A kanga's bottom edge is where the maker's mark goes, and that is all this is: who
 * made it, how to reach him, and where the rest of the page is. The previous footer ran
 * three columns of link lists, a duplicate contact block, a second résumé button, and a
 * box headed "Engineering Heritage" containing a sentence about African innovation that
 * matched nothing else on the site and proved nothing. All of it is gone.
 *
 * Every address here comes from src/config/site.js — the one place they are allowed to
 * be stated, because the site once published four different ones and three bounced.
 */

const LINKS = [
  { label: PANELS.work.nav, href: '#projects' },
  { label: PANELS.philosophy.nav, href: '#philosophy' },
  { label: PANELS.about.nav, href: '#about' },
  { label: PANELS.activity.nav, href: '#activity' },
  { label: PANELS.skills.nav, href: '#skills' },
  { label: PANELS.contact.nav, href: '#contact' },
];

const Footer = () => (
  <footer className="px-4 pb-10 sm:px-6 lg:px-10">
    <div className="mx-auto max-w-sheet border-t-2 border-pindo pt-10">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <p className="jina-sm max-w-[16ch]">{SITE.brand}</p>
          <p className="mt-4 max-w-prose text-mark-700">
            {SITE.role} in {SITE.location}. Production platforms built end to end, by one
            person who stays accountable for them.
          </p>

          <a href="#contact" className="btn-pindo mt-7 no-underline">
            Start a project
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <nav className="lg:col-span-3" aria-label="Sections">
          <h2 className="text-label uppercase text-mark-600">On this page</h2>
          <ul className="mt-4 list-none space-y-0 p-0">
            {LINKS.map((link) => (
              <li key={link.href} className="border-b border-cloth-300">
                <a
                  href={link.href}
                  className="block py-2.5 font-medium text-mark-700 no-underline transition-colors duration-250 ease-press hover:text-pindo"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="text-label uppercase text-mark-600">Reach him</h2>
          <ul className="mt-4 list-none space-y-0 p-0">
            <li className="border-b border-cloth-300">
              <a href={mailto('Project enquiry')} className="link block break-all py-2.5 font-medium">
                {SITE.email}
              </a>
            </li>
            <li className="border-b border-cloth-300">
              <a
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="link block py-2.5 font-medium"
              >
                LinkedIn
              </a>
            </li>
            <li className="border-b border-cloth-300">
              <a
                href={SITE.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link block py-2.5 font-medium"
              >
                GitHub
              </a>
            </li>
            <li className="border-b border-cloth-300">
              <a
                href={SITE.resume.href}
                download={SITE.resume.downloadAs}
                className="link block py-2.5 font-medium"
              >
                Résumé (PDF)
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-cloth-300 pt-6">
        <p className="text-sm text-mark-600">
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
        <a href="/privacy-policy" className="link text-sm">
          Privacy policy
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
