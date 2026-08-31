import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SITE } from '../config/site';
import { PANELS } from '../config/panels';

/**
 * The selvedge — the finished edge a kanga is held by.
 *
 * Ordered for the primary audience recorded in PRODUCT.md: a prospective client reads
 * the work first and the biography later, so Work leads and About sits mid-list. The
 * section ids are unchanged; only the labels and their order moved.
 *
 * The wordmark is a link, not a heading. It was an <h1> once, which outranked the hero
 * headline for search engines and screen readers.
 */
const LINKS = [
  { label: PANELS.work.nav, href: '#projects' },
  { label: PANELS.philosophy.nav, href: '#philosophy' },
  { label: PANELS.about.nav, href: '#about' },
  { label: PANELS.activity.nav, href: '#activity' },
  { label: PANELS.skills.nav, href: '#skills' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-colors duration-250 ease-press ${
          scrolled ? 'border-b border-pindo bg-cloth-100/95 backdrop-blur-sm' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-sheet items-center justify-between gap-6 px-4 py-3.5 sm:px-6 lg:px-10">
          <a
            href="#"
            className="group flex items-center gap-3 no-underline"
            aria-label={`${SITE.brand} — back to top`}
          >
            {/* The maker's mark: the pindo's own lozenge, drawn once at 20px. */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="shrink-0 text-pindo"
            >
              <path d="M10 1 L19 10 L10 19 L1 10 Z" fill="currentColor" />
              <path d="M10 6 L14 10 L10 14 L6 10 Z" fill="#F2EEE5" />
            </svg>
            <span className="font-display text-[1.0625rem] font-bold tracking-tight text-mark-900">
              {SITE.brand}
            </span>
          </a>

          <div className="hidden items-center gap-7 lg:flex">
            {LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-mark-700 no-underline transition-colors duration-250 ease-press hover:text-pindo"
              >
                {item.label}
              </a>
            ))}
            <a
              href={SITE.resume.href}
              download={SITE.resume.downloadAs}
              className="text-sm font-medium text-mark-700 no-underline transition-colors duration-250 ease-press hover:text-pindo"
            >
              Résumé
            </a>
            <a href="#contact" className="btn-pindo px-5 py-2.5 text-sm no-underline">
              Start a project
            </a>
          </div>

          <button
            onClick={toggleMenu}
            className="-mr-1 p-2 text-mark-900 lg:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path strokeLinecap="round" d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="site-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 right-0 top-[57px] z-40 overflow-hidden border-b-2 border-pindo bg-cloth-100 lg:hidden"
          >
            <div className="flex flex-col px-4 pb-5 pt-1 sm:px-6">
              {LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={toggleMenu}
                  className="border-b border-cloth-300 py-4 font-display text-lg font-semibold text-mark-900 no-underline"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={SITE.resume.href}
                download={SITE.resume.downloadAs}
                onClick={toggleMenu}
                className="border-b border-cloth-300 py-4 font-display text-lg font-semibold text-mark-900 no-underline"
              >
                Résumé
              </a>
              <a href="#contact" onClick={toggleMenu} className="btn-pindo mt-5 w-full no-underline">
                Start a project
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
