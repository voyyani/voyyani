import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const signInWithPassword = vi.fn();
vi.mock('../../lib/supabase', () => ({ supabase: { auth: { signInWithPassword: (...a) => signInWithPassword(...a) } } }));
const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));

import AdminLogin from './AdminLogin';

describe('AdminLogin', () => {
  beforeEach(() => { signInWithPassword.mockReset(); navigate.mockReset(); });

  it('has no leftover demo copy', () => {
    render(<MemoryRouter><AdminLogin /></MemoryRouter>);
    expect(screen.queryByText(/demo/i)).toBeNull();
  });

  it('validates before calling Supabase and announces the error', async () => {
    render(<MemoryRouter><AdminLogin /></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('signs in and navigates to /admin', async () => {
    signInWithPassword.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });
    render(<MemoryRouter><AdminLogin /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/email/i), 'k@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/admin'));
  });

  it('shows the auth error inline', async () => {
    signInWithPassword.mockResolvedValue({ data: null, error: new Error('Invalid login credentials') });
    render(<MemoryRouter><AdminLogin /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/email/i), 'k@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid login credentials/i);
  });
});
