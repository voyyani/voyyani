import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Philosophy = () => {
  const principles = [
    {
      icon: "⚙️",
      title: "Precision Tolerances",
      description: "→ Pixel-perfect UI implementation",
      color: "#61DAFB"
    },
    {
      icon: "📐",
      title: "Structural Analysis",
      description: "→ Robust application architecture",
      color: "#3ECF8E"
    },
    {
      icon: "🔥",
      title: "Thermal Management",
      description: "→ Performance optimization",
      color: "#FF9900"
    },
    {
      icon: "🧪",
      title: "Material Testing",
      description: "→ Comprehensive QA processes",
      color: "#646CFF"
    }
  ];

  // African-inspired pattern as base64
  const africanPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23005291' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <section 
      id="philosophy" 
      className="py-12 md:py-20 px-4 md:px-8 relative overflow-hidden"
      style={{ backgroundImage: `url("${africanPattern}")` }}
    >
      {/* African-inspired decorative elements */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#D4A017] rounded-full mix-blend-multiply blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#008751] rounded-full mix-blend-multiply blur-xl"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-bold mb-4 relative inline-block"
          >
            Engineering-Driven Development
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-0.5 md:h-1 bg-[#D4A017] rounded-full"></div>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base"
          >
            Applying mechanical precision to digital solutions, inspired by African ingenuity
          </motion.p>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-[#0a1929]/90 to-[#061220]/90 backdrop-blur-sm border border-[#005792]/20 rounded-2xl p-6 md:p-10 overflow-hidden"
          >
            {/* African-inspired top accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#005792] via-[#D4A017] to-[#008751]"></div>
            
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl md:text-2xl text-center mb-8 md:mb-12 text-gray-200 font-medium"
            >
              Engineering Principles → Development Practices
            </motion.h3>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {principles.map((principle, index) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.2 + (index * 0.1),
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: `0 10px 20px -5px ${principle.color}20`
                  }}
                  className="bg-[#061220]/80 p-5 rounded-xl border border-[#005792]/20 hover:border-[#D4A017]/50 transition-all flex-1 min-w-[250px] max-w-[300px]"
                >
                  <div className="flex items-start mb-4">
                    <div className="text-3xl mr-3">{principle.icon}</div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-100">{principle.title}</h4>
                      <div className="w-12 h-0.5 bg-[#D4A017] mt-1 mb-2"></div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm pl-9">{principle.description}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-10 md:mt-12 p-5 md:p-6 border-l-4 border-[#D4A017] bg-[#061220]/50 rounded-r-xl"
            >
              <p className="text-gray-300 italic text-sm md:text-base">
                "Applying mechanical precision to digital solutions: I build applications with the same rigor as engineering physical systems. Performance optimization creates efficient, maintainable systems that withstand real-world demands - much like the enduring innovations from Africa that stand the test of time."
              </p>
              <div className="flex items-center mt-4">
                <div className="h-px flex-1 bg-gradient-to-r from-[#D4A017] to-transparent mr-3"></div>
                <span className="text-[#D4A017] text-sm font-medium">Engineering Heritage</span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Philosophy;