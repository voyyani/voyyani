import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout = ({ children, supabaseClient, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // Auto-close sidebar on mobile
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061220] to-[#0a1929]">
      {/* Admin Header - Fixed at top */}
      <AdminNavbar
        user={user}
        onLogout={onLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      {/* Main layout container */}
      <div className="flex relative">
        {/* Desktop Sidebar - Always visible on desktop, hidden on mobile */}
        <div className="hidden md:block">
          <AdminSidebar
            isOpen={true}
            onClose={() => setSidebarOpen(false)}
            isDesktop={true}
          />
        </div>

        {/* Mobile Sidebar - Full-screen overlay */}
        <AnimatePresence mode="wait">
          {isMobile && sidebarOpen && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/50 z-20 md:hidden"
              />
              {/* Mobile sidebar overlay */}
              <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isDesktop={false}
              />
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 w-full md:w-auto overflow-hidden"
        >
          {/* Responsive padding: smaller on mobile, larger on desktop */}
          <div className="p-4 sm:p-6 md:p-6 lg:p-8 min-h-[calc(100vh-64px)]">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
