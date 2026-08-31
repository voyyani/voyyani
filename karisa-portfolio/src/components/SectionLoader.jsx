import React from 'react';

/**
 * Placeholder for a lazily-loaded panel.
 *
 * Not a spinner. A spinner says "something is happening"; this says "a panel of this
 * shape is arriving here", which is what stops the page jumping when it does. It is
 * drawn in the sheet's own border language and holds roughly a panel's height.
 */
const SectionLoader = () => (
  <div className="px-4 pb-section sm:px-6 lg:px-10" aria-hidden="true">
    <div className="mx-auto min-h-[24rem] max-w-sheet bg-cloth-100 pindo">
      <div className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
        <div className="border-t-2 border-pindo pt-6 md:pt-8">
          <div className="h-10 w-3/4 animate-pulse bg-cloth-300 sm:h-14" />
          <div className="mt-6 h-5 w-1/2 animate-pulse bg-cloth-200" />
          <div className="mt-8 h-40 w-full animate-pulse bg-cloth-200" />
        </div>
      </div>
    </div>
  </div>
);

export default SectionLoader;
