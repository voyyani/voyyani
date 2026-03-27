import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../utils/responsiveHelpers';

/**
 * ResponsiveModal - Reusable base component for responsive modals
 *
 * Features:
 * - Full-screen on mobile, centered on desktop
 * - Viewport-based sizing
 * - Safe area support for notched devices
 * - Different animations: slide-up on mobile, scale on desktop
 * - Respects prefers-reduced-motion accessibility preference
 * - Consistent close behavior
 */
const ResponsiveModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  closeButton = true,
  showBackdrop = true,
  zIndex = 50,
  className = '',
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Size configurations for different breakpoints
  const sizeClasses = {
    sm: 'max-w-xs sm:max-w-sm',
    md: 'max-w-xs sm:max-w-sm md:max-w-2xl',
    lg: 'max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl',
    xl: 'max-w-xs sm:max-w-sm md:max-w-3xl lg:max-w-5xl',
    full: 'max-w-full sm:max-w-full md:max-w-4xl',
  };

  const getModalContainerClass = () => {
    if (position === 'bottom') {
      return 'fixed bottom-0 left-0 right-0 w-full sm:max-w-2xl sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 rounded-t-lg sm:rounded-lg';
    }
    return `${sizeClasses[size]} w-full mx-auto rounded-lg`;
  };

  const containerVariants = {
    hidden: position === 'bottom'
      ? { y: '100%', opacity: 0 }
      : { scale: 0.95, opacity: 0 },
    visible: position === 'bottom'
      ? { y: 0, opacity: 1 }
      : { scale: 1, opacity: 1 },
    exit: position === 'bottom'
      ? { y: '100%', opacity: 0 }
      : { scale: 0.95, opacity: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-0 bg-black/50 z-${zIndex} flex ${
            position === 'bottom' ? 'items-end justify-center pb-0 sm:items-center sm:pb-0' : 'items-center justify-center'
          } p-4 backdrop-blur`}
          onClick={onClose}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
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
            className={`bg-[#0a1929] border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto ${getModalContainerClass()} ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            {(title || closeButton) && (
              <div className="sticky top-0 bg-[#0a1929] border-b border-white/10 p-4 sm:p-5 md:p-6 flex items-center justify-between">
                {title && (
                  <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                    {title}
                  </h2>
                )}
                <div className="flex-1" />
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 ml-4 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
                    aria-label="Close modal"
                  >
                    <span className="text-2xl">✕</span>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="pb-4 sm:pb-5 md:pb-6">
              {children}
            </div>

            {/* Safe area bottom padding for notched devices */}
            <div className="h-4 sm:h-5" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResponsiveModal;
