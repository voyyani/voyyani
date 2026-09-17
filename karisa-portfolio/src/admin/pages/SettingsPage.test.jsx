import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import SettingsPage from './SettingsPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const user = { id: 'user-1', email: 'karisa@example.com', app_metadata: { role: 'admin' } };

describe('SettingsPage', () => {
  it('loads notification preferences and saves a change', async () => {
    const client = createMockClient({ tables: {
      notification_settings: { data: { user_id: 'user-1', notify_new_submission: true, notify_reply_pending: false, email_digest: false, digest_frequency: 'daily' }, error: null },
      labels: { data: [{ id: 'l1', name: 'Client', color: '#243D8F', description: null }], error: null },
    } });
    render(<MemoryRouter><SettingsPage client={client} user={user} /></MemoryRouter>);
    const box = await screen.findByLabelText(/email me when a visitor replies/i);
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    await waitFor(() => expect(client.from).toHaveBeenCalledWith('notification_settings'));
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('karisa@example.com')).toBeInTheDocument();
  });
});
