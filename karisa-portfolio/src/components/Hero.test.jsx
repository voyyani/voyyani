import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from './Hero';

// Mock framer-motion to simplify animations in tests
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        return React.forwardRef(({ children, ...props }, ref) => {
          const { animate, initial, exit, transition, whileHover, whileTap, ...rest } = props;
          return React.createElement(prop, { ref, ...rest }, children);
        });
      }
    }),
    AnimatePresence: ({ children }) => children,
  };
});

// Mock useScrollAnimation hook
const mockScrollToSection = vi.fn((sectionId) => {
  console.log(`Scrolling to: ${sectionId}`);
});

vi.mock('../hooks/useScrollAnimation', () => ({
  useSmoothScroll: () => mockScrollToSection,
}));

describe('Hero Component', () => {
  let intervalSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    intervalSpy = vi.spyOn(global, 'setInterval');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the hero section', () => {
      const { container } = render(<Hero />);
      const heroSection = container.querySelector('section');
      expect(heroSection).toBeDefined();
      expect(heroSection.tagName).toBe('SECTION');
    });

    it('should display the name "Karisa"', () => {
      render(<Hero />);
      expect(screen.getByText('Karisa')).toBeDefined();
    });

    it('should display the greeting "Hi, I\'m"', () => {
      render(<Hero />);
      expect(screen.getByText(/Hi, I'm/i)).toBeDefined();
    });

    it('should display the badge "Engineering × Development"', () => {
      render(<Hero />);
      expect(screen.getByText(/Engineering × Development/i)).toBeDefined();
    });

    it('should display the tagline', () => {
      render(<Hero />);
      expect(screen.getByText(/high-performance solutions/i)).toBeDefined();
      expect(screen.getByText(/African innovation/i)).toBeDefined();
    });
  });

  describe('Role Rotation', () => {
    it('should display initial role "Mechanical Engineer"', () => {
      render(<Hero />);
      expect(screen.getByText('Mechanical Engineer')).toBeDefined();
    });

    it('should display the engineer icon ⚙️', () => {
      render(<Hero />);
      expect(screen.getByText('⚙️')).toBeDefined();
    });

    it('should rotate to "Full-Stack Developer" after 3.5 seconds', async () => {
      render(<Hero />);
      
      // Initial role
      expect(screen.getByText('Mechanical Engineer')).toBeDefined();
      
      // Advance time by 3.5 seconds
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3500);
      });
      
      // Should now show second role
      expect(screen.getByText('Full-Stack Developer')).toBeDefined();
    });

    it('should rotate to "Problem Solver" after 7 seconds', async () => {
      render(<Hero />);
      
      // Advance time by 7 seconds
      await act(async () => {
        await vi.advanceTimersByTimeAsync(7000);
      });
      
      // Should now show third role
      expect(screen.getByText('Problem Solver')).toBeDefined();
    });

    it('should cycle back to "Mechanical Engineer" after all roles', async () => {
      render(<Hero />);
      
      // Complete one full cycle (3 roles × 3.5 seconds)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10500);
      });
      
      // Should cycle back to first role
      expect(screen.getByText('Mechanical Engineer')).toBeDefined();
    });

    it('should set up an interval for role rotation', () => {
      render(<Hero />);
      expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 3500);
    });

    it('should clean up interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = render(<Hero />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('CTA Buttons', () => {
    it('should render "View My Work" button', () => {
      render(<Hero />);
      expect(screen.getByText(/View My Work/i)).toBeDefined();
    });

    it('should render "Let\'s Talk" button', () => {
      render(<Hero />);
      expect(screen.getByText(/Let's Talk/i)).toBeDefined();
    });

    it('should have accessible button elements', () => {
      render(<Hero />);
      const buttons = screen.getAllByRole('button');
      
      // Should have 3 buttons: View My Work, Let's Talk, and scroll indicator
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should call scrollToSection with "projects" when "View My Work" is clicked', async () => {
      mockScrollToSection.mockClear();
      render(<Hero />);
      
      const viewWorkButton = screen.getByText(/View My Work/i).closest('button');
      viewWorkButton.click();
      
      expect(mockScrollToSection).toHaveBeenCalled();
    });

    it('should call scrollToSection with "contact" when "Let\'s Talk" is clicked', async () => {
      mockScrollToSection.mockClear();
      render(<Hero />);
      
      const contactButton = screen.getByText(/Let's Talk/i).closest('button');
      contactButton.click();
      
      expect(mockScrollToSection).toHaveBeenCalled();
    });
  });

  describe('Stats Section', () => {
    it('should display all three stats', () => {
      render(<Hero />);
      
      expect(screen.getByText('Years Experience')).toBeDefined();
      expect(screen.getByText('Projects Completed')).toBeDefined();
      expect(screen.getByText('Technologies')).toBeDefined();
    });

    it('should display correct stat values', () => {
      render(<Hero />);
      
      expect(screen.getByText('3+')).toBeDefined();
      expect(screen.getByText('10+')).toBeDefined();
      expect(screen.getByText('15+')).toBeDefined();
    });

    it('should render stats in a grid layout', () => {
      const { container } = render(<Hero />);
      const statsGrid = container.querySelector('.grid-cols-3');
      
      expect(statsGrid).toBeDefined();
    });
  });

  describe('Scroll Indicator', () => {
    it('should display scroll indicator text', () => {
      render(<Hero />);
      expect(screen.getByText('SCROLL TO EXPLORE')).toBeDefined();
    });

    it('should call scrollToSection with "skills" when clicked', async () => {
      mockScrollToSection.mockClear();
      render(<Hero />);
      
      const scrollIndicator = screen.getByText('SCROLL TO EXPLORE').closest('div');
      scrollIndicator.click();
      
      expect(mockScrollToSection).toHaveBeenCalled();
    });

    it('should have cursor-pointer class for interactivity', () => {
      render(<Hero />);
      const scrollIndicator = screen.getByText('SCROLL TO EXPLORE').closest('div');
      
      expect(scrollIndicator.className).toContain('cursor-pointer');
    });
  });

  describe('Accessibility', () => {
    it('should render as a semantic section element', () => {
      const { container } = render(<Hero />);
      const section = container.querySelector('section');
      expect(section.tagName).toBe('SECTION');
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<Hero />);
      const h1 = container.querySelector('h1');
      
      expect(h1).toBeDefined();
      expect(h1.textContent).toContain('Karisa');
    });

    it('should have interactive elements that are keyboard accessible', () => {
      render(<Hero />);
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Visual Elements', () => {
    it('should have African pattern background', () => {
      const { container } = render(<Hero />);
      const section = container.querySelector('section');
      
      expect(section.style.backgroundImage).toContain('data:image/svg+xml');
    });

    it('should render animated background blobs', () => {
      const { container } = render(<Hero />);
      const blobs = container.querySelectorAll('.blur-3xl');
      
      // Should have 3 background blobs
      expect(blobs.length).toBe(3);
    });

    it('should display icons for each role', async () => {
      render(<Hero />);
      
      // Engineer icon
      expect(screen.getByText('⚙️')).toBeDefined();
      
      // Advance to developer role
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3500);
      });
      expect(screen.getByText('💻')).toBeDefined();
      
      // Advance to problem solver role
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3500);
      });
      expect(screen.getByText('🎯')).toBeDefined();
    });
  });
});
