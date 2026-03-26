import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminNavbar = ({ user, onLogout, onToggleSidebar }) => {
  const handleLogout = async () => {
    try {
      onLogout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-[#0a1929] border-b border-[#005792]/30 sticky top-0 z-40"
    >
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left side - Logo and toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-[#005792]/20 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#61DAFB] to-[#005792]">
            Admin Dashboard
          </h1>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-right">
                <p className="text-sm text-gray-200">{user.email}</p>
                <p className="text-xs text-[#61DAFB]">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#61DAFB] to-[#005792] flex items-center justify-center">
                <span className="text-white font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-200 hover:bg-[#005792]/20 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default AdminNavbar;
