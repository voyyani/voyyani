import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { trackProjectView, trackEvent } from '../utils/analytics';

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  const projects = [
    {
      id: 1,
      title: "Raslipwani Properties",
      tagline: "Enterprise Real Estate Management Platform",
      description: "A comprehensive full-stack property management platform featuring intelligent booking systems, CRM with client tracking, real-time availability management, advanced admin dashboard with analytics, and automated communication workflows. Built to handle 100+ concurrent users with optimized performance and scalability.",
      technologies: [
        "React 18.3",
        "Vite 6.3",
        "Supabase",
        "PostgreSQL",
        "Tailwind CSS",
        "React Query",
        "FullCalendar",
        "Framer Motion",
        "Clerk Auth",
        "Vercel Analytics",
        "EmailJS",
        "Cloudinary",
        "Vitest",
        "React Testing Library"
      ],
      metrics: [
        { icon: "👥", label: "Active Users", value: "100+" },
        { icon: "⚡", label: "Load Time", value: "1.2s" },
        { icon: "📊", label: "Performance", value: "60% ↑" },
        { icon: "🎯", label: "Coverage", value: "90%" },
        { icon: "📱", label: "Mobile Score", value: "95/100" },
        { icon: "🔄", label: "Uptime", value: "99.9%" }
      ],
      category: "Full-Stack",
      challenge: "Building a scalable real estate platform that handles complex booking workflows, client relationship management, property tracking, and admin operations while maintaining exceptional performance with real-time updates for concurrent users.",
      solution: "Implemented React Query for intelligent caching with 5-minute stale time, Supabase real-time subscriptions for live updates, optimistic UI patterns for instant feedback, server-side pagination reducing data transfer by 95%, and debounced search cutting API calls by 80%. Used Vercel edge functions for optimal delivery.",
      features: [
        "Advanced property search & filtering system",
        "Intelligent appointment scheduling with calendar views",
        "Complete CRM with client lifecycle tracking",
        "Property interest tracking & communication timeline",
        "Drag-and-drop booking management",
        "Real-time analytics dashboard with 8+ metrics",
        "Automated email notifications & reminders",
        "Multi-status workflow system (pending → confirmed → completed)",
        "Role-based access control (RBAC) with Clerk",
        "CSV export functionality for all data",
        "Internal admin notes & comments system",
        "Configurable settings with email templates",
        "Business hours management & scheduling",
        "International market support (UN Housing portal)",
        "Responsive mobile-first design",
        "SEO optimized with React Helmet",
        "Comprehensive testing suite (Vitest + RTL)"
      ],
      technicalHighlights: [
        "Server-side pagination (20 items/page, 95% data reduction)",
        "Debounced search (500ms, 80% fewer API calls)",
        "React Query caching (5min stale time, instant UX)",
        "Optimistic UI updates with automatic rollback",
        "Full-text search with PostgreSQL indexes",
        "Image optimization via Cloudinary CDN",
        "Lazy loading with React.lazy() for code splitting",
        "Vitest testing with 90% coverage target",
        "Vercel Analytics & Speed Insights integration",
        "Comprehensive error boundaries & fallbacks"
      ],
      architecture: [
        "Frontend: React 18 with Vite for lightning-fast builds",
        "State: React Query for server state, Context for UI state",
        "Backend: Supabase (PostgreSQL + PostgREST + Auth)",
        "Storage: Cloudinary for optimized image delivery",
        "Auth: Clerk for secure authentication & RBAC",
        "Deployment: Vercel with edge functions & CDN",
        "Testing: Vitest + React Testing Library + jsdom",
        "CI/CD: GitHub Actions for automated deployments"
      ],
      databaseSchema: [
        "properties (15 columns, 4 indexes) - Property listings",
        "bookings (25 columns, 7 indexes) - Appointments & viewings",
        "clients (28 columns, 6 indexes) - CRM profiles",
        "client_property_interests (7 columns, 3 indexes) - Interest tracking",
        "client_communications (10 columns, 4 indexes) - Timeline & notes",
        "admin_settings (20+ columns) - Configuration management"
      ],
      keyAchievements: [
        "Reduced page load time from 3s to 1.2s (60% improvement)",
        "Implemented full CRM system in single sprint",
        "Achieved 99.9% uptime on Vercel infrastructure",
        "Zero compilation errors with ESLint enforcement",
        "Built 16+ production-ready React components",
        "Created 27 files with 5,700+ lines of tested code",
        "Established 90% test coverage standard",
        "Optimized mobile performance to 95/100 score"
      ],
      adminFeatures: [
        "Comprehensive dashboard with 8+ real-time metrics",
        "FullCalendar integration (day/week/month/list views)",
        "Client management with search, filters & pagination",
        "Property management with bulk operations",
        "Booking workflow with drag-and-drop rescheduling",
        "Communication timeline for all client interactions",
        "Email template editor with Quill rich text",
        "Business hours configuration with timezone support",
        "Settings panel with 6+ configuration modules",
        "CSV export for properties, bookings & clients",
        "Real-time activity feed tracking system events",
        "Status workflow management with visual badges"
      ],
      performanceMetrics: [
        "Initial Load: 1.2s (60% faster than baseline)",
        "Time to Interactive: <2s on 3G networks",
        "First Contentful Paint: <1s",
        "API Response Time: <200ms average",
        "Database Query Time: <50ms with indexes",
        "95th Percentile Load Time: <2.5s",
        "Mobile Performance Score: 95/100",
        "Desktop Performance Score: 98/100"
      ],
      liveUrl: "https://raslipwani.co.ke",
      githubUrl: "https://github.com/voyyani/raslipwani",
      color: "#3ECF8E",
      gradient: "from-[#3ECF8E] to-[#2AA876]"
    }
  ];

  const filteredProjects = projects;

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
    trackProjectView(project.title);
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto"
            onClick={closeProjectDetails}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative bg-gradient-to-br from-[#0a1929] to-[#061220] rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#005792]/40 shadow-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button 
                onClick={closeProjectDetails}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="sticky top-6 right-6 float-right z-10 text-gray-400 hover:text-white p-3 rounded-full bg-[#061220]/80 backdrop-blur-sm border border-[#005792]/40"
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
                        <span className="text-4xl">🏢</span>
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
                        <span className="text-2xl">📝</span> Project Overview
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{selectedProject.description}</p>
                    </div>

                    {/* Challenge & Solution */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-[#061220]/60 border border-orange-500/30">
                        <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                          <span>⚠️</span> Technical Challenge
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{selectedProject.challenge}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-[#061220]/60 border border-green-500/30">
                        <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                          <span>✅</span> Engineering Solution
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{selectedProject.solution}</p>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#005792]/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">⚡</span> Core Features ({selectedProject.features.length})
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="flex items-start gap-2 text-gray-300 text-sm"
                          >
                            <div className="mt-1 text-[#61DAFB] flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Highlights */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-purple-500/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🔧</span> Technical Highlights
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.technicalHighlights.map((highlight, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="flex items-start gap-2 text-gray-300 text-sm"
                          >
                            <div className="mt-1 text-purple-400 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <span>{highlight}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Architecture */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-blue-500/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🏗️</span> System Architecture
                      </h3>
                      <div className="space-y-2">
                        {selectedProject.architecture.map((arch, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="p-3 rounded-lg bg-[#0a1929] border border-blue-500/20 text-gray-300 text-sm"
                          >
                            {arch}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Database Schema */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#3ECF8E]/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🗄️</span> Database Schema
                      </h3>
                      <div className="space-y-2">
                        {selectedProject.databaseSchema.map((table, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-3 rounded-lg bg-[#0a1929] border border-[#3ECF8E]/20 text-gray-300 text-sm font-mono"
                          >
                            {table}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-yellow-500/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">⚡</span> Performance Metrics
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.performanceMetrics.map((metric, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className="p-3 rounded-lg bg-[#0a1929] border border-yellow-500/20 text-gray-300 text-sm"
                          >
                            {metric}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Key Achievements */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#D4A017]/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🏆</span> Key Achievements
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.keyAchievements.map((achievement, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="flex items-start gap-2 text-gray-300 text-sm"
                          >
                            <div className="mt-1 text-[#D4A017] flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                              </svg>
                            </div>
                            <span>{achievement}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Impact Metrics */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#005792]/30">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">📊</span> Impact Metrics
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
                            transition={{ delay: idx * 0.03 }}
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

                    {/* Admin Features */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#61DAFB]/30">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">👨‍💼</span> Admin Panel
                      </h3>
                      <div className="space-y-2">
                        {selectedProject.adminFeatures.slice(0, 8).map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="flex items-start gap-2 text-gray-300 text-xs"
                          >
                            <div className="mt-0.5 text-[#61DAFB] flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                        <p className="text-xs text-gray-500 mt-2 italic">
                          +{selectedProject.adminFeatures.length - 8} more admin features
                        </p>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      <motion.a 
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`block w-full text-center bg-gradient-to-r ${selectedProject.gradient} text-white py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          🚀 View Live Platform
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      </motion.a>
                    </div>
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
              Featured Work
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Production-Ready{' '}
            <span className="bg-gradient-to-r from-[#3ECF8E] via-[#61DAFB] to-[#D4A017] text-transparent bg-clip-text">
              Full-Stack Platform
            </span>
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Enterprise-grade real estate management system built with{' '}
            <span className="text-[#3ECF8E] font-semibold">modern architecture</span>,{' '}
            <span className="text-[#61DAFB] font-semibold">scalable infrastructure</span>, and{' '}
            <span className="text-[#D4A017] font-semibold">production best practices</span>
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
                      <span className="text-5xl">🏢</span>
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
                    <div className="grid grid-cols-3 gap-2">
                      {project.metrics.slice(0, 3).map((metric) => (
                        <div key={metric.label} className="p-3 rounded-xl bg-[#061220]/60 border border-[#005792]/30">
                          <div className="text-xl mb-1">{metric.icon}</div>
                          <div className="text-sm font-bold text-white">{metric.value}</div>
                          <div className="text-xs text-gray-500">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tech Stack Preview */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 4).map((tech) => (
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
                      {project.technologies.length > 4 && (
                        <span className="text-xs px-2 py-1 rounded-lg font-medium bg-[#005792]/20 text-gray-400">
                          +{project.technologies.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* View Button */}
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-[#61DAFB] font-semibold text-sm pt-2"
                    >
                      Explore Full Details
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

        {/* Additional Info */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { delay: 0.3 } }
          }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm">
            Built with 5,700+ lines of production code • 90% test coverage • Zero compilation errors
          </p>
        </motion.div>
      </div>

      <ProjectModal />
    </motion.section>
  );
};

export default Projects;
