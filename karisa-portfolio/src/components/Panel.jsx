import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export { PanelHead, Band } from './Band';

/**
 * The panel — one kanga.
 *
 * A printed border (the pindo) around a plain field (the mji), with the seam and the
 * jina supplied by <PanelHead>. Motion is one orchestration, declared once in
 * index.css: the frame settles, the jina prints left to right, the field follows.
 * Sections do not author their own entrances.
 *
 * `lead` wears the heavy pindo. Only the hero does.
 */
const Panel = ({ id, labelledBy, lead = false, className = '', children, ...rest }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.12, triggerOnce: true });

  return (
    <section
      id={id}
      ref={ref}
      aria-labelledby={labelledBy}
      data-printed={isVisible ? 'true' : 'false'}
      className={`px-4 pb-section sm:px-6 lg:px-10 ${className}`}
      {...rest}
    >
      <div className={`mx-auto max-w-sheet bg-cloth-100 ${lead ? 'pindo-full' : 'pindo'}`}>
        <div className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          {typeof children === 'function' ? children(isVisible) : children}
        </div>
      </div>
    </section>
  );
};

export default Panel;
