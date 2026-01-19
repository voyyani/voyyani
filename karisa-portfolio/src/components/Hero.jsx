import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmoothScroll } from '../hooks/useScrollAnimation';

const Hero = () => {
  const [currentRole, setCurrentRole] = useState(0);
  const scrollToSection = useSmoothScroll();
  
  const roles = [
    { title: 'Mechanical Engineer', color: 'from-[#005792] to-[#003056]', icon: '⚙️' },
    { title: 'Full-Stack Developer', color: 'from-[#61DAFB] to-[#4A9FBF]', icon: '💻' },
    { title: 'Problem Solver', color: 'from-[#D4A017] to-[#B8860B]', icon: '🎯' }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3500);
    
    return () => clearInterval(interval);
  }, []);

  const africanPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
  
  const stats = [
    { label: 'Years Experience', value: '3+' },
    { label: 'Projects Completed', value: '10+' },
    { label: 'Technologies', value: '15+' }
  ];
  
  return (
    <section 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-20"
      style={{ backgroundImage: `url("${africanPattern}")` }}
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#005792] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.2, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#61DAFB] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-20 right-20 w-64 h-64 bg-[#D4A017] rounded-full blur-3xl"
        />
      </div>
      
      <div className="text-center relative z-10 max-w-5xl w-full">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-6"
        >
          <div className="px-5 py-2.5 rounded-full border-2 border-[#D4A017]/60 bg-[#D4A017]/10 backdrop-blur-sm">
            <span className="text-sm tracking-[0.2em] text-[#D4A017] font-semibold uppercase">
              Engineering × Development
            </span>
          </div>
        </motion.div>
        
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-3 text-white leading-tight">
            Hi, I'm{' '}
            <span className="bg-gradient-to-r from-[#61DAFB] via-[#4FC3F7] to-[#00BCD4] text-transparent bg-clip-text">
              Karisa
            </span>
          </h1>
        </motion.div>
        
        {/* Rotating Role Display */}
        <div className="h-32 md:h-36 flex items-center justify-center mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRole}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-md mx-auto"
            >
              <div className={`px-8 py-5 rounded-2xl backdrop-blur-md bg-gradient-to-r ${roles[currentRole].color} shadow-2xl border border-white/10`}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{roles[currentRole].icon}</span>
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {roles[currentRole].title}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-300 leading-relaxed px-4"
        >
          Crafting{' '}
          <span className="text-[#61DAFB] font-semibold">high-performance solutions</span>
          {' '}with engineering precision, inspired by{' '}
          <span className="text-[#D4A017] font-semibold">African innovation</span>
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
        >
          <motion.button
            onClick={() => scrollToSection('projects')}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(97, 218, 251, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="group bg-gradient-to-r from-[#61DAFB] to-[#00BCD4] text-[#061220] px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              View My Work
              <motion.span
                className="group-hover:translate-x-1 transition-transform"
              >
                →
              </motion.span>
            </span>
          </motion.button>
          
          <motion.button
            onClick={() => scrollToSection('contact')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-[#D4A017] bg-[#D4A017]/5 text-[#D4A017] hover:bg-[#D4A017]/20 px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Let's Talk
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="p-4 rounded-xl bg-[#0a1929]/40 backdrop-blur-sm border border-[#005792]/30"
            >
              <div className="text-2xl md:text-3xl font-bold text-[#61DAFB] mb-1">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-0 right-0 flex justify-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => scrollToSection('skills')}
        >
          <span className="text-xs text-gray-400 mb-2 font-medium tracking-wider">SCROLL TO EXPLORE</span>
          <div className="w-6 h-10 border-2 border-gray-400/50 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-[#61DAFB] rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;