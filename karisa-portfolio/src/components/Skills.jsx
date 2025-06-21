import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Skill data organized by category
const SKILLS_DATA = {
  'Frontend Mastery': [
    { name: 'React', level: 95, color: '#61DAFB' },
    { name: 'TypeScript', level: 90, color: '#3178C6' },
    { name: 'Vite', level: 85, color: '#646CFF' },
    { name: 'Tailwind CSS', level: 90, color: '#38B2AC' }
  ],
  'Backend & Database': [
    { name: 'Supabase', level: 85, color: '#3ECF8E' },
    { name: 'PostgreSQL', level: 80, color: '#4169E1' },
    { name: 'Node.js', level: 90, color: '#339933' },
    { name: 'Heroku', level: 75, color: '#430098' }
  ],
  'Engineering Toolkit': [
    { name: 'MATLAB', level: 85, color: '#0076A8' },
    { name: 'CATIA', level: 80, color: '#005386' },
    { name: 'AutoCAD', level: 90, color: '#0696D7' },
    { name: 'AWS', level: 75, color: '#FF9900' }
  ] 
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

const SkillCard = ({ skill, isHighlighted }) => {
  const categoryColor = CATEGORY_COLORS[Object.keys(SKILLS_DATA).find(
    category => SKILLS_DATA[category].some(s => s.name === skill.name)
  )] || '#61DAFB';

  return (
    <div 
      className={`p-4 rounded-xl border transition-all duration-300 ${
        isHighlighted 
          ? `border-[${categoryColor}] bg-[${withOpacity(categoryColor, 0.1)}]`
          : 'border-[#005792]/30 bg-[#0a1929]/70'
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-200">{skill.name}</span>
        <span className="text-[#61DAFB] font-bold">{skill.level}%</span>
      </div>
      <div className="h-2 bg-[#0a1929] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${skill.level}%`,
            backgroundColor: skill.color
          }}
        />
      </div>
    </div>
  );
};

const CategoryStats = ({ skills, average, color }) => {
  return (
    <div className="md:col-span-2 p-6 rounded-xl border border-[#005792]/30 bg-gradient-to-br from-[#0a1929]/70 to-[#0a1929]/90 mt-4">
      <h3 className="text-xl font-bold mb-4 text-gray-200">Category Expertise</h3>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative" style={{ width: 120, height: 120 }}>
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#0a1929"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={326.72}
              strokeDashoffset={326.72 - (326.72 * average) / 100}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-xl">{average}%</span>
          </div>
        </div>
        
        <div className="flex-1">
          <p className="text-gray-400 mb-4">
            Average proficiency across technologies
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {skills.map(skill => (
              <span 
                key={skill.name}
                className="text-xs px-3 py-2 rounded-full font-medium transition-all"
                style={{ 
                  backgroundColor: withOpacity(skill.color, 0.08),
                  color: skill.color,
                  border: `1px solid ${withOpacity(skill.color, 0.25)}`,
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('Frontend Mastery');
  
  // Memoized category stats
  const categoryStats = useMemo(() => {
    const skills = SKILLS_DATA[activeCategory];
    const average = Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length);
    const color = CATEGORY_COLORS[activeCategory] || '#61DAFB';
    
    return { skills, average, color };
  }, [activeCategory]);

  // Animation variants for tab content
  const tabContentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <section id="skills" className="py-20 px-4 md:px-8 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            Technical Expertise
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-[#61DAFB] rounded-full" />
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Specialized skills and technologies I leverage to deliver robust solutions
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.keys(SKILLS_DATA).map((category) => (
            <button
              key={category}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === category
                  ? `bg-[${CATEGORY_COLORS[category]}] text-[#0a1929]`
                  : 'bg-[#0a1929]/50 text-gray-300 hover:bg-[#0a1929]/70'
              }`}
              onClick={() => setActiveCategory(category)}
              style={{
                border: activeCategory === category 
                  ? 'none' 
                  : `1px solid ${withOpacity(CATEGORY_COLORS[category], 0.3)}`
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Skills Display */}
        <div className="bg-gradient-to-br from-[#061220]/80 to-[#0a1929]/50 backdrop-blur-sm border border-[#005792]/30 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Skill Cards */}
              <div className="grid grid-cols-1 gap-4">
                {categoryStats.skills.map((skill) => (
                  <SkillCard 
                    key={skill.name} 
                    skill={skill} 
                    isHighlighted={true}
                  />
                ))}
              </div>
              
              {/* Visualization Area */}
              <div className="flex flex-col justify-between">
                <div className="p-6 rounded-xl border border-[#005792]/30 bg-[#0a1929]/70 h-full flex flex-col justify-center">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold text-gray-200 mb-2">{activeCategory}</h3>
                    <div className="flex justify-center">
                      <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#61DAFB] to-transparent" />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    {categoryStats.skills.map(skill => (
                      <div 
                        key={skill.name} 
                        className="flex flex-col items-center"
                        style={{ width: '40%' }}
                      >
                        <div className="relative w-20 h-20 mb-2">
                          <div 
                            className="absolute inset-0 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: withOpacity(skill.color, 0.1),
                              border: `1px solid ${withOpacity(skill.color, 0.3)}`
                            }}
                          >
                            <span className="text-white font-bold">{skill.level}%</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-300 text-center">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Skill Distribution */}
                <div className="mt-6 p-4 rounded-xl border border-[#005792]/30 bg-[#0a1929]/70">
                  <h4 className="font-medium text-gray-300 mb-3">Skill Distribution</h4>
                  <div className="flex gap-2">
                    {categoryStats.skills.map(skill => (
                      <div 
                        key={skill.name}
                        className="h-2 rounded-full"
                        style={{
                          width: `${skill.level}%`,
                          backgroundColor: skill.color
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Category Stats */}
              <CategoryStats 
                skills={categoryStats.skills} 
                average={categoryStats.average} 
                color={categoryStats.color} 
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Skills;