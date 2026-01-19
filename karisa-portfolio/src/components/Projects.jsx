import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  const projects = [
    {
      id: 1,
      title: "Raslipwani Properties",
      tagline: "Modern Real Estate Platform",
      description: "A comprehensive property management platform featuring intelligent booking systems, real-time availability tracking, and a powerful admin dashboard for analytics and user management.",
      technologies: ["React", "Vite", "Supabase", "Tailwind CSS", "PostgreSQL", "EmailJS"],
      metrics: [
        { icon: "👥", label: "Active Users", value: "100+" },
        { icon: "⚡", label: "Load Time", value: "-40%" },
        { icon: "📊", label: "Conversion", value: "+60%" }
      ],
      category: "Full-Stack",
      challenge: "Complex state management for real-time property bookings with concurrent users",
      solution: "Implemented optimistic UI updates with Supabase real-time subscriptions",
      features: [
        "Advanced property search with filters",
        "Intelligent appointment scheduling",
        "Automated email notifications",
        "User favorites & saved searches",
        "Comprehensive admin analytics",
        "Role-based access control (RBAC)",
        "Mobile-responsive design"
      ],
      liveUrl: "https://raslipwani.co.ke",
      color: "#3ECF8E",
      gradient: "from-[#3ECF8E] to-[#2AA876]"
    }
  ];

  // No need for filtering when we only have one project
  const filteredProjects = projects;

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeProjectDetails = () => {
    setShowModal(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  const ProjectModal = () => {
    if (!selectedProject) return null;
    
    return (
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={closeProjectDetails}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative bg-gradient-to-br from-[#0a1929] to-[#061220] rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#005792]/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button 
                onClick={closeProjectDetails}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-6 right-6 z-10 text-gray-400 hover:text-white p-3 rounded-full bg-[#061220]/80 backdrop-blur-sm border border-[#005792]/40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
              <div className="p-8 md:p-10">
                {/* Header with Gradient */}
                <div className={`p-8 rounded-2xl bg-gradient-to-r ${selectedProject.gradient} mb-8`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{selectedProject.category === 'Full-Stack' ? '⚛️' : selectedProject.category === 'E-Commerce' ? '🛍️' : '💼'}</span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white">
                          {selectedProject.category}
                        </span>
                      </div>
                      <h2 className="text-4xl font-bold text-white mb-2">{selectedProject.title}</h2>
                      <p className="text-white/80 text-lg">{selectedProject.tagline}</p>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Main Content */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#005792]/30">
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <span className="text-2xl">📝</span> Overview
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{selectedProject.description}</p>
                    </div>

                    {/* Challenge & Solution */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-[#061220]/60 border border-orange-500/30">
                        <h4 className="text-lg font-bold text-orange-400 mb-2 flex items-center gap-2">
                          <span>⚠️</span> Challenge
                        </h4>
                        <p className="text-gray-300 text-sm">{selectedProject.challenge}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-[#061220]/60 border border-green-500/30">
                        <h4 className="text-lg font-bold text-green-400 mb-2 flex items-center gap-2">
                          <span>✅</span> Solution
                        </h4>
                        <p className="text-gray-300 text-sm">{selectedProject.solution}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#005792]/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">⚡</span> Key Features
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-2 text-gray-300 text-sm"
                          >
                            <div className="mt-1 text-[#61DAFB]">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Metrics */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#005792]/30">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">📊</span> Impact
                      </h3>
                      <div className="space-y-4">
                        {selectedProject.metrics.map((metric, idx) => (
                          <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-[#0a1929] to-[#061220] border border-[#005792]/40"
                          >
                            <div className="text-2xl mb-2">{metric.icon}</div>
                            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider">{metric.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#005792]/30">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🛠️</span> Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech, idx) => (
                          <motion.span
                            key={tech}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="text-xs px-3 py-2 rounded-lg font-medium"
                            style={{
                              backgroundColor: `${selectedProject.color}15`,
                              color: selectedProject.color,
                              border: `1px solid ${selectedProject.color}40`
                            }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.a 
                      href={selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`block w-full text-center bg-gradient-to-r ${selectedProject.gradient} text-white py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        🚀 View Live Project
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </span>
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <motion.section 
      id="projects" 
      ref={ref}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.6 } }
      }}
      className="py-20 px-4 md:px-8 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#3ECF8E] rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-[#61DAFB] rounded-full blur-3xl" />
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
              Portfolio Showcase
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Featured{' '}
            <span className="bg-gradient-to-r from-[#3ECF8E] via-[#61DAFB] to-[#D4A017] text-transparent bg-clip-text">
              Projects
            </span>
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Engineering-driven solutions delivering{' '}
            <span className="text-[#3ECF8E] font-semibold">measurable impact</span>
            {' '}and{' '}
            <span className="text-[#61DAFB] font-semibold">exceptional experiences</span>
          </p>
        </motion.div>

        {/* Projects Grid - Centered single project */}
        <motion.div 
          layout
          className="flex justify-center"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => openProjectDetails(project)}
                className="group cursor-pointer max-w-md w-full"
              >
                <div className={`relative bg-gradient-to-br from-[#0a1929] to-[#061220] backdrop-blur-sm border-2 border-[#005792]/30 rounded-3xl overflow-hidden hover:border-[#61DAFB]/60 transition-all duration-300 shadow-xl hover:shadow-2xl`}>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#61DAFB]/0 to-[#61DAFB]/0 group-hover:from-[#61DAFB]/10 group-hover:to-transparent transition-all duration-300" />
                  
                  {/* Header */}
                  <div className={`relative p-8 bg-gradient-to-br ${project.gradient}`}>
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-5xl">{project.category === 'Full-Stack' ? '⚛️' : project.category === 'E-Commerce' ? '🛍️' : '💼'}</span>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-white/80 text-sm">{project.tagline}</p>
                  </div>

                  {/* Content */}
                  <div className="relative p-6 space-y-4">
                    <p className="text-gray-400 text-sm line-clamp-3">{project.description}</p>

                    {/* Metrics */}
                    <div className="flex gap-2">
                      {project.metrics.slice(0, 2).map((metric) => (
                        <div key={metric.label} className="flex-1 p-3 rounded-xl bg-[#061220]/60 border border-[#005792]/30">
                          <div className="text-xl mb-1">{metric.icon}</div>
                          <div className="text-sm font-bold text-white">{metric.value}</div>
                          <div className="text-xs text-gray-500">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span 
                          key={tech} 
                          className="text-xs px-2 py-1 rounded-lg font-medium"
                          style={{
                            backgroundColor: `${project.color}15`,
                            color: project.color
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium bg-[#005792]/20 text-gray-400">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    {/* View Button */}
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-[#61DAFB] font-semibold text-sm pt-2"
                    >
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <ProjectModal />
    </motion.section>
  );
};

export default Projects;
