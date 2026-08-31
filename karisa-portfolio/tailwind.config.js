/** @type {import('tailwindcss').Config} */

/**
 * Design system — "The Kanga Sheet".
 *
 * Replaces the near-black + acid-lime "tool" identity (Phase 2, itself a replacement
 * for a navy/cyan glassmorphism scaffold). That look was coherent, but it argued in
 * the vocabulary of a developer terminal to an audience of non-profit directors and
 * business owners who do not read terminals. This world argues in theirs.
 *
 * A kanga is not decorated cloth. It is a printed statement you can hold up: a border
 * (the PINDO) enclosing a plain field (the MJI), captioned along the hem by one large
 * printed line (the JINA). Its whole grammar is frame, evidence, statement. Every
 * section of this site is built that way.
 *
 * The four decisions that carry the identity:
 *   1. Unbleached cotton ground (#F2EEE5). Warm, printed, flat — never white, never a
 *      gradient, never a blurred blob.
 *   2. One accent: kanga indigo (#243D8F). It is the border ink and the state ink. It
 *      is never spent on decoration — state reads as a printed MARK, not as a hue.
 *   3. The pindo is a real nine-slice border-image (public/patterns/pindo-*.svg), at
 *      two weights. Not four CSS lines pretending to be a frame.
 *   4. The jina is set at true display scale — 5.25rem at the top end — because on
 *      cloth the printed line is the largest thing on the object.
 *
 * The `ink` / `signal` ramp below is NOT part of this world. It is the previous dark
 * system, kept intact solely because the private /admin area is built on it and is out
 * of scope for a public-site redesign. Nothing under src/components or src/sections
 * may use it. If the admin is ever redesigned, delete that block with it.
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
        /* ---- The Kanga Sheet: the public site ---------------------------- */

        // Grounds. Unbleached cotton, warm-shifted, deliberately not white.
        cloth: {
          50: '#FAF8F3', // raised field / input ground
          100: '#F2EEE5', // page ground
          200: '#E9E3D6', // recessed band, table stripe
          300: '#DCD5C5', // hairline rule
          400: '#C6BEAB', // NON-TEXT ONLY — heavy rule, disabled chrome. 2.2:1 on cloth-100.
        },
        // Text ink. Every value below clears WCAG AA on cloth-50/100/200:
        // 900 → 15.5:1, 700 → 9.3:1, 600 → 6.8:1, 500 → 5.5:1 on cloth-100.
        mark: {
          900: '#14171C', // primary copy, headings, jina
          700: '#3B3E45', // secondary copy
          600: '#4E525A', // tertiary copy
          500: '#5B5F67', // captions, table meta — the floor for text
        },
        // The one accent. Border ink, state ink, links, primary action.
        // 8.5:1 on cloth-100; cloth-50 on pindo is 9.3:1.
        pindo: {
          DEFAULT: '#243D8F',
          deep: '#1A2C68', // hover / pressed
          wash: '#E4E7F3', // selection, active tab ground
        },
        // Status only — a client site in a maintenance window. 5.1:1 on cloth-100.
        warn: '#8A5A08',
        // Destructive only — form errors. 5.0:1 on cloth-100 / 5.4:1 on cloth-50.
        alarm: '#A32014',

        /* ---- Legacy dark ramp: /admin only. Do not use on the public site. */
        ink: {
          950: '#0B0B0C',
          900: '#100F12',
          850: '#17161A',
          800: '#1E1E21',
          700: '#2E2E33',
          600: '#34333A',
          500: '#55545A',
          400: '#828089',
          300: '#8B8890',
          200: '#A5A29B',
          50: '#F2F1EE',
        },
        signal: {
          DEFAULT: '#C8FF3D',
          hover: '#A9DD23',
          dim: '#7A9E28',
        },
      },
      fontFamily: {
        // Self-hosted (public/fonts) — the previous system pulled two families from
        // fonts.googleapis.com on every load, which is a render-blocking round trip to
        // two third-party origins for an audience on constrained connections.
        sans: ['Archivo', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Archivo', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // The jina — the printed line along a kanga's hem. The largest thing on the
        // object, by design; this is what the visitor remembers.
        jina: ['clamp(2.25rem, 6.2vw, 5.25rem)', { lineHeight: '0.94', letterSpacing: '-0.035em', fontWeight: '700' }],
        // The lead panel sets its jina against a half-width column, so it scales on a
        // shallower slope than the full-width panels below it.
        'jina-lead': ['clamp(2.25rem, 4.6vw, 4rem)', { lineHeight: '0.96', letterSpacing: '-0.035em', fontWeight: '700' }],
        'jina-sm': ['clamp(1.75rem, 4vw, 3rem)', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '700' }],
        display: ['clamp(1.875rem, 3.4vw, 2.75rem)', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
        title: ['clamp(1.25rem, 2.2vw, 1.75rem)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        lead: ['clamp(1.0625rem, 1.15vw, 1.1875rem)', { lineHeight: '1.65' }],
        // The tabular band under every hem: the measured facts.
        figure: ['clamp(1.375rem, 2vw, 1.875rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        // Small caps label used INSIDE bands and tables — never above a heading.
        label: ['0.6875rem', { lineHeight: '1.35', letterSpacing: '0.09em' }],
      },
      spacing: {
        section: 'clamp(3.5rem, 7.5vw, 6.5rem)',
        // The pindo band width. Also the panel's inner gutter, so the frame and the
        // content share one measure.
        pindo: '16px',
      },
      borderRadius: {
        // Printed cloth has no rounded corners.
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        full: '9999px', // status dots only
      },
      transitionTimingFunction: {
        // One curve for the whole site: an exponential settle, like a press coming down.
        press: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        250: '250ms',
        400: '400ms',
      },
      maxWidth: {
        prose: '68ch',
        sheet: '1360px',
      },
      keyframes: {
        // The one authored moment: ink meeting cloth, left to right.
        print: {
          from: { clipPath: 'inset(0 100% 0 0)' },
          to: { clipPath: 'inset(0 0 0 0)' },
        },
        settle: {
          from: { opacity: '0', transform: 'translateY(0.5rem)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        // Kept: ResponsiveModal and MobileDrawer (admin) both use this.
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
