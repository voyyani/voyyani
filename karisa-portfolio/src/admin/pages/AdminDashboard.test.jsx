import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import AdminDashboard from './AdminDashboard';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('AdminDashboard', () => {
  it('shows real figures with no placeholders and links each activity to its thread', async () => {
    const client = createMockClient({ tables: {
      submissions: { data: [{ id: '1', name: 'Amina', email: 'a@e.com', subject: 'Clinic', status: 'new', priority: 'normal', archived: false, created_at: new Date().toISOString(), submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [] }], error: null },
      submission_replies: { data: [], error: null },
      inbound_replies: { data: [], error: null },
    } });
    render(<MemoryRouter><AdminDashboard client={client} /></MemoryRouter>);
    expect(await screen.findByText('Awaiting you')).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).toBeNull();
    expect(screen.getByRole('link', { name: /amina/i })).toHaveAttribute('href', '/admin/submissions/1');
  });
});
