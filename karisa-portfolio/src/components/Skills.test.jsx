import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Skills from './Skills';

vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        return React.forwardRef(({ children, ...props }, ref) => {
          const { animate, initial, exit, transition, whileHover, whileTap, variants, layout, ...rest } = props;
          return React.createElement(prop, { ref, ...rest }, children);
        });
      }
    }),
    AnimatePresence: ({ children }) => children,
  };
});

vi.mock('../hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true, hasAnimated: false }),
}));

vi.mock('../utils/analytics', () => ({ trackEvent: vi.fn() }));

describe('Skills Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the section with a heading', () => {
      const { container } = render(<Skills />);
      expect(container.querySelector('section#skills')).toBeDefined();
      expect(container.querySelector('h2').textContent).toContain('What I use');
    });

    it('offers all four toolkit groups', () => {
      render(<Skills />);
      ['Frontend', 'Backend & Data', 'Testing & Tooling', 'Engineering'].forEach((group) => {
        expect(screen.getByRole('tab', { name: new RegExp(group, 'i') })).toBeDefined();
      });
    });

    it('shows the Frontend group by default', () => {
      render(<Skills />);
      expect(screen.getByRole('tab', { name: /Frontend/i }).getAttribute('aria-selected')).toBe('true');
      expect(screen.getByText('React')).toBeDefined();
    });
  });

  describe('Attribution over self-scoring', () => {
    // This is the whole point of the Phase 1 rewrite of this section: a claim about a
    // tool is only worth making if the reader can check it against the work shown above.
    it('renders no percentage scores', () => {
      const { container } = render(<Skills />);
      expect(container.textContent).not.toMatch(/\d{1,3}\s*%/);
    });

    it('drops the self-awarded proficiency labels', () => {
      render(<Skills />);
      expect(screen.queryByText(/Expert/i)).toBeNull();
      expect(screen.queryByText(/Advanced/i)).toBeNull();
      expect(screen.queryByText(/Proficient/i)).toBeNull();
      expect(screen.queryByText(/AVG/)).toBeNull();
    });

    it('attributes every listed tool to where it was used', () => {
      const { container } = render(<Skills />);
      const rows = container.querySelectorAll('ul > li');
      expect(rows.length).toBeGreaterThan(0);
      rows.forEach((row) => {
        // name on the left, "where" on the right — both non-empty
        expect(row.children.length).toBe(2);
        expect(row.children[0].textContent.trim().length).toBeGreaterThan(0);
        expect(row.children[1].textContent.trim().length).toBeGreaterThan(0);
      });
    });

    it('says explicitly that it does not use self-assigned percentages', () => {
      render(<Skills />);
      expect(screen.getByText(/No self-assigned percentages/i)).toBeDefined();
    });
  });

  describe('Group switching', () => {
    it('switches to the Engineering group on click', async () => {
      const user = userEvent.setup();
      render(<Skills />);
      await user.click(screen.getByRole('tab', { name: /Engineering/i }));
      expect(screen.getByText('MATLAB')).toBeDefined();
      expect(screen.getByText('CATIA')).toBeDefined();
    });

    it('switches to the Backend group on click', async () => {
      const user = userEvent.setup();
      render(<Skills />);
      await user.click(screen.getByRole('tab', { name: /Backend & Data/i }));
      expect(screen.getByText('PostgreSQL')).toBeDefined();
      expect(screen.getByText('Row-Level Security')).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('exposes the group switcher as a tablist', () => {
      const { container } = render(<Skills />);
      expect(container.querySelector('[role="tablist"]')).toBeDefined();
      expect(container.querySelectorAll('[role="tab"]').length).toBe(4);
    });

    it('marks exactly one tab selected at a time', () => {
      const { container } = render(<Skills />);
      const selected = [...container.querySelectorAll('[role="tab"]')]
        .filter((t) => t.getAttribute('aria-selected') === 'true');
      expect(selected.length).toBe(1);
    });
  });
});
