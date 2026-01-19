import React from 'react';
import { motion } from 'framer-motion';

// Spinner Loader
export const Spinner = ({ size = 'md', color = '#61DAFB' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizes[size]} border-3 border-t-transparent rounded-full`}
        style={{ borderColor: `${color}40`, borderTopColor: color }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

// Full Page Loader
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061220] to-[#0a1929] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Spinner size="xl" />
          <p className="text-gray-400 mt-4">{message}</p>
        </motion.div>
      </div>
    </div>
  );
};

// Section Loader
export const SectionLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Spinner size="lg" />
      <p className="text-gray-400 mt-4">{message}</p>
    </div>
  );
};

// Skeleton Loader for Cards
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-[#0a1929]/50 rounded-2xl p-6">
        <div className="h-48 bg-[#061220]/50 rounded-xl mb-4" />
        <div className="h-4 bg-[#061220]/50 rounded w-3/4 mb-2" />
        <div className="h-4 bg-[#061220]/50 rounded w-1/2" />
      </div>
    </div>
  );
};

// Inline Loader
export const InlineLoader = ({ text = 'Processing...', className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Spinner size="sm" />
      <span className="text-sm text-gray-400">{text}</span>
    </div>
  );
};

// Button Loader
export const ButtonLoader = () => {
  return (
    <svg 
      className="animate-spin h-5 w-5" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Progress Bar
export const ProgressBar = ({ progress = 0, className = '' }) => {
  return (
    <div className={`w-full bg-[#061220] rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-[#61DAFB] to-[#00BCD4]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

export default {
  Spinner,
  PageLoader,
  SectionLoader,
  SkeletonCard,
  InlineLoader,
  ButtonLoader,
  ProgressBar
};
