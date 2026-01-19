import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for scroll-based animations with Intersection Observer
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Visibility threshold (0-1) to trigger animation
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.triggerOnce - Whether to trigger animation only once
 * @param {boolean} options.enableScrollDirection - Track scroll direction
 * @returns {Object} - { ref, isVisible, scrollDirection, hasAnimated }
 */
export const useScrollAnimation = ({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  enableScrollDirection = false,
} = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [scrollDirection, setScrollDirection] = useState(null);
  const ref = useRef(null);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    // Intersection Observer for visibility detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (isIntersecting) {
          setIsVisible(true);
          if (!hasAnimated) {
            setHasAnimated(true);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    // Scroll direction tracking
    let scrollHandler = null;
    if (enableScrollDirection) {
      scrollHandler = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > prevScrollY.current) {
          setScrollDirection('down');
        } else if (currentScrollY < prevScrollY.current) {
          setScrollDirection('up');
        }
        
        prevScrollY.current = currentScrollY;
      };

      // Throttle scroll event for performance
      let ticking = false;
      const throttledScrollHandler = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            scrollHandler();
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', throttledScrollHandler, { passive: true });
      
      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', throttledScrollHandler);
      };
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasAnimated, enableScrollDirection]);

  return {
    ref,
    isVisible,
    scrollDirection,
    hasAnimated,
  };
};

/**
 * Hook to track scroll progress as a percentage (0-100)
 * @returns {number} - Scroll progress percentage
 */
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const calculateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      const totalHeight = documentHeight - windowHeight;
      const progress = (scrollTop / totalHeight) * 100;
      
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    // Throttle for performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    calculateScrollProgress(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollProgress;
};

/**
 * Hook to enable smooth scrolling to sections
 * @returns {Function} - scrollToSection function
 */
export const useSmoothScroll = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for fixed navbar
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return scrollToSection;
};

export default useScrollAnimation;
