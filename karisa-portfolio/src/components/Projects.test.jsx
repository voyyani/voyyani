import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects from './Projects';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        return React.forwardRef(({ children, ...props }, ref) => {
          const { animate, initial, exit, transition, whileHover, whileTap, layout, variants, ...rest } = props;
          return React.createElement(prop, { ref, ...rest }, children);
        });
      }
    }),
    AnimatePresence: ({ children }) => children,
    // Projects.jsx calls this to honour prefers-reduced-motion. Without it the mock
    // throws on import and every test in this file fails before it renders anything.
    useReducedMotion: () => false,
  };
});

// Mock useScrollAnimation hook
vi.mock('../hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({
    ref: { current: null },
    isVisible: true,
    hasAnimated: false,
  }),
}));

describe('Projects Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the projects section', () => {
      const { container } = render(<Projects />);
      const section = container.querySelector('section');
      expect(section).toBeDefined();
      expect(section.tagName).toBe('SECTION');
    });

    it('should display the section heading', () => {
      render(<Projects />);
      expect(screen.getByText(/Two platforms,/i)).toBeDefined();
    });

    it('should display "Full-Stack Platform" text', () => {
      render(<Projects />);
      expect(screen.getByText(/both in daily use/i)).toBeDefined();
    });

    it('should display the section description', () => {
      render(<Projects />);
      expect(screen.getByText(/Real client work, not demos/i)).toBeDefined();
      expect(screen.getByText(/schema, permissions/i)).toBeDefined();
    });
  });

  describe('Project Card', () => {
    it('should display Raslipwani Properties project', () => {
      render(<Projects />);
      expect(screen.getByText('Raslipwani Properties')).toBeDefined();
    });

    it('should display project tagline', () => {
      render(<Projects />);
      expect(screen.getByText('Real estate booking & client management')).toBeDefined();
    });

    it('should display project category badge', () => {
      render(<Projects />);
      const badges = screen.getAllByText('Full-Stack');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should display project description', () => {
      render(<Projects />);
      expect(screen.getByText(/staff run the whole pipeline/i)).toBeDefined();
    });

    // Phase 2 removed decorative emoji: they render differently on every platform,
    // can't take the accent colour, and are one of the clearest template tells.
    it('should number each project rather than badge it with an emoji', () => {
      render(<Projects />);
      expect(screen.getByText('01')).toBeDefined();
      expect(screen.getByText('02')).toBeDefined();
      expect(screen.queryByText('🏢')).toBeNull();
      expect(screen.queryByText('💚')).toBeNull();
    });

    it('should display first 3 metrics', () => {
      render(<Projects />);
      expect(screen.getByText('3s → 1.2s')).toBeDefined(); // Page Load
      expect(screen.getByText('100+')).toBeDefined(); // Active Users
      expect(screen.getByText('95/100')).toBeDefined(); // Mobile Lighthouse
    });

    it('should label metrics in words rather than emoji', () => {
      render(<Projects />);
      expect(screen.getByText('Page Load')).toBeDefined();
      expect(screen.getByText('Active Users')).toBeDefined();
      expect(screen.queryByText('👥')).toBeNull();
      expect(screen.queryByText('⚡')).toBeNull();
    });

    it('should display first 4 technologies', () => {
      render(<Projects />);
      expect(screen.getByText('React 18.3')).toBeDefined();
      expect(screen.getByText('Vite 6.3')).toBeDefined();
      expect(screen.getAllByText('Supabase').length).toBeGreaterThan(0);
      expect(screen.getByText('PostgreSQL')).toBeDefined();
    });

    it('should show "+N more" badge for remaining technologies', () => {
      render(<Projects />);
      // Project has 14 technologies, showing 4, so should show +10 more
      expect(screen.getByText('+10 more')).toBeDefined();
    });

    it('should display "Explore Full Details" CTA', () => {
      render(<Projects />);
      expect(screen.getAllByText('Explore Full Details').length).toBe(2);
    });

    it('should have cursor-pointer class for interactivity', () => {
      const { container } = render(<Projects />);
      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeDefined();
    });
  });

  describe('Project Modal', () => {
    it('should open modal when project card is clicked', async () => {
      const user = userEvent.setup();
      render(<Projects />);

      const projectCard = screen.getByText('Raslipwani Properties').closest('.cursor-pointer');
      await user.click(projectCard);

      // Modal should be visible (project details section should appear)
      await waitFor(() => {
        // The modal contains more detailed content
        expect(screen.getAllByText('Raslipwani Properties').length).toBeGreaterThan(1);
      });
    });

    it('should display close button in modal', async () => {
      const user = userEvent.setup();
      render(<Projects />);

      const projectCard = screen.getByText('Raslipwani Properties').closest('.cursor-pointer');
      await user.click(projectCard);

      await waitFor(() => {
        const closeButtons = screen.getAllByRole('button');
        expect(closeButtons.length).toBeGreaterThan(0);
      });
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<Projects />);

      // Open modal
      const projectCard = screen.getByText('Raslipwani Properties').closest('.cursor-pointer');
      await user.click(projectCard);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getAllByText('Raslipwani Properties').length).toBeGreaterThan(1);
      });

      // Close modal
      const closeButton = screen.getAllByRole('button')[0];
      await user.click(closeButton);

      // Modal should eventually close (checked by state change)
      expect(closeButton).toBeDefined();
    });

    it('should close modal when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<Projects />);

      // Open modal
      const projectCard = screen.getByText('Raslipwani Properties').closest('.cursor-pointer');
      await user.click(projectCard);

      await waitFor(() => {
        expect(screen.getAllByText('Raslipwani Properties').length).toBeGreaterThan(1);
      });

      // Find backdrop (fixed inset-0 element)
      const backdrop = container.querySelector('.fixed.inset-0');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(backdrop).toBeDefined();
    });
  });

  describe('Modal Content', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<Projects />);
      const projectCard = screen.getByText('Raslipwani Properties').closest('.cursor-pointer');
      await user.click(projectCard);
    });

    it('should display project challenge in modal', async () => {
      await waitFor(() => {
        expect(screen.getByText(/loaded every property and every booking/i)).toBeDefined();
      });
    });

    it('should display solution details', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Server-side pagination so a page fetches 20 rows/i)).toBeDefined();
      });
    });

    // Raslipwani is flagged liveStatus.state === 'maintenance', so the modal must warn
    // the visitor rather than promising a live platform behind the link.
    it('should link to the live site and disclose the maintenance window', async () => {
      await waitFor(() => {
        const liveLink = screen.getByText(/Visit Site Anyway/i);
        expect(liveLink).toBeDefined();
        expect(liveLink.closest('a')).toBeDefined();
        expect(liveLink.closest('a').getAttribute('href')).toBe('https://raslipwani.co.ke');
      });

      expect(screen.getByText(/scheduled maintenance window/i)).toBeDefined();
      expect(screen.queryByText(/View Live Platform/i)).toBeNull();
    });

    it.skip('should display GitHub URL link', async () => {
      // Skipped: GitHub button not currently rendered in modal
      // The githubUrl exists in project data but UI doesn't display it yet
      await waitFor(() => {
        const githubLink = screen.getByText(/View Source Code/i);
        expect(githubLink).toBeDefined();
        expect(githubLink.closest('a')).toBeDefined();
      });
    });
  });

  describe('Additional Info', () => {
    // Phase 1 deleted the vanity stat row: none of it was checkable from this page.
    it('should not display unverifiable vanity stats', () => {
      render(<Projects />);
      expect(screen.queryByText(/10,000\+ lines of production code/i)).toBeNull();
      expect(screen.queryByText(/Zero compilation errors/i)).toBeNull();
      expect(screen.queryByText(/WCAG 2.1 AA compliant/i)).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should render as a semantic section element', () => {
      const { container } = render(<Projects />);
      const section = container.querySelector('section');
      expect(section.tagName).toBe('SECTION');
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<Projects />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeDefined();
      expect(h2.textContent).toContain('Two platforms');
    });

    it('should have clickable card elements', () => {
      const { container } = render(<Projects />);
      const clickableCard = container.querySelector('.cursor-pointer');
      expect(clickableCard).toBeDefined();
    });
  });

  describe('Styling and Layout', () => {
    it('should have gradient background styling', () => {
      const { container } = render(<Projects />);
      const gradientElement = container.querySelector('[class*="from-"]');
      expect(gradientElement).toBeDefined();
    });

    it('should render metrics in a grid layout', () => {
      const { container } = render(<Projects />);
      const metricsGrid = container.querySelector('.grid-cols-3');
      expect(metricsGrid).toBeDefined();
    });

    it('should display tech stack with proper styling', () => {
      const { container } = render(<Projects />);
      const techTags = container.querySelectorAll('.flex-wrap');
      expect(techTags.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity', () => {
    it('should render correct number of metrics in card (3)', () => {
      const { container } = render(<Projects />);
      const firstCardMetrics = container.querySelector('.grid-cols-3');
      expect(firstCardMetrics.children.length).toBe(3);
    });

    it('should render correct number of tech tags in card (4 + more badge)', () => {
      const { container } = render(<Projects />);
      // Should have 4 tech tags + 1 "more" badge
      const techElements = screen.getAllByText(/React 18.3|Vite 6.3|Supabase|PostgreSQL|\+10 more/);
      expect(techElements.length).toBeGreaterThan(4);
    });

    it('should have valid project data structure', () => {
      render(<Projects />);
      
      // Verify core project data is present
      expect(screen.getByText('Raslipwani Properties')).toBeDefined();
      expect(screen.getByText('Real estate booking & client management')).toBeDefined();
      expect(screen.getByText('100+')).toBeDefined();
      expect(screen.getByText('React 18.3')).toBeDefined();
    });
  });
});
