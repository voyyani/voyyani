import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled more than 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const totalHeight = documentHeight - windowHeight;
      const progress = (scrollTop / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    // Throttle scroll event for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    toggleVisibility();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 group"
          aria-label="Back to top"
        >
          <div className="relative">
            {/* Progress circle */}
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              {/* Background circle */}
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="rgba(0, 87, 146, 0.2)"
                strokeWidth="3"
              />
              {/* Progress circle */}
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="#61DAFB"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>

            {/* Button content */}
            <div
              className="absolute inset-0 flex items-center justify-center 
              bg-gradient-to-br from-[#005792] to-[#003056] rounded-full
              shadow-lg group-hover:shadow-xl group-hover:shadow-[#61DAFB]/20
              transition-all duration-200 group-hover:scale-110"
            >
              <svg
                className="w-6 h-6 text-[#61DAFB] group-hover:translate-y-[-2px] transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
