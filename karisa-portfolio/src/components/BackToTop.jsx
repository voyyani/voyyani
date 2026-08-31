import React, { useState, useEffect } from 'react';

/**
 * Back to the top of the sheet.
 *
 * The previous version wrapped this in a 56px SVG ring that redrew the scroll
 * percentage already shown by ScrollProgressIndicator — two indicators for one fact,
 * and a progress ring standing in for content. What is left is a square control in the
 * page's own border language, which appears once the reader is past the lead panel.
 */
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => setIsVisible(window.scrollY > 600);

    const handleScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={isVisible ? undefined : 'true'}
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center border border-mark-900 bg-cloth-50 text-mark-900 transition-all duration-400 ease-press hover:bg-pindo hover:text-cloth-50 ${
        isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

export default BackToTop;
