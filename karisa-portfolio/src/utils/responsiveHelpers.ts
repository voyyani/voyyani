import { useState, useEffect, useContext, createContext, ReactNode } from 'react';

/**
 * Breakpoint definitions in pixels
 * Matches Tailwind configuration exactly
 */
export const BREAKPOINTS = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Type for responsive values
 * Example: { xs: 16, sm: 20, lg: 24 }
 */
export type ResponsiveValue<T> = {
  [key in Breakpoint]?: T;
};

/**
 * Media query context type
 */
interface MediaQueryContextType {
  currentBreakpoint: Breakpoint;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

/**
 * Create context for breakpoint tracking
 */
const MediaQueryContext = createContext<MediaQueryContextType | undefined>(undefined);

/**
 * Get current breakpoint based on window width
 */
function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Hook to use responsive breakpoint context
 * Must be inside MediaQueryProvider
 */
export function useResponsive() {
  const context = useContext(MediaQueryContext);
  if (!context) {
    throw new Error('useResponsive must be used within MediaQueryProvider');
  }
  return context;
}

/**
 * Hook to detect if a specific breakpoint is active or larger
 * @param breakpoint - The minimum breakpoint to check
 * @example: useResponsiveBreakpoint('lg') returns true for lg, xl, 2xl
 */
export function useResponsiveBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Hook to get responsive value based on current breakpoint
 * @param values - Object with breakpoint keys and corresponding values
 * @example: useResponsiveValue({ xs: 8, md: 16, lg: 24 })
 */
export function useResponsiveValue<T>(values: ResponsiveValue<T>): T | undefined {
  const { currentBreakpoint } = useResponsive();

  // Get the largest breakpoint value that is <= current breakpoint
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpoints.indexOf(currentBreakpoint);

  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  return undefined;
}

/**
 * Simple helper function to check if screen is mobile
 * Note: For reactive updates, use useResponsive().isMobile instead
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Simple helper function to check if screen is tablet
 * Ranges from md to lg
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg;
}

/**
 * Simple helper function to check if screen is desktop
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= BREAKPOINTS.lg;
}

/**
 * Provider component to wrap application with responsive context
 */
export function MediaQueryProvider({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return BREAKPOINTS.lg;
    return window.innerWidth;
  });

  useEffect(() => {
    // Set initial width after mount (avoids hydration mismatch)
    setWidth(window.innerWidth);

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const currentBreakpoint = getCurrentBreakpoint(width);
  const breakpointIndex = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].indexOf(currentBreakpoint);

  const value: MediaQueryContextType = {
    currentBreakpoint,
    isXs: breakpointIndex >= 0,
    isSm: breakpointIndex >= 1,
    isMd: breakpointIndex >= 2,
    isLg: breakpointIndex >= 3,
    isXl: breakpointIndex >= 4,
    is2xl: breakpointIndex >= 5,
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    width,
  };

  return (
    React.createElement(MediaQueryContext.Provider, { value },
      children
    )
  );
}

/**
 * Get media query string for a specific breakpoint
 * @example: getMediaQuery('lg') returns '(min-width: 1024px)'
 */
export function getMediaQuery(breakpoint: Breakpoint): string {
  return `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
}

/**
 * Match media and return boolean (useful for SSR-safe checks)
 */
export function matchesBreakpoint(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(getMediaQuery(breakpoint)).matches;
}

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled reduced motion preference
 * @example: const prefersReducedMotion = usePrefersReducedMotion();
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Use addEventListener for better compatibility
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Get transition config respecting prefers-reduced-motion
 * Returns motion config that disables animations if user prefers reduced motion
 * @param normalConfig - Animation config for normal motion preference
 * @param reduceConfig - Animation config for reduced motion preference (default: instant)
 */
export function getMotionConfig(normalConfig: any, reduceConfig: any = { duration: 0 }): any {
  if (typeof window === 'undefined') return normalConfig;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion ? reduceConfig : normalConfig;
}
