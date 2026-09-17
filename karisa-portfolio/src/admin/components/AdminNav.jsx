import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import Icon from './Icon';

export const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: 'overview', end: true },
  { to: '/admin/submissions', label: 'Submissions', icon: 'inbox' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'chart' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

export function NavLinks({ onNavigate }) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink to={item.to} end={item.end} onClick={onNavigate} className="adm-nav-link">
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/**
 * The admin's top bar: the sheet's one seam. Below lg the section links live in a
 * disclosure panel under it; at lg+ AdminLayout renders NavLinks in a side column.
 */
export default function AdminNav({ user, onLogout, open, onToggle, onNavigate }) {
  return (
    <div className="adm-topbar">
      <div className="mx-auto flex h-14 max-w-sheet items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onToggle} aria-expanded={open} aria-controls="admin-nav-panel" aria-label={open ? 'Close navigation' : 'Open navigation'} className="btn-quiet px-2 lg:hidden">
            <Icon name={open ? 'close' : 'menu'} />
          </button>
          <Link to="/admin" className="font-display text-[1.0625rem] font-bold text-mark-900">
            Voyani <span className="font-sans text-sm font-medium text-mark-500">admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden truncate text-sm text-mark-700 sm:inline" title={user?.email}>{user?.email}</span>
          <button type="button" onClick={onLogout} className="btn-quiet">
            <Icon name="signout" className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
            <span className="sr-only sm:hidden">Sign out</span>
          </button>
        </div>
      </div>
      <nav id="admin-nav-panel" aria-label="Admin sections" className={`${open ? 'block' : 'hidden'} border-t border-cloth-300 bg-cloth-50 px-4 py-3 lg:hidden`}>
        <NavLinks onNavigate={onNavigate} />
      </nav>
    </div>
  );
}
