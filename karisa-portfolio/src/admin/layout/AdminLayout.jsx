import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminNav, { NavLinks } from '../components/AdminNav';

// Mirrors the public Toaster in App.jsx so a toast looks the same on either surface.
const TOAST_OPTIONS = {
  style: {
    background: '#FAF8F3',
    color: '#14171C',
    border: '1px solid #14171C',
    borderRadius: '0px',
    fontFamily: 'Archivo, system-ui, sans-serif',
  },
  success: { iconTheme: { primary: '#243D8F', secondary: '#FAF8F3' } },
  error: { iconTheme: { primary: '#A32014', secondary: '#FAF8F3' } },
};

const AdminLayout = ({ user, onLogout }) => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cloth-100 text-mark-900">
      <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
      <a href="#admin-main" className="skip-link">Skip to content</a>
      <AdminNav
        user={user}
        onLogout={onLogout}
        open={navOpen}
        onToggle={() => setNavOpen((o) => !o)}
        onNavigate={() => setNavOpen(false)}
      />
      <div className="mx-auto flex w-full max-w-sheet">
        <aside aria-label="Admin sections" className="hidden w-56 shrink-0 border-r border-cloth-300 px-3 py-6 lg:block">
          <NavLinks />
        </aside>
        <main id="admin-main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
