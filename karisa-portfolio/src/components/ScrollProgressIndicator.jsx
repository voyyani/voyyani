import React from 'react';
import { useScrollProgress } from '../hooks/useScrollAnimation';

/**
 * The selvedge thread: one indigo line across the top edge, filling as the sheet is
 * read. It is the only progress indicator on the site — BackToTop used to draw a second
 * one as a ring around itself, which measured the same thing twice.
 */
const ScrollProgressIndicator = () => {
  const scrollProgress = useScrollProgress();

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[3px] origin-left bg-pindo transition-transform duration-150 ease-out"
      style={{ transform: `scaleX(${scrollProgress / 100})` }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgressIndicator;
