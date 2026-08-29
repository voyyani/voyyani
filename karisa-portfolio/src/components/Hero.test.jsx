import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from './Hero';
import { SITE } from '../config/site';

// Mock framer-motion to simplify animations in tests
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        return React.forwardRef(({ children, ...props }, ref) => {
          const { animate, initial, exit, transition, whileHover, whileTap, variants, ...rest } = props;
          return React.createElement(prop, { ref, ...rest }, children);
        });
      }
    }),
    AnimatePresence: ({ children }) => children,
  };
});

const mockScrollToSection = vi.fn();

vi.mock('../hooks/useScrollAnimation', () => ({
  useSmoothScroll: () => mockScrollToSection,
}));

vi.mock('../utils/analytics', () => ({
  trackCTAClick: vi.fn(),
  trackEvent: vi.fn(),
}));

describe('Hero Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Headline', () => {
    it('states one fixed claim rather than rotating through job titles', () => {
      render(<Hero />);
      expect(screen.getByText(/I build software the way I was trained to build/i)).toBeDefined();
    });

    it('still identifies Karisa by name and location in the h1', () => {
      const { container } = render(<Hero />);
      const h1 = container.querySelector('h1');
      expect(h1).toBeDefined();
      expect(h1.textContent).toContain('Karisa Voyani');
      expect(h1.textContent).toContain(SITE.location);
    });

    it('renders exactly one h1', () => {
      const { container } = render(<Hero />);
      expect(container.querySelectorAll('h1').length).toBe(1);
    });

    // Phase 1 replaced the rotating role badge; the story moved to the About section.
    it('no longer renders the rotating role component', () => {
      render(<Hero />);
      expect(screen.queryByText('Problem Solver')).toBeNull();
      expect(screen.queryByText(/Engineering × Development/i)).toBeNull();
      expect(screen.queryByText(/Hi, I'm/i)).toBeNull();
    });
  });

  describe('Call to action', () => {
    it('offers a work CTA and an unambiguous hiring CTA', () => {
      render(<Hero />);
      expect(screen.getByText(/See what I've shipped/i)).toBeDefined();
      expect(screen.getByText(/Available for hire/i)).toBeDefined();
    });

    it('does not use the ambiguous "Let\'s Talk" label', () => {
      render(<Hero />);
      expect(screen.queryByText(/Let's Talk/i)).toBeNull();
    });

    it('scrolls to projects from the primary CTA', async () => {
      const user = userEvent.setup();
      render(<Hero />);
      await user.click(screen.getByText(/See what I've shipped/i).closest('button'));
      expect(mockScrollToSection).toHaveBeenCalledWith('projects');
    });

    it('scrolls to contact from the hiring CTA', async () => {
      const user = userEvent.setup();
      render(<Hero />);
      await user.click(screen.getByText(/Available for hire/i).closest('button'));
      expect(mockScrollToSection).toHaveBeenCalledWith('contact');
    });
  });

  describe('Proof points', () => {
    // The point of Phase 1: a number on this page must be checkable from this page.
    it('claims only the number of platforms the Projects section actually shows', () => {
      render(<Hero />);
      expect(screen.getByText('2')).toBeDefined();
      expect(screen.getByText(/Client platforms, shipped end to end/i)).toBeDefined();
    });

    it('states the engineering degree', () => {
      render(<Hero />);
      expect(screen.getByText('B.Eng')).toBeDefined();
      expect(screen.getByText('Mechanical Engineering')).toBeDefined();
    });

    it('drops the unverifiable round numbers it used to claim', () => {
      render(<Hero />);
      expect(screen.queryByText('10+')).toBeNull();
      expect(screen.queryByText('15+')).toBeNull();
      expect(screen.queryByText(/Projects Completed/i)).toBeNull();
    });

    it('links each proof point to its evidence', () => {
      const { container } = render(<Hero />);
      const links = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
      expect(links).toContain('#projects');
      expect(links).toContain(SITE.resume.href);
    });
  });

  describe('Accessibility', () => {
    it('renders a semantic section', () => {
      const { container } = render(<Hero />);
      expect(container.querySelector('section')).toBeDefined();
    });

    it('hides decorative background from assistive technology', () => {
      const { container } = render(<Hero />);
      expect(container.querySelector('[aria-hidden="true"]')).toBeDefined();
    });
  });
});
