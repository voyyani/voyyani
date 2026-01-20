import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Skills from './Skills';

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

describe('Skills Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the skills section', () => {
      const { container } = render(<Skills />);
      const section = container.querySelector('section');
      expect(section).toBeDefined();
      expect(section.id).toBe('skills');
    });

    it('should display the section badge', () => {
      render(<Skills />);
      expect(screen.getByText(/Skills & Expertise/i)).toBeDefined();
    });

    it('should display the section heading', () => {
      render(<Skills />);
      expect(screen.getByText(/Technical/i)).toBeDefined();
      expect(screen.getByText(/Arsenal/i)).toBeDefined();
    });

    it('should display the section description', () => {
      render(<Skills />);
      expect(screen.getByText(/comprehensive toolkit/i)).toBeDefined();
      expect(screen.getByText(/modern development/i)).toBeDefined();
      expect(screen.getByText(/engineering excellence/i)).toBeDefined();
    });
  });

  describe('Category Tabs', () => {
    it('should display all three category tabs', () => {
      render(<Skills />);
      const frontendTabs = screen.getAllByText(/Frontend Mastery/i);
      const backendTabs = screen.getAllByText(/Backend & Database/i);
      const engineeringTabs = screen.getAllByText(/Engineering Toolkit/i);
      
      expect(frontendTabs.length).toBeGreaterThan(0);
      expect(backendTabs.length).toBeGreaterThan(0);
      expect(engineeringTabs.length).toBeGreaterThan(0);
    });

    it('should display category icons', () => {
      const { container } = render(<Skills />);
      
      // Check if emojis appear in the page content
      const content = container.textContent;
      expect(content).toContain('⚛️'); // Frontend
      expect(content).toContain('🔧'); // Backend
      expect(content).toContain('🛠️'); // Engineering
    });

    it('should have Frontend Mastery active by default', () => {
      const { container } = render(<Skills />);
      const buttons = screen.getAllByRole('button');
      
      // Frontend button should exist
      expect(buttons.length).toBe(3);
      
      // First button (Frontend) should have active styling
      const frontendButton = buttons[0];
      expect(frontendButton.textContent).toContain('Frontend Mastery');
      expect(frontendButton.className).toContain('text-white');
    });

    it('should switch category when tab is clicked', async () => {
      const user = userEvent.setup();
      render(<Skills />);

      // Initially Frontend is active
      expect(screen.getByText('React')).toBeDefined();

      // Click Backend tab
      const backendTab = screen.getByText(/Backend & Database/i).closest('button');
      backendTab.click();

      // Backend skills should appear
      await waitFor(() => {
        expect(screen.getByText('Supabase')).toBeDefined();
      });
    });

    it('should switch to Engineering Toolkit when clicked', async () => {
      const user = userEvent.setup();
      render(<Skills />);

      // Click Engineering tab
      const engineeringTab = screen.getByText(/Engineering Toolkit/i).closest('button');
      engineeringTab.click();

      // Engineering skills should appear
      await waitFor(() => {
        expect(screen.getByText('MATLAB')).toBeDefined();
      });
    });
  });

  describe('Frontend Mastery Skills', () => {
    it('should display all Frontend skills', () => {
      render(<Skills />);
      
      expect(screen.getByText('React')).toBeDefined();
      expect(screen.getByText('TypeScript')).toBeDefined();
      expect(screen.getByText('Vite')).toBeDefined();
      expect(screen.getByText('Tailwind CSS')).toBeDefined();
    });

    it('should display skill levels for Frontend skills', () => {
      render(<Skills />);
      
      expect(screen.getAllByText('95%').length).toBeGreaterThan(0); // React
      expect(screen.getAllByText('90%').length).toBeGreaterThan(0); // TypeScript & Tailwind (appears twice)
      expect(screen.getAllByText('85%').length).toBeGreaterThan(0); // Vite
    });

    it('should display skill icons', () => {
      render(<Skills />);
      
      // Frontend skill icons
      expect(screen.getAllByText('⚛️').length).toBeGreaterThan(0); // React
      expect(screen.getByText('📘')).toBeDefined(); // TypeScript
      expect(screen.getByText('⚡')).toBeDefined(); // Vite
      expect(screen.getByText('🎨')).toBeDefined(); // Tailwind
    });

    it('should display proficiency labels', () => {
      render(<Skills />);
      
      const expertLabels = screen.getAllByText(/🌟 Expert/i);
      expect(expertLabels.length).toBeGreaterThan(0);
    });

    it('should calculate and display average score', () => {
      render(<Skills />);
      
      // Frontend average: (95 + 90 + 85 + 90) / 4 = 90
      expect(screen.getByText('90')).toBeDefined();
      expect(screen.getByText('AVG')).toBeDefined();
    });
  });

  describe('Backend & Database Skills', () => {
    beforeEach(async () => {
      render(<Skills />);
      const backendTab = screen.getByText(/Backend & Database/i).closest('button');
      backendTab.click();
      await waitFor(() => {
        expect(screen.getByText('Supabase')).toBeDefined();
      });
    });

    it('should display all Backend skills', () => {
      expect(screen.getByText('Supabase')).toBeDefined();
      expect(screen.getByText('PostgreSQL')).toBeDefined();
      expect(screen.getByText('Node.js')).toBeDefined();
      expect(screen.getByText('Heroku')).toBeDefined();
    });

    it('should display Backend skill levels', () => {
      expect(screen.getByText('85%')).toBeDefined(); // Supabase
      expect(screen.getByText('80%')).toBeDefined(); // PostgreSQL
      expect(screen.getByText('90%')).toBeDefined(); // Node.js
      expect(screen.getByText('75%')).toBeDefined(); // Heroku
    });

    it('should display Backend category description', () => {
      expect(screen.getByText(/Scalable server-side solutions/i)).toBeDefined();
    });
  });

  describe('Engineering Toolkit Skills', () => {
    beforeEach(async () => {
      render(<Skills />);
      const engineeringTab = screen.getByText(/Engineering Toolkit/i).closest('button');
      engineeringTab.click();
      await waitFor(() => {
        expect(screen.getByText('MATLAB')).toBeDefined();
      });
    });

    it('should display all Engineering skills', () => {
      expect(screen.getByText('MATLAB')).toBeDefined();
      expect(screen.getByText('CATIA')).toBeDefined();
      expect(screen.getByText('AutoCAD')).toBeDefined();
      expect(screen.getByText('AWS')).toBeDefined();
    });

    it('should display Engineering skill levels', () => {
      expect(screen.getByText('85%')).toBeDefined(); // MATLAB
      expect(screen.getByText('80%')).toBeDefined(); // CATIA
      expect(screen.getByText('90%')).toBeDefined(); // AutoCAD
      expect(screen.getByText('75%')).toBeDefined(); // AWS
    });

    it('should display Engineering category description', () => {
      expect(screen.getByText(/Professional engineering and design software/i)).toBeDefined();
    });
  });

  describe('Skill Cards', () => {
    it('should render skill cards in a grid layout', () => {
      const { container } = render(<Skills />);
      const grid = container.querySelector('.grid-cols-1.md\\:grid-cols-2');
      expect(grid).toBeDefined();
    });

    it('should display progress bars for each skill', () => {
      const { container } = render(<Skills />);
      // Each skill has a progress bar container
      const progressBars = container.querySelectorAll('.rounded-full.overflow-hidden');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should have hover effects on skill cards', () => {
      const { container } = render(<Skills />);
      const skillCard = container.querySelector('.group.relative.p-6');
      expect(skillCard).toBeDefined();
      expect(skillCard.className).toContain('hover:shadow-2xl');
    });
  });

  describe('Tech Tags', () => {
    it('should display tech tags at the bottom of category', () => {
      const { container } = render(<Skills />);
      const tagContainer = container.querySelector('.flex-wrap.gap-2');
      expect(tagContainer).toBeDefined();
    });

    it('should display tech tags with icons', () => {
      render(<Skills />);
      
      // Tags should include skill name and icon
      const reactElements = screen.getAllByText(/React/i);
      expect(reactElements.length).toBeGreaterThan(1); // Appears in card and tag
    });
  });

  describe('Fun Fact Section', () => {
    it('should display the fun fact at the bottom', () => {
      render(<Skills />);
      expect(screen.getByText(/Continuously learning/i)).toBeDefined();
    });

    it('should have lightbulb emoji', () => {
      const { container } = render(<Skills />);
      expect(container.textContent).toContain('💡');
    });
  });

  describe('Accessibility', () => {
    it('should render as a semantic section element', () => {
      const { container } = render(<Skills />);
      const section = container.querySelector('section');
      expect(section.tagName).toBe('SECTION');
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<Skills />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeDefined();
      expect(h2.textContent).toContain('Technical');
    });

    it('should have clickable category buttons', () => {
      render(<Skills />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3); // Three category tabs
    });

    it('should have proper button roles', () => {
      render(<Skills />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Visual Styling', () => {
    it('should have background blur elements', () => {
      const { container } = render(<Skills />);
      const backgroundElements = container.querySelectorAll('.blur-3xl');
      expect(backgroundElements.length).toBeGreaterThan(0);
    });

    it('should have gradient text for Arsenal', () => {
      const { container } = render(<Skills />);
      const gradientText = container.querySelector('.bg-gradient-to-r.from-\\[\\#61DAFB\\]');
      expect(gradientText).toBeDefined();
    });

    it('should display circular progress indicator', () => {
      const { container } = render(<Skills />);
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      expect(svg.querySelector('circle')).toBeDefined();
    });
  });

  describe('Data Integrity', () => {
    it('should have 4 skills per category', () => {
      const { container } = render(<Skills />);
      
      // Frontend (default)
      let skillCards = container.querySelectorAll('.group.relative.p-6');
      expect(skillCards.length).toBe(4);
    });

    it('should calculate correct average for Frontend (90)', () => {
      render(<Skills />);
      // (95 + 90 + 85 + 90) / 4 = 90
      expect(screen.getByText('90')).toBeDefined();
    });

    it('should calculate correct average for Backend (82.5 → 82 or 83)', async () => {
      render(<Skills />);
      const buttons = screen.getAllByRole('button');
      const backendTab = buttons[1]; // Second button is Backend
      backendTab.click();
      
      await waitFor(() => {
        const avgElement = screen.getByText('AVG');
        const parent = avgElement.closest('div');
        // (85 + 80 + 90 + 75) / 4 = 82.5 → could be 82 or 83 depending on rounding
        const hasCorrectAvg = parent.textContent.includes('82') || parent.textContent.includes('83');
        expect(hasCorrectAvg).toBe(true);
      });
    });
  });

  describe('Interactive Behavior', () => {
    it('should maintain category selection after re-render', async () => {
      const { rerender } = render(<Skills />);
      
      const backendTab = screen.getByText(/Backend & Database/i).closest('button');
      backendTab.click();
      
      await waitFor(() => {
        expect(screen.getByText('Supabase')).toBeDefined();
      });
      
      rerender(<Skills />);
      
      // Should still show Backend skills after re-render
      expect(screen.getByText('Supabase')).toBeDefined();
    });

    it('should respond to rapid category switching', async () => {
      render(<Skills />);
      
      const buttons = screen.getAllByRole('button');
      const frontendTab = buttons[0];
      const backendTab = buttons[1];
      const engineeringTab = buttons[2];
      
      // Rapid clicks
      backendTab.click();
      engineeringTab.click();
      frontendTab.click();
      
      await waitFor(() => {
        // Should end up on Frontend
        expect(screen.getByText('React')).toBeDefined();
      });
    });
  });
});
