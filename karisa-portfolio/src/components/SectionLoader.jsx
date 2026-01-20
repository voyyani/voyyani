import React from 'react';

/**
 * Loading spinner for lazy-loaded sections
 * Matches portfolio theme and provides smooth loading experience
 */
const SectionLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-[#005792]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-[#61DAFB] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Loading text with fade animation */}
        <p className="text-gray-400 text-sm font-mono animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default SectionLoader;
