import React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminNavbar = ({ user, onLogout, onToggleSidebar, isMobile }) => {
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
      className="bg-[#0a1929] border-b border-[#005792]/30 sticky top-0 z-40 h-16 sm:h-16"
    >
      <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between h-full">
        {/* Left side - Logo and toggle */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Hamburger button - visible on mobile */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 hover:bg-[#005792]/20 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-gray-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo - responsive sizing and truncation */}
          <h1 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#61DAFB] to-[#005792] truncate">
            Admin Dashboard
          </h1>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {user && (
            <>
              {/* User info - hidden on small screens */}
              <div className="hidden sm:block text-right">
                <p className="text-xs sm:text-sm text-gray-200 truncate max-w-xs">
                  {user.email}
                </p>
                <p className="text-xs text-[#61DAFB]">Administrator</p>
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#61DAFB] to-[#005792] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>

              {/* Logout button - hidden on mobile, visible on sm and up */}
              <button
                onClick={handleLogout}
                className="hidden sm:inline-block px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-200 hover:bg-[#005792]/20 rounded-lg transition-colors flex-shrink-0"
              >
                Logout
              </button>

              {/* Mobile logout button - only on mobile as icon */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 hover:bg-[#005792]/20 rounded-lg transition-colors flex-shrink-0"
                aria-label="Logout"
              >
                <svg
                  className="w-5 h-5 text-gray-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default AdminNavbar;
