import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const [currentRole, setCurrentRole] = useState('engineer');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole(prev => prev === 'engineer' ? 'developer' : 'engineer');
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const africanPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
  
  return (
    <section 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-16 md:py-12"
      style={{ backgroundImage: `url("${africanPattern}")` }}
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#005792] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#61DAFB] rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#D4A017] rounded-full mix-blend-multiply blur-xl opacity-10"></div>
      </div>
      
      <div className="text-center relative z-10 max-w-4xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-4 md:mb-6 px-4 py-2 rounded-full border-2 border-[#D4A017]/60"
        >
          <span className="text-sm tracking-widest text-[#D4A017] font-medium">
            ENGINEERING MEETS DEVELOPMENT
          </span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white"
        >
          Hi, I'm <span className="text-[#61DAFB]">Karisa</span>
        </motion.h1>
        
        <div className="h-24 md:h-28 flex items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`text-xl md:text-2xl px-6 py-3 rounded-lg w-full max-w-xs mx-auto ${
                currentRole === 'engineer'
                  ? 'bg-[#005792]/30 border border-[#005792]/50'
                  : 'bg-[#61DAFB]/20 border border-[#61DAFB]/40'
              }`}
            >
              {currentRole === 'engineer' ? 'Mechanical Engineer' : 'Full-Stack Developer'}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto text-gray-300 px-4"
        >
          Crafting high-performance solutions with engineering precision, inspired by African innovation
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <a 
            href="#projects" 
            className="bg-gradient-to-r from-[#005792] to-[#004274] hover:from-[#004274] hover:to-[#003258] text-white px-6 py-3 md:px-8 md:py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            View My Work
          </a>
          <a 
            href="#contact" 
            className="border-2 border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017]/10 px-6 py-3 md:px-8 md:py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Get In Touch
          </a>
        </motion.div>
      </div>
      
      <motion.div 
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="animate-bounce flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-1">Scroll to explore</span>
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;