/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    screens: {
      'xs': '320px',   // Mobile first
      'sm': '640px',   // Small devices
      'md': '768px',   // Tablets
      'lg': '1024px',  // Small laptops
      'xl': '1280px',  // Desktops
      '2xl': '1536px', // Large desktops
    },
    extend: {
      spacing: {
        // Layout spacing
        'nav-height': '64px',
        'sidebar-expanded': '256px',
        'sidebar-collapsed': '80px',
        'section-padding': 'clamp(1rem, 5vw, 3rem)',
        'container-max': '1200px',
      },
      height: {
        'nav': '64px',
        'viewport-minus-nav': 'calc(100vh - 64px)',
      },
      fontSize: {
        // Fluid typography - scales with viewport
        'responsive-xs': ['clamp(0.75rem, 1.5vw, 0.875rem)', { lineHeight: '1.5' }],
        'responsive-sm': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.5' }],
        'responsive-base': ['clamp(1rem, 2.5vw, 1.125rem)', { lineHeight: '1.6' }],
        'responsive-lg': ['clamp(1.125rem, 3vw, 1.25rem)', { lineHeight: '1.6' }],
        'responsive-xl': ['clamp(1.25rem, 3.5vw, 1.5rem)', { lineHeight: '1.7' }],
        'responsive-2xl': ['clamp(1.5rem, 4vw, 1.875rem)', { lineHeight: '1.8' }],
        'responsive-3xl': ['clamp(1.875rem, 5vw, 2.25rem)', { lineHeight: '1.8' }],
        'responsive-4xl': ['clamp(2.25rem, 6vw, 3rem)', { lineHeight: '1.8' }],
      },
      inset: {
        // Safe area insets for notched devices
        'safe-top': 'env(safe-area-inset-top)',
        'safe-right': 'env(safe-area-inset-right)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
      },
      padding: {
        // Safe area insets for padding
        'safe-x': 'env(safe-area-inset-left) env(safe-area-inset-right)',
        'safe-y': 'env(safe-area-inset-top) env(safe-area-inset-bottom)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-in-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-left': 'slideInLeft 300ms ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7' },
        },
      },
      minHeight: {
        'nav': '64px',
        'screen-minus-nav': 'calc(100vh - 64px)',
      },
      backgroundColor: {
        'active': 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [
    function ({ addComponents, theme, e }) {
      addComponents({
        // Touch-friendly button sizing
        '.btn-touch': {
          '@apply min-h-12 min-w-12 px-4 py-2': {},
        },
        // Disable tap highlight on mobile devices
        '@supports (selector(:focus-visible))': {
          'button, a, input, textarea, select, [role="button"]': {
            WebkitTapHighlightColor: 'transparent',
          },
        },
        // Safe area utilities
        '.safe-area': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
        },
        // Container utilities
        '.container-responsive': {
          '@apply w-full max-w-container-max mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        // Sidebar utilities
        '.sidebar-base': {
          '@apply fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300': {},
        },
        '.sidebar-expanded': {
          '@apply w-sidebar-expanded': {},
        },
        '.sidebar-collapsed': {
          '@apply w-sidebar-collapsed': {},
        },
        // Touch-friendly interactive elements
        'button, a, input, textarea, select': {
          WebkitTapHighlightColor: 'transparent',
        },
      })
    },
  ],
}
