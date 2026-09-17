import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DailyChart from './DailyChart';

describe('DailyChart', () => {
  it('draws one bar per day and describes itself', () => {
    const data = [{ date: '2026-09-15', count: 2 }, { date: '2026-09-16', count: 0 }, { date: '2026-09-17', count: 1 }];
    render(<DailyChart data={data} label="Submissions per day" />);
    const img = screen.getByRole('img', { name: /submissions per day.*3 total.*peak 2 on 15 sep/i });
    expect(img.querySelectorAll('rect[data-bar]')).toHaveLength(3);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  it('says so when there is nothing to draw', () => {
    render(<DailyChart data={[{ date: '2026-09-17', count: 0 }]} label="Submissions per day" />);
    expect(screen.getByText(/no submissions in this period/i)).toBeInTheDocument();
  });
});
