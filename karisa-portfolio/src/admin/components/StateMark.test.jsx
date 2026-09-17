import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StateMark from './StateMark';

describe('StateMark', () => {
  it('renders the word for a submission state as a printed mark', () => {
    render(<StateMark state="in_progress" />);
    const el = screen.getByText('In progress');
    expect(el).toHaveClass('mark-state');
    expect(el).toHaveAttribute('data-state', 'in_progress');
  });

  it('normalises clicked to opened', () => {
    render(<StateMark state="clicked" />);
    expect(screen.getByText('Opened')).toHaveAttribute('data-state', 'opened');
  });

  it('falls back to the raw state when it has no word', () => {
    render(<StateMark state="weird" />);
    expect(screen.getByText('weird')).toBeInTheDocument();
  });

  it('accepts custom children', () => {
    render(<StateMark state="waiting">3 awaiting you</StateMark>);
    expect(screen.getByText('3 awaiting you')).toHaveAttribute('data-state', 'waiting');
  });
});
