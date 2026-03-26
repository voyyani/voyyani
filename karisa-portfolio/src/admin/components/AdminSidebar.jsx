import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      path: '/admin',
      exact: true,
    },
    {
      label: 'Submissions',
      icon: 'inbox',
      path: '/admin/submissions',
    },
    {
      label: 'Analytics',
      icon: 'analytics',
      path: '/admin/analytics',
    },
    {
      label: 'Settings',
      icon: 'settings',
      path: '/admin/settings',
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const iconMap = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9M9 5l3-3m0 0l3 3m-3-3v12" />
      </svg>
    ),
    inbox: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    analytics: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4.5m-16 0h16" />
      </svg>
    ),
  };

  return (
    <motion.aside
      initial={{ x: -64 }}
      animate={{ x: isOpen ? 0 : -64 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-[#0a1929]/80 backdrop-blur border-r border-[#005792]/30 overflow-y-auto z-30"
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => onClose()}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive(item.path, item.exact)
                ? 'bg-gradient-to-r from-[#61DAFB]/20 to-[#005792]/20 text-[#61DAFB] border border-[#61DAFB]/30'
                : 'text-gray-300 hover:bg-[#005792]/10'
            }`}
          >
            {iconMap[item.icon]}
            <span className="font-medium">{item.label}</span>
            {isActive(item.path, item.exact) && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-2 h-2 rounded-full bg-[#61DAFB]"
              />
            )}
          </Link>
        ))}
      </nav>
    </motion.aside>
  );
};

export default AdminSidebar;
