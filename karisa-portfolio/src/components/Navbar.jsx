import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 py-4 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#061220]/90 backdrop-blur-md border-b border-[#005792]/30' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#61DAFB] animate-pulse"></div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#61DAFB] to-[#005792]">
            Voyani.tech
          </h1>
        </div>
        
        <div className="hidden md:flex gap-8">
          {['Skills', 'Projects', 'Philosophy', 'Contact'].map((item) => (
            <a 
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-precision-silver hover:text-[#61DAFB] transition-colors font-medium"
            >
              {item}
            </a>
          ))}
        </div>
        
        <button className="md:hidden text-[#C0C0C0]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;