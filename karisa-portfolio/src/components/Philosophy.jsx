import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Philosophy = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  const principles = [
    {
      icon: "⚙️",
      title: "Precision Engineering",
      subtitle: "Tolerances → Code Quality",
      description: "Just as mechanical engineers measure in microns, I craft pixel-perfect interfaces with meticulous attention to detail. Every component is engineered for optimal performance.",
      metric: "99.9% Accuracy",
      color: "#61DAFB",
      gradient: "from-[#61DAFB] to-[#00BCD4]"
    },
    {
      icon: "📐",
      title: "Structural Integrity",
      subtitle: "Analysis → Architecture",
      description: "Building robust application architectures using the same principles as structural engineering. Creating systems that scale gracefully under load.",
      metric: "Zero Downtime",
      color: "#3ECF8E",
      gradient: "from-[#3ECF8E] to-[#2AA876]"
    },
    {
      icon: "🔥",
      title: "Performance Optimization",
      subtitle: "Efficiency → Speed",
      description: "Applying thermodynamics principles to code optimization. Eliminating bottlenecks and maximizing efficiency, just like optimizing heat transfer in engines.",
      metric: "-40% Load Time",
      color: "#FF9900",
      gradient: "from-[#FF9900] to-[#FF6600]"
    },
    {
      icon: "🧪",
      title: "Quality Assurance",
      subtitle: "Testing → Reliability",
      description: "Implementing rigorous testing protocols inspired by material science. Every feature undergoes comprehensive validation before deployment.",
      metric: "100% Coverage",
      color: "#D4A017",
      gradient: "from-[#D4A017] to-[#B8860B]"
    }
  ];

  const africanPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23005291' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <motion.section 
      id="philosophy" 
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
      }}
      className="py-20 px-4 md:px-8 relative overflow-hidden"
      style={{ backgroundImage: `url("${africanPattern}")` }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4A017] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.2, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-[#008751] rounded-full blur-3xl"
        />
      </div>
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full border-2 border-[#D4A017]/60 bg-[#D4A017]/10 text-[#D4A017] text-sm font-semibold tracking-[0.2em] uppercase">
              Core Philosophy
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Engineering{' '}
            <span className="bg-gradient-to-r from-[#D4A017] via-[#FFD700] to-[#B8860B] text-transparent bg-clip-text">
              Principles
            </span>
          </h2>
          
          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Merging{' '}
            <span className="text-[#D4A017] font-semibold">mechanical precision</span>
            {' '}with{' '}
            <span className="text-[#61DAFB] font-semibold">modern development</span>
            , inspired by{' '}
            <span className="text-[#008751] font-semibold">African ingenuity</span>
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side: Principle Cards */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -20 },
              visible: { opacity: 1, x: 0 }
            }}
            className="space-y-4"
          >
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className={`group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                  activeIndex === index
                    ? `border-[${principle.color}] bg-gradient-to-br ${principle.gradient} shadow-2xl`
                    : 'border-[#005792]/30 bg-[#061220]/60 hover:border-[#005792]/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    animate={activeIndex === index ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`text-5xl ${activeIndex === index ? 'drop-shadow-lg' : ''}`}
                  >
                    {principle.icon}
                  </motion.div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`text-xl font-bold ${activeIndex === index ? 'text-white' : 'text-gray-200'}`}>
                        {principle.title}
                      </h3>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: activeIndex === index ? 1 : 0 }}
                        className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white"
                      >
                        {principle.metric}
                      </motion.div>
                    </div>
                    
                    <p className={`text-sm font-medium mb-2 ${activeIndex === index ? 'text-white/90' : 'text-gray-400'}`}>
                      {principle.subtitle}
                    </p>
                    
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={activeIndex === index ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className={`text-sm leading-relaxed ${activeIndex === index ? 'text-white/80' : 'text-gray-500'}`}>
                        {principle.description}
                      </p>
                    </motion.div>

                    {activeIndex !== index && (
                      <motion.div 
                        className="flex items-center gap-2 text-[#61DAFB] text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Learn more
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Side: Visual Display */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 20 },
              visible: { opacity: 1, x: 0 }
            }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                transition={{ duration: 0.5 }}
                className={`p-8 rounded-3xl bg-gradient-to-br ${principles[activeIndex].gradient} shadow-2xl`}
              >
                {/* Large Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="text-9xl text-center mb-6 drop-shadow-2xl"
                >
                  {principles[activeIndex].icon}
                </motion.div>

                {/* Title */}
                <h3 className="text-3xl font-bold text-white text-center mb-3">
                  {principles[activeIndex].title}
                </h3>
                
                <div className="flex justify-center mb-6">
                  <div className="h-1 w-24 bg-white/40 rounded-full" />
                </div>

                {/* Description */}
                <p className="text-white/90 text-center text-lg leading-relaxed mb-6">
                  {principles[activeIndex].description}
                </p>

                {/* Metric Badge */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30"
                  >
                    <div className="text-white font-bold text-2xl text-center">
                      {principles[activeIndex].metric}
                    </div>
                    <div className="text-white/80 text-xs text-center uppercase tracking-wider">
                      Performance Target
                    </div>
                  </motion.div>
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {principles.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        activeIndex === index ? 'bg-white w-8' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-[#061220]/80 to-[#0a1929]/80 border-2 border-[#D4A017]/40 backdrop-blur-sm relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-4 left-4 text-6xl text-[#D4A017]/20">
              "
            </div>
            <div className="absolute bottom-4 right-4 text-6xl text-[#D4A017]/20 rotate-180">
              "
            </div>
            
            <div className="relative">
              <p className="text-gray-300 italic text-lg md:text-xl leading-relaxed text-center mb-4">
                Applying mechanical precision to digital solutions: I build applications with the same rigor as engineering physical systems. Performance optimization creates efficient, maintainable systems that withstand real-world demands—much like the enduring innovations from Africa that stand the test of time.
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4A017]" />
                <span className="text-[#D4A017] text-sm font-semibold tracking-wider uppercase">
                  Engineering Heritage
                </span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4A017]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Philosophy;