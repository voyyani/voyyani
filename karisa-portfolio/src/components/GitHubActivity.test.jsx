import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GitHubActivity from './GitHubActivity';
import activity from '../data/github-activity.json';

vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (target, prop) => React.forwardRef(({ children, ...props }, ref) => {
        const { animate, initial, exit, transition, whileHover, whileTap, variants, layout, ...rest } = props;
        return React.createElement(prop, { ref, ...rest }, children);
      }),
    }),
    AnimatePresence: ({ children }) => children,
  };
});

vi.mock('../hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({ ref: { current: null }, isVisible: true, hasAnimated: false }),
}));

describe('GitHubActivity', () => {
  describe('Data integrity', () => {
    // The whole point of this section is that the figures are checkable. If the snapshot
    // and the rendered totals ever disagree, the section is doing the opposite of its job.
    it('renders totals that match the synced snapshot', () => {
      render(<GitHubActivity />);
      expect(screen.getByText(String(activity.totals.commits))).toBeDefined();
      expect(screen.getByText('Public commits')).toBeDefined();
      expect(screen.getByText('Repositories')).toBeDefined();
    });

    it('has a snapshot whose repo commits sum to the stated total', () => {
      const summed = activity.repos.reduce((n, r) => n + r.commits, 0);
      expect(summed).toBe(activity.totals.commits);
    });

    it('has a continuous month series with no gaps in the timeline itself', () => {
      const months = activity.months.map((m) => m.month);
      for (let i = 1; i < months.length; i += 1) {
        const prev = new Date(`${months[i - 1]}-01T00:00:00Z`);
        prev.setUTCMonth(prev.getUTCMonth() + 1);
        expect(months[i]).toBe(prev.toISOString().slice(0, 7));
      }
    });

    // Quiet months are real. Dropping them would flatter the shape of the history.
    it('keeps months with zero commits rather than dropping them', () => {
      expect(activity.months.some((m) => m.commits === 0)).toBe(true);
    });
  });

  describe('Chart', () => {
    it('exposes the chart to assistive technology with a real description', () => {
      render(<GitHubActivity />);
      const img = screen.getByRole('img');
      expect(img.getAttribute('aria-labelledby')).toBeTruthy();
      expect(within(img).getByText(/Public commits per month/i)).toBeDefined();
    });

    it('draws one keyboard-reachable hit target per month', () => {
      const { container } = render(<GitHubActivity />);
      const targets = container.querySelectorAll('svg [role="button"][tabindex="0"]');
      expect(targets.length).toBe(activity.months.length);
    });

    it('labels the peak month only, not every column', () => {
      const { container } = render(<GitHubActivity />);
      const peak = Math.max(...activity.months.map((m) => m.commits));
      const texts = [...container.querySelectorAll('svg text')].map((t) => t.textContent);
      expect(texts).toContain(String(peak));
      // a value on every column would be chaos; count the bold direct labels
      const direct = [...container.querySelectorAll('svg text.fill-ink-50')];
      expect(direct.length).toBe(1);
    });
  });

  describe('Table view', () => {
    // A tooltip must never be the only way to read a value.
    it('offers every month as text when toggled', async () => {
      const user = userEvent.setup();
      render(<GitHubActivity />);
      await user.click(screen.getByRole('button', { name: /show table/i }));
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(activity.months.length + 1); // + header
    });
  });

  describe('Verifiability', () => {
    it('links every repository to its source', () => {
      render(<GitHubActivity />);
      activity.repos.forEach((repo) => {
        const link = screen.getByRole('link', { name: repo.name });
        expect(link.getAttribute('href')).toBe(repo.url);
      });
    });

    it('states when the data was synced and where to check it', () => {
      render(<GitHubActivity />);
      expect(screen.getByText(/Synced/i)).toBeDefined();
      expect(screen.getByRole('link', { name: /verify at github\.com/i })).toBeDefined();
    });
  });
});
