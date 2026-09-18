import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import SubmissionDetailPage from './SubmissionDetailPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const ID = '11111111-1111-4111-8111-111111111111';
const submission = { id: ID, name: 'Amina', email: 'amina@example.com', phone: null, subject: 'Clinic site', message: 'Hello there', status: 'new', priority: 'normal', notes: '', archived: false, responded_at: null, created_at: '2026-09-10T10:00:00Z' };
const inbound = [{ id: 'i1', submission_id: ID, from_email: 'amina@example.com', from_name: 'Amina', subject: 'Re', body_text: 'Great', body_html: null, received_at: '2026-09-11T09:00:00Z', is_read: false, is_important: false, status: 'processed', spam_score: 0, spam_reasons: null, sender_verified: true, inbound_attachments: [] }];

const renderPage = (tables = {}) => {
  const client = createMockClient({
    tables: {
      submissions: { data: submission, error: null },
      submission_replies: { data: [], error: null },
      inbound_replies: { data: inbound, error: null },
      labels: { data: [], error: null },
      submission_labels: { data: [], error: null },
      ...tables,
    },
  });
  render(
    <MemoryRouter initialEntries={[`/admin/submissions/${ID}`]}>
      <Routes><Route path="/admin/submissions/:id" element={<SubmissionDetailPage client={client} />} /></Routes>
    </MemoryRouter>
  );
  return client;
};

describe('SubmissionDetailPage', () => {
  beforeEach(() => { vi.clearAllMocks(); globalThis.fetch = vi.fn(); });

  it('loads the thread by route id and marks unread inbound as read', async () => {
    const client = renderPage();
    expect(await screen.findByRole('heading', { name: 'Clinic site' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    await waitFor(() => expect(client.rpc).toHaveBeenCalledWith('mark_inbound_reply_read', { p_reply_id: 'i1', p_user_id: 'user-1' }));
  });

  it('sends a reply through send-reply with the session token, never logging it', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    globalThis.fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    renderPage();
    await screen.findByRole('heading', { name: 'Clinic site' });
    await userEvent.type(screen.getByLabelText(/your reply/i), 'Happy to help — can we talk on Thursday?');
    await userEvent.click(screen.getByRole('button', { name: /send reply/i }));
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    const [url, init] = globalThis.fetch.mock.calls[0];
    expect(url).toMatch(/\/functions\/v1\/send-reply$/);
    expect(init.headers.Authorization).toBe('Bearer token');
    expect(JSON.parse(init.body)).toMatchObject({ submission_id: ID, reply_type: 'manual' });
    expect(log.mock.calls.flat().join(' ')).not.toMatch(/token/i);
    log.mockRestore();
  });

  it('shows a not-found state for an unknown id', async () => {
    renderPage({ submissions: { data: null, error: { message: 'Row not found', code: 'PGRST116' } } });
    expect(await screen.findByText(/no submission with that id/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to submissions/i })).toHaveAttribute('href', '/admin/submissions');
  });
});
