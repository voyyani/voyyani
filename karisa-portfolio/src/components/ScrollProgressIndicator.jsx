import React from 'react';
import { motion } from 'framer-motion';
import { useScrollProgress } from '../hooks/useScrollAnimation';

const ScrollProgressIndicator = () => {
  const scrollProgress = useScrollProgress();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#61DAFB] via-[#005792] to-[#61DAFB] origin-left z-50"
      style={{ scaleX: scrollProgress / 100 }}
      initial={{ scaleX: 0 }}
      transition={{ duration: 0.1 }}
    />
  );
};

export default ScrollProgressIndicator;
