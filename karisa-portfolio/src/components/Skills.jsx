import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { trackEvent } from '../utils/analytics';

// Skill data organized by category with icons
const SKILLS_DATA = {
  'Frontend Mastery': {
    icon: '⚛️',
    description: 'Modern web development with cutting-edge frameworks',
    skills: [
      { name: 'React', level: 95, color: '#61DAFB', icon: '⚛️' },
      { name: 'TypeScript', level: 90, color: '#3178C6', icon: '📘' },
      { name: 'Vite', level: 85, color: '#646CFF', icon: '⚡' },
      { name: 'Tailwind CSS', level: 90, color: '#38B2AC', icon: '🎨' }
    ]
  },
  'Backend & Database': {
    icon: '🔧',
    description: 'Scalable server-side solutions and data management',
    skills: [
      { name: 'Supabase', level: 85, color: '#3ECF8E', icon: '🗄️' },
      { name: 'PostgreSQL', level: 80, color: '#4169E1', icon: '🐘' },
      { name: 'Node.js', level: 90, color: '#339933', icon: '🟢' },
      { name: 'Heroku', level: 75, color: '#430098', icon: '☁️' }
    ]
  },
  'Engineering Toolkit': {
    icon: '🛠️',
    description: 'Professional engineering and design software',
    skills: [
      { name: 'MATLAB', level: 85, color: '#0076A8', icon: '📐' },
      { name: 'CATIA', level: 80, color: '#005386', icon: '📏' },
      { name: 'AutoCAD', level: 90, color: '#0696D7', icon: '📋' },
      { name: 'AWS', level: 75, color: '#FF9900', icon: '☁️' }
    ]
  } 
};

const CATEGORY_COLORS = {
  'Frontend Mastery': '#61DAFB',
  'Backend & Database': '#3ECF8E',
  'Engineering Toolkit': '#0696D7'
};

// Convert hex to RGBA
const withOpacity = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};


const SkillCard = ({ skill, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative p-6 rounded-2xl border border-[#005792]/40 bg-gradient-to-br from-[#0a1929]/90 to-[#061220]/90 backdrop-blur-sm hover:border-[#61DAFB]/60 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#61DAFB]/20"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#61DAFB]/0 to-[#61DAFB]/0 group-hover:from-[#61DAFB]/5 group-hover:to-transparent transition-all duration-300" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{skill.icon}</div>
            <div>
              <h4 className="font-bold text-white text-lg">{skill.name}</h4>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#61DAFB] to-transparent transition-all duration-500" />
            </div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            className="text-2xl font-bold bg-gradient-to-br from-[#61DAFB] to-[#00BCD4] text-transparent bg-clip-text"
          >
            {skill.level}%
          </motion.div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-3 bg-[#061220] rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${skill.level}%` }}
            transition={{ duration: 1.5, delay: index * 0.1, ease: "easeOut" }}
            className="absolute h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`
            }}
          />
          
          {/* Shine Effect */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              delay: index * 0.1 + 1,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
            className="absolute inset-0 w-1/3"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
            }}
          />
        </div>
        
        {/* Proficiency Label */}
        <div className="mt-3 text-xs text-gray-400 font-medium">
          {skill.level >= 90 ? '🌟 Expert' : skill.level >= 80 ? '💪 Advanced' : '✨ Proficient'}
        </div>
      </div>
    </motion.div>
  );
};

const CategoryStats = ({ categoryData, categoryName, color }) => {
  const skills = categoryData.skills;
  const average = Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8 rounded-2xl border border-[#005792]/40 bg-gradient-to-br from-[#0a1929]/95 to-[#061220]/95 backdrop-blur-sm shadow-xl"
    >
      {/* Header with Icon */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-5xl">{categoryData.icon}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-1">{categoryName}</h3>
          <p className="text-gray-400 text-sm">{categoryData.description}</p>
        </div>
        
        {/* Overall Score Circle */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#061220"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={282.7}
              initial={{ strokeDashoffset: 282.7 }}
              animate={{ strokeDashoffset: 282.7 - (282.7 * average) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{average}</span>
            <span className="text-xs text-gray-400">AVG</span>
          </div>
        </div>
      </div>
      
      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {skills.map((skill, index) => (
          <SkillCard key={skill.name} skill={skill} index={index} />
        ))}
      </div>
      
      {/* Tech Tags */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-[#005792]/30">
        {skills.map(skill => (
          <motion.span
            key={skill.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.1, y: -2 }}
            className="group relative px-4 py-2 rounded-full font-medium text-sm cursor-pointer transition-all"
            style={{ 
              backgroundColor: withOpacity(skill.color, 0.1),
              color: skill.color,
              border: `1.5px solid ${withOpacity(skill.color, 0.4)}`,
            }}
          >
            <span className="flex items-center gap-1.5">
              {skill.icon} {skill.name}
            </span>
            <div 
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ 
                background: `radial-gradient(circle at center, ${withOpacity(skill.color, 0.2)}, transparent)`,
              }}
            />
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('Frontend Mastery');
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  
  const currentCategoryData = SKILLS_DATA[activeCategory];
  const categoryColor = CATEGORY_COLORS[activeCategory];

  return (
    <motion.section 
      id="skills" 
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
      }}
      className="py-20 px-4 md:px-8 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-[#61DAFB] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-[#3ECF8E] rounded-full blur-3xl" />
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
              Skills & Expertise
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Technical{' '}
            <span className="bg-gradient-to-r from-[#61DAFB] via-[#4FC3F7] to-[#00BCD4] text-transparent bg-clip-text">
              Arsenal
            </span>
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            A comprehensive toolkit combining{' '}
            <span className="text-[#61DAFB] font-semibold">modern development</span>
            {' '}and{' '}
            <span className="text-[#3ECF8E] font-semibold">engineering excellence</span>
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {Object.keys(SKILLS_DATA).map((category) => (
            <motion.button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                trackEvent('skills_category_switch', { category });
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base overflow-hidden ${
                activeCategory === category
                  ? 'text-white shadow-xl'
                  : 'text-gray-300 hover:text-white'
              }`}
              style={{
                background: activeCategory === category
                  ? `linear-gradient(135deg, ${CATEGORY_COLORS[category]}, ${CATEGORY_COLORS[category]}dd)`
                  : 'rgba(10, 25, 41, 0.6)',
                border: `2px solid ${activeCategory === category ? CATEGORY_COLORS[category] : 'rgba(0, 87, 146, 0.3)'}`,
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {SKILLS_DATA[category].icon}
                {category}
              </span>
              
              {/* Hover Glow Effect */}
              {activeCategory !== category && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${withOpacity(CATEGORY_COLORS[category], 0.15)}, transparent)`
                  }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Skills Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <CategoryStats 
              categoryData={currentCategoryData}
              categoryName={activeCategory}
              color={categoryColor}
            />
          </motion.div>
        </AnimatePresence>

        {/* Fun Fact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#061220]/80 to-[#0a1929]/80 border border-[#005792]/40 backdrop-blur-sm">
            <p className="text-gray-400 text-sm">
              💡 <span className="text-[#61DAFB] font-semibold">Continuously learning</span> and expanding this toolkit
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Skills;