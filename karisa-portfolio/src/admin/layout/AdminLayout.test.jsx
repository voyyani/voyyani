import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from './AdminLayout';

const renderAt = (path, onLogout = vi.fn()) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout user={{ email: 'karisa@example.com' }} onLogout={onLogout} />}>
          <Route index element={<p>overview page</p>} />
          <Route path="submissions" element={<p>submissions page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('AdminLayout', () => {
  it('renders the routed page through its outlet', () => {
    renderAt('/admin/submissions');
    expect(screen.getByText('submissions page')).toBeInTheDocument();
  });

  it('marks the current section in the navigation', () => {
    renderAt('/admin/submissions');
    const current = screen.getAllByRole('link', { name: /submissions/i }).find((l) => l.getAttribute('aria-current') === 'page');
    expect(current).toBeTruthy();
    const overview = screen.getAllByRole('link', { name: /overview/i })[0];
    expect(overview).not.toHaveAttribute('aria-current');
  });

  it('mounts a toaster region so admin toasts are visible', async () => {
    renderAt('/admin');
    // sonner renders nothing until a toast exists, so fire one and look for it.
    toast('Reply sent');
    expect(await screen.findByText('Reply sent')).toBeInTheDocument();
    expect(document.querySelector('[data-sonner-toaster]')).toBeTruthy();
  });

  it('signs out from the top bar', async () => {
    const onLogout = vi.fn();
    renderAt('/admin', onLogout);
    await userEvent.click(screen.getAllByRole('button', { name: /sign out/i })[0]);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
