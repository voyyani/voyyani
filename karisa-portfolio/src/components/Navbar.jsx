import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE } from '../config/site';

const LINKS = ['About', 'Projects', 'Activity', 'Skills', 'Philosophy', 'Contact'];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <>
      <nav
        className={`fixed z-50 w-full border-b transition-colors duration-250 ease-signal ${
          scrolled ? 'border-ink-800 bg-ink-950/95 backdrop-blur' : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
          {/* A wordmark, not a heading — this was an <h1>, which outranked the hero
              headline for search engines and screen readers. */}
          <a href="#" className="flex items-center gap-2.5" aria-label={`${SITE.brand} — back to top`}>
            <span className="flex h-6 w-6 items-center justify-center bg-signal" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0B0B0C" strokeWidth="2.4">
                <path d="M4 15a8 8 0 0116 0" />
                <path d="M2 15h20" />
              </svg>
            </span>
            <span className="font-semibold tracking-tight text-ink-50">{SITE.name}</span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {LINKS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-ink-200 transition-colors duration-250 ease-signal hover:text-ink-50"
              >
                {item}
              </a>
            ))}
            <a
              href={SITE.resume.href}
              download={SITE.resume.downloadAs}
              className="bg-signal px-4 py-2 text-sm font-semibold text-ink-950 transition-colors duration-250 ease-signal hover:bg-signal-hover"
            >
              Résumé
            </a>
          </div>

          <button
            onClick={toggleMenu}
            className="z-50 p-1 text-ink-50 md:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 right-0 top-[57px] z-40 overflow-hidden border-b border-ink-800 bg-ink-950 md:hidden"
          >
            <div className="flex flex-col px-5 py-2">
              {LINKS.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={toggleMenu}
                  className="border-b border-ink-800 py-4 text-ink-200 transition-colors hover:text-ink-50"
                >
                  {item}
                </a>
              ))}
              <a
                href={SITE.resume.href}
                download={SITE.resume.downloadAs}
                onClick={toggleMenu}
                className="mt-4 mb-2 bg-signal py-3.5 text-center font-semibold text-ink-950"
              >
                Download Résumé
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
