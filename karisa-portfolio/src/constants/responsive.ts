/**
 * Responsive Class Patterns
 * Centralized responsive Tailwind class patterns for consistent UI scaling
 * All patterns include mobile-first approach with progressive enhancement
 */

/**
 * Container and layout utilities
 */
export const RESPONSIVE_CLASSES = {
  /**
   * Main content container with responsive max-width and padding
   * xs/sm: full width with small padding
   * md: medium container with medium padding
   * lg+: large container centered
   */
  container: 'w-full px-4 sm:px-6 md:px-8 lg:px-0 mx-auto max-w-none md:max-w-2xl lg:max-w-5xl xl:max-w-7xl',

  /**
   * Responsive grid for stat cards
   * Scales from 1 column on mobile → 2 on tablet → 4 on desktop
   */
  statCards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6',

  /**
   * Responsive grid for dashboard cards
   * Scales from 1 → 2 → 3 columns with auto-fit
   */
  dashboardCards: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6',

  /**
   * Responsive grid for content cards with sidebar
   * Single column on mobile, content + sidebar on larger screens
   */
  contentWithSidebar: 'grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8',

  /**
   * Container padding - responsive padding that adapts to screen size
   * xs: compact (1rem)
   * md: medium (1.5rem)
   * lg: spacious (2rem)
   */
  containerPadding: 'px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12',

  /**
   * Section padding for major content sections
   * Provides breathing room at different breakpoints
   */
  sectionPadding: 'py-8 md:py-12 lg:py-16 xl:py-20',

  /**
   * Button sizing - touch-friendly with responsive sizing
   * xs: compact buttons (44px min height for touch)
   * lg: larger buttons (48px min height)
   */
  buttonPrimary: 'min-h-11 sm:min-h-12 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg transition-all duration-200',

  /**
   * Button sizing for secondary actions - more compact
   */
  buttonSecondary: 'min-h-10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200',

  /**
   * Modal or dialog width
   * xs/sm: full width (minus small margin)
   * md: medium size
   * lg: standard modal size
   */
  modalWidth: 'w-[calc(100%-2rem)] sm:w-full sm:max-w-md md:max-w-lg lg:max-w-2xl',

  /**
   * Modal padding - responsive internal spacing
   */
  modalPadding: 'p-4 sm:p-6 md:p-8',

  /**
   * Form input sizing - touch-friendly heights
   */
  formInput: 'w-full px-3 sm:px-4 py-2 sm:py-2.5 min-h-10 sm:min-h-11 text-sm sm:text-base',

  /**
   * Text sizing for body content
   */
  bodyText: 'text-sm sm:text-base md:text-base lg:text-lg',

  /**
   * Navigation bar sizing
   */
  navBar: 'h-16 md:h-20 flex items-center',

  /**
   * Sidebar container
   */
  sidebar: 'w-64 md:w-80 lg:w-96',

  /**
   * Safe area wrapper (for notched devices)
   */
  safeArea: 'smooth-safe-area',
};

/**
 * Layout configuration for navigation
 */
export const NAVBAR_CONFIG = {
  height: '64px',
  heightMd: '80px',
  classes: 'flex items-center justify-between h-16 md:h-20 px-4 sm:px-6 md:px-8 lg:px-12 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800',
  collapsible: true,
  sticky: true,
} as const;

/**
 * Sidebar configuration
 */
export const SIDEBAR_CONFIG = {
  expandedWidth: '256px',
  collapsedWidth: '80px',
  transition: 'transition-all duration-300 ease-in-out',
  classes: {
    base: 'fixed inset-y-0 left-0 z-40 overflow-y-auto bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-800',
    expanded: 'w-64 md:w-72',
    collapsed: 'w-20',
  },
} as const;

/**
 * Typography scale - responsive heading and text sizes
 * Uses Tailwind's responsive sizing classes
 */
export const TYPOGRAPHY = {
  h1: 'text-responsive-3xl md:text-responsive-4xl font-bold tracking-tight',
  h2: 'text-responsive-2xl md:text-responsive-3xl font-bold tracking-tight',
  h3: 'text-responsive-xl md:text-responsive-2xl font-semibold tracking-tight',
  h4: 'text-responsive-lg md:text-responsive-xl font-semibold',
  h5: 'text-responsive-base md:text-responsive-lg font-semibold',
  h6: 'text-responsive-sm md:text-responsive-base font-semibold',
  body: 'text-responsive-base leading-relaxed',
  bodySmall: 'text-responsive-sm leading-relaxed',
  bodyLarge: 'text-responsive-lg leading-relaxed',
  caption: 'text-responsive-xs text-gray-600 dark:text-gray-400',
  label: 'text-responsive-sm font-medium',
} as const;

/**
 * Spacing scales - consistent spacing across breakpoints
 */
export const SPACING = {
  // Compact spacing (mobile)
  compact: {
    gap: 'gap-2',
    padding: 'p-3',
    margin: 'm-2',
  },
  // Normal spacing (tablet)
  normal: {
    gap: 'gap-4',
    padding: 'p-4',
    margin: 'm-4',
  },
  // Generous spacing (desktop)
  generous: {
    gap: 'gap-6',
    padding: 'p-6',
    margin: 'm-6',
  },
} as const;

/**
 * Common breakpoint utilities
 */
export const BREAKPOINT_CLASSES = {
  /**
   * Hide on mobile, show on tablet+
   */
  hideOnMobile: 'hidden sm:block',

  /**
   * Show on mobile only
   */
  showOnMobileOnly: 'block sm:hidden',

  /**
   * Hide on tablet and below, show on desktop
   */
  hideOnTablet: 'hidden lg:block',

  /**
   * Stack on mobile, row on tablet+
   */
  stackOnMobile: 'flex flex-col sm:flex-row',

  /**
   * Responsive text alignment
   */
  textAlign: 'text-left sm:text-center md:text-right',

  /**
   * Responsive flex wrap
   */
  flexWrap: 'flex flex-wrap md:flex-nowrap',
} as const;

/**
 * Animation and transition utilities
 */
export const ANIMATIONS = {
  fadeIn: 'animate-fade-in',
  slideInRight: 'animate-slide-in-right',
  slideInLeft: 'animate-slide-in-left',
  pulseSoft: 'animate-pulse-soft',
  transition: {
    fast: 'transition duration-fast ease-in-out',
    normal: 'transition duration-normal ease-in-out',
    slow: 'transition duration-slow ease-in-out',
  },
} as const;

/**
 * Utility function to combine responsive classes safely
 * @param classes - Array or object of class strings
 * @returns Combined class string
 */
export function combineResponsiveClasses(classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Utility function to get responsive value from breakpoint
 * @example: getRespValue({ xs: 16, md: 24, lg: 32 }) → returns appropriate value
 */
export function getRespValue<T>(values: Record<string, T>, breakpoint: string): T | undefined {
  const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const index = breakpoints.indexOf(breakpoint);

  // Find the largest breakpoint value that is <= current breakpoint
  for (let i = index; i >= 0; i--) {
    const bp = breakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  return undefined;
}
