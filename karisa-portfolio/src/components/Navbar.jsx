import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed w-full z-50 py-3 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#061220]/90 backdrop-blur-md border-b border-[#005792]/30' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#61DAFB] animate-pulse"></div>
            <h1 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#61DAFB] to-[#005792]">
              Voyani.tech
            </h1>
          </div>
          
          <div className="hidden md:flex gap-6">
            {['Skills', 'Projects', 'Philosophy', 'Contact'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-300 hover:text-[#61DAFB] transition-colors font-medium"
              >
                {item}
              </a>
            ))}
          </div>
          
          <button 
            onClick={toggleMenu}
            className="md:hidden text-gray-300 z-50"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden fixed top-16 left-0 right-0 bg-[#061220] backdrop-blur-lg border-b border-[#005792]/30 z-40 overflow-hidden"
          >
            <div className="flex flex-col py-4 px-6">
              {['Skills', 'Projects', 'Philosophy', 'Contact'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-300 hover:text-[#61DAFB] py-3 px-4 rounded-lg transition-colors font-medium border-b border-[#005792]/20 last:border-0"
                  onClick={toggleMenu}
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;