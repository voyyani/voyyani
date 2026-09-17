import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import AnalyticsPage from './AnalyticsPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('AnalyticsPage', () => {
  it('shows computed deltas and never a placeholder', async () => {
    const now = new Date();
    const d = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
    const client = createMockClient({ tables: {
      submissions: { data: [{ id: '1', status: 'new', priority: 'normal', created_at: d(2), responded_at: null }, { id: '2', status: 'responded', priority: 'high', created_at: d(3), responded_at: d(2) }, { id: '3', status: 'closed', priority: 'normal', created_at: d(40), responded_at: null }], error: null },
      submission_replies: { data: [{ id: 'r', created_at: d(2), email_status: 'delivered' }], error: null },
      inbound_replies: { data: [], error: null },
    } });
    render(<MemoryRouter><AnalyticsPage client={client} /></MemoryRouter>);
    expect(await screen.findByText(/\+100% vs previous 30 days/i)).toBeInTheDocument();
    expect(screen.queryByText(/coming/i)).toBeNull();
    expect(screen.queryByText(/\+12%/)).toBeNull();
    expect(screen.getByRole('img', { name: /submissions per day/i })).toBeInTheDocument();
  });
});
