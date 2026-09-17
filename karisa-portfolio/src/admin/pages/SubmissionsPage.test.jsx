import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import SubmissionsPage from './SubmissionsPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const rows = [
  { id: '1', name: 'Amina Yusuf', email: 'amina@example.com', subject: 'Website for a clinic', status: 'new', priority: 'normal', archived: false, created_at: '2026-09-15T10:00:00Z', submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [] },
  { id: '2', name: 'Brian Otieno', email: 'brian@example.com', subject: 'Property listings', status: 'responded', priority: 'high', archived: false, created_at: '2026-09-14T10:00:00Z', submission_replies: [{ count: 1 }], inbound_replies: [{ id: 'i1', is_read: false, received_at: '2026-09-16T10:00:00Z', status: 'processed' }], submission_labels: [] },
  { id: '3', name: 'Closed One', email: 'c@example.com', subject: 'Old', status: 'closed', priority: 'low', archived: true, created_at: '2026-09-01T10:00:00Z', submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [] },
];

const renderPage = (search = '') => {
  const client = createMockClient({ tables: { submissions: { data: rows, error: null }, labels: { data: [], error: null } } });
  render(
    <MemoryRouter initialEntries={[`/admin/submissions${search}`]}>
      <Routes><Route path="/admin/submissions" element={<SubmissionsPage client={client} />} /></Routes>
    </MemoryRouter>
  );
  return client;
};

describe('SubmissionsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists active submissions newest first with state marks and links', async () => {
    renderPage();
    const table = await screen.findByRole('table');
    const links = within(table).getAllByRole('link', { name: /amina|brian/i });
    expect(links[0]).toHaveAttribute('href', '/admin/submissions/1');
    expect(within(table).queryByText('Closed One')).toBeNull();
    expect(within(table).getAllByText('Awaiting you').length).toBe(2);
  });

  it('reads filters from the URL', async () => {
    renderPage('?status=responded');
    const table = await screen.findByRole('table');
    expect(within(table).queryByText('Amina Yusuf')).toBeNull();
    expect(within(table).getByText('Brian Otieno')).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toHaveValue('responded');
  });

  it('offers to clear filters when nothing matches', async () => {
    renderPage('?q=zzz');
    expect(await screen.findByText(/no submissions match/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    const table = await screen.findByRole('table');
    expect(within(table).getByText('Amina Yusuf')).toBeInTheDocument();
  });

  it('subscribes to live changes and polls as a fallback', async () => {
    const client = renderPage();
    await screen.findByRole('table');
    expect(client.channel).toHaveBeenCalledWith('admin-submissions');
    expect(client._channel.subscribe).toHaveBeenCalled();
  });

  it('asks before a bulk delete', async () => {
    const client = renderPage();
    const table = await screen.findByRole('table');
    await userEvent.click(within(table).getByRole('checkbox', { name: /select amina/i }));
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(screen.getByRole('button', { name: /confirm delete 1/i })).toBeInTheDocument();
  });
});
