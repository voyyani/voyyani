/** @type {import('tailwindcss').Config} */

/**
 * Design system — Phase 2, "Product-Led" direction (docs/roadmapupdated.md §5, direction C).
 *
 * Replaces the navy/cyan/gold + gradient-blob + glassmorphism identity, which was a
 * competent execution of the most common AI-scaffolded portfolio look of the era.
 *
 * The three decisions that carry this identity:
 *   1. Near-black ground (#0B0B0C), NOT navy-blue. No gradients on surfaces.
 *   2. A single acid-lime signal colour, used only for things that are live, actionable
 *      or measured. Scarcity is what makes it read as a signal rather than decoration.
 *   3. Square corners. The old design rounded everything to 2xl/3xl; sharp edges plus
 *      hairline borders make it read as a tool, not a landing-page template.
 *
 * Audited while rewriting: the previous config carried ~80% dead tokens — nav-height,
 * sidebar-expanded/collapsed, container-max, section-padding, bg-active, the
 * viewport-minus-nav heights, the .btn-touch / .container-responsive / .sidebar-*
 * component classes, and the whole responsive-xs..4xl font scale. Every one had zero
 * references in src/ outside constants/responsive.ts. They are gone. The safe-area
 * helper stayed — two admin components genuinely use it.
 */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Neutral ramp. Warm-shifted near-black, deliberately not blue.
        ink: {
          950: '#0B0B0C', // page ground
          900: '#100F12', // raised panel
          850: '#17161A', // card
          800: '#1E1E21', // hairline
          700: '#2E2E33', // border
          600: '#34333A',
          500: '#55545A',
          400: '#6E6C74', // muted / mono labels
          300: '#8B8890', // tertiary copy
          200: '#A5A29B', // secondary copy
          50: '#F2F1EE', // primary copy
        },
        // The one accent. Reserve it for live, actionable or measured things.
        signal: {
          DEFAULT: '#C8FF3D',
          hover: '#A9DD23',
          dim: '#7A9E28',
        },
        // Status only — a client site in maintenance, a pending capture.
        warn: '#D99A2B',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Mono micro-label. The recurring "FIG 01" device across the site.
        eyebrow: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.14em' }],
        stat: ['1.75rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        title: ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        display: ['clamp(2rem, 4.5vw, 2.875rem)', { lineHeight: '1.06', letterSpacing: '-0.03em' }],
        'display-xl': ['clamp(2.25rem, 5.5vw, 3.75rem)', { lineHeight: '1.03', letterSpacing: '-0.035em' }],
      },
      spacing: {
        section: 'clamp(4rem, 9vw, 7rem)',
      },
      borderRadius: {
        // Square by default; 2px is the largest curve in this system.
        DEFAULT: '0px',
        sm: '2px',
        md: '2px',
        lg: '2px',
      },
      transitionTimingFunction: {
        // One easing curve for the whole site.
        signal: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        250: '250ms',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        // Kept: ResponsiveModal and MobileDrawer both use this.
        '.safe-area': {
          paddingTop: 'env(safe-area-inset-top)',
          paddingRight: 'env(safe-area-inset-right)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
        },
        'button, a, input, textarea, select': {
          WebkitTapHighlightColor: 'transparent',
        },
      });
    },
  ],
};
