import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../utils/responsiveHelpers';

/**
 * MobileDrawer - Reusable mobile drawer component
 *
 * Features:
 * - Slide-in from left or right
 * - Mobile-first (hidden on md+, visible only on mobile)
 * - Safe area support for notched devices
 * - Swipe gesture detection
 * - Overlay backdrop with click-to-close
 * - Focus management and keyboard handling
 * - Respects prefers-reduced-motion accessibility preference
 * - Header with optional title + close button
 * - Footer with optional action buttons
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - title?: string
 * - position?: 'left' | 'right' (default: 'left')
 * - children: React.ReactNode
 * - footer?: React.ReactNode
 * - zIndex?: number (default: 50)
 * - className?: string
 * - showOverlay?: boolean (default: true)
 * - overlayBlur?: boolean (default: true)
 */
const MobileDrawer = ({
  isOpen,
  onClose,
  title,
  position = 'left',
  children,
  footer,
  zIndex = 50,
  className = '',
  showOverlay = true,
  overlayBlur = true,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const drawerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle swipe gesture
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const swipeDistance = touchStartX.current - touchEndX.current;

    // Swipe threshold: 50px
    if (position === 'left' && swipeDistance > 50) {
      onClose();
    } else if (position === 'right' && swipeDistance < -50) {
      onClose();
    }
  };

  // Animation variants
  const drawerVariants = {
    hidden: {
      x: position === 'left' ? -512 : 512,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: position === 'left' ? -512 : 512,
      opacity: 0,
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          {showOverlay && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              transition={{ duration: 0.2 }}
              className={`fixed inset-0 z-${zIndex} md:hidden ${overlayBlur ? 'backdrop-blur' : ''}`}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
              onClick={onClose}
            />
          )}

          {/* Drawer Container */}
          <motion.div
            ref={drawerRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={drawerVariants}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    damping: 25,
                    stiffness: 200,
                    duration: 0.3,
                  }
            }
            className={`fixed top-0 ${position}-0 h-screen w-80 bg-[#0a1929] border-r border-white/10 z-${zIndex + 1} md:hidden flex flex-col overflow-hidden ${className}`}
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingRight: position === 'right' ? 'env(safe-area-inset-right)' : undefined,
              paddingLeft: position === 'left' ? 'env(safe-area-inset-left)' : undefined,
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header */}
            {(title) && (
              <div className="sticky top-0 bg-[#0a1929] border-b border-white/10 p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
                  aria-label="Close drawer"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="bg-[#0a1929] border-t border-white/10 p-4 sm:p-5 md:p-6 flex-shrink-0">
                {footer}
              </div>
            )}

            {/* Safe area bottom padding for notched devices */}
            <div
              style={{
                height: 'env(safe-area-inset-bottom)',
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
