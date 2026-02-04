import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { trackProjectView, trackEvent } from '../utils/analytics';

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const shouldReduceMotion = useReducedMotion();

  const projects = useMemo(() => [
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
      gradient: "from-[#3ECF8E] to-[#2AA876]",
      emoji: "🏢"
    },
    {
      id: 2,
      title: "Neema Foundation Kilifi",
      tagline: "Non-Profit Digital Transformation Platform",
      description: "A modern, performant web platform for Neema Foundation Kilifi, a non-profit organization focused on community transformation in Kenya through healthcare, education, and empowerment programs. Features a comprehensive CMS, role-based admin portal, dynamic content management, and donation/volunteer workflows designed to increase impact and transparency.",
      technologies: [
        "React 19",
        "TypeScript 5.9",
        "Vite 7",
        "Supabase",
        "PostgreSQL",
        "Tailwind CSS 3.4",
        "React Query v5",
        "React Router 7",
        "Framer Motion 12",
        "Three.js",
        "TipTap Editor",
        "Zod Validation",
        "React Hook Form",
        "Vercel Analytics",
        "DND Kit",
        "Lucide Icons"
      ],
      metrics: [
        { icon: "🏥", label: "Programs", value: "15+" },
        { icon: "⚡", label: "LCP Score", value: "<2.5s" },
        { icon: "♿", label: "A11y Score", value: "95+" },
        { icon: "🔐", label: "RBAC Roles", value: "6" },
        { icon: "📱", label: "Mobile First", value: "100%" },
        { icon: "🌍", label: "Impact", value: "10K+" }
      ],
      category: "Full-Stack",
      challenge: "Creating a digital platform for a non-profit that effectively communicates impact, drives donations and volunteer registrations, manages diverse programs, and provides transparent governance—all while maintaining exceptional accessibility, performance, and a world-class admin experience for non-technical staff.",
      solution: "Built a React 19 + TypeScript architecture with Supabase backend featuring a 5-tier RBAC system (Super Admin → Viewer), comprehensive CMS with TipTap rich-text editing, drag-and-drop content ordering, real-time metrics dashboard, Three.js animated hero, and automated workflows. Implemented granular permissions matrix with 20+ distinct permission types across 6 user roles.",
      features: [
        "Dynamic Programs showcase with category filtering",
        "Interactive Impact metrics with animated counters",
        "Stories & Testimonials carousel system",
        "Events calendar with registration workflows",
        "Multi-pathway Donation system (Bank, Mobile, Sponsorship)",
        "Volunteer registration with role matching",
        "Partnership inquiry & corporate engagement",
        "Legacy giving & planned donations",
        "Board governance transparency section",
        "Three.js animated hero with reduced-motion support",
        "Smooth-scroll navigation with a11y fallbacks",
        "Trust bar with partner logos",
        "SEO optimized with meta management",
        "Contact forms with validation",
        "Bank details page with copy/print support",
        "Mobile-first responsive design",
        "Maintenance mode with admin override"
      ],
      technicalHighlights: [
        "React 19 with concurrent features & Suspense",
        "5-tier RBAC with 20+ granular permissions",
        "TipTap rich-text editor with image uploads",
        "DND Kit for drag-and-drop content ordering",
        "React Query v5 with intelligent cache invalidation",
        "Zod schema validation with React Hook Form",
        "Three.js hero with performance optimizations",
        "Framer Motion with reduced-motion detection",
        "PostgreSQL with Row-Level Security (RLS)",
        "Supabase Auth with session management",
        "Vercel Edge deployment with analytics",
        "TypeScript strict mode with ESLint 9"
      ],
      architecture: [
        "Frontend: React 19 + TypeScript + Vite 7 (HMR)",
        "State: React Query v5 (server) + Context (UI)",
        "Backend: Supabase (PostgreSQL + PostgREST + Auth)",
        "CMS: Custom admin with TipTap + DND Kit",
        "Auth: Supabase Auth with 5-tier RBAC",
        "Styling: Tailwind CSS 3.4 + Framer Motion 12",
        "3D: Three.js for hero animations",
        "Deployment: Vercel with Edge Functions",
        "Validation: Zod + React Hook Form"
      ],
      databaseSchema: [
        "profiles (8 columns, 3 indexes) - User accounts & roles",
        "programs (18 columns, 5 indexes) - Program content & metadata",
        "events (20 columns, 6 indexes) - Events with registration",
        "impact_metrics (12 columns, 4 indexes) - Impact statistics",
        "stories (15 columns, 5 indexes) - Testimonials & success stories",
        "board_members (12 columns, 3 indexes) - Governance team",
        "hero_content (10 columns, 2 indexes) - Dynamic hero slides",
        "site_settings (15 columns, 2 indexes) - Configuration",
        "contact_info (8 columns) - Organization contacts",
        "partners (10 columns, 3 indexes) - Partner organizations"
      ],
      keyAchievements: [
        "Built comprehensive 5-tier RBAC system from scratch",
        "Implemented 20+ granular permission controls",
        "Created 7 distinct admin content management pages",
        "Achieved Lighthouse accessibility score 95+",
        "Optimized LCP to <2.5s on 3G Fast networks",
        "Designed mobile-first with 100% responsive coverage",
        "Integrated Three.js with graceful degradation",
        "Built real-time metrics dashboard with 8+ KPIs",
        "Implemented DOMPurify for XSS protection",
        "Created comprehensive TypeScript type system"
      ],
      adminFeatures: [
        "Real-time dashboard with donation & volunteer metrics",
        "Programs CRUD with rich-text descriptions",
        "Stories management with image galleries",
        "Events calendar with status workflows",
        "Board member profiles with bios",
        "Hero content slider management",
        "Impact metrics editor with icons",
        "Site settings with branding controls",
        "User management with role assignment",
        "Permission-based navigation",
        "Drag-and-drop content ordering",
        "TipTap WYSIWYG editor with extensions",
        "Image upload with preview",
        "Color picker for brand customization",
        "Activity audit logging",
        "Maintenance mode toggle"
      ],
      performanceMetrics: [
        "Largest Contentful Paint: <2.5s",
        "Cumulative Layout Shift: <0.1",
        "Total Blocking Time: <200ms",
        "Lighthouse Performance: 90+",
        "Lighthouse Accessibility: 95+",
        "Lighthouse SEO: 95+",
        "Mobile Performance: 95/100",
        "First Input Delay: <100ms"
      ],
      liveUrl: "https://neemafoundationkilifi.org",
      color: "#E67E22",
      gradient: "from-[#E67E22] to-[#D35400]",
      emoji: "💚"
    }
  ], []);

  const categories = useMemo(() => ['All', ...new Set(projects.map(p => p.category))], [projects]);

  const filteredProjects = useMemo(() => 
    activeFilter === 'All' 
      ? projects 
      : projects.filter(p => p.category === activeFilter),
    [projects, activeFilter]
  );

  const openProjectDetails = useCallback((project) => {
    setSelectedProject(project);
    setShowModal(true);
    trackProjectView(project.title);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeProjectDetails = useCallback(() => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => setSelectedProject(null), 300);
  }, []);

  // Animation variants with reduced motion support
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: shouldReduceMotion ? 0 : 0.6,
        staggerChildren: shouldReduceMotion ? 0 : 0.1
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0 }
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <motion.div 
              initial={{ scale: shouldReduceMotion ? 1 : 0.9, opacity: 0, y: shouldReduceMotion ? 0 : 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: shouldReduceMotion ? 1 : 0.9, opacity: 0, y: shouldReduceMotion ? 0 : 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative bg-gradient-to-br from-[#0a1929] to-[#061220] rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#005792]/40 shadow-2xl my-8 scrollbar-thin scrollbar-thumb-[#005792]/50 scrollbar-track-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button 
                onClick={closeProjectDetails}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="sticky top-6 right-6 float-right z-10 text-gray-400 hover:text-white p-3 rounded-full bg-[#061220]/80 backdrop-blur-sm border border-[#005792]/40 focus:outline-none focus:ring-2 focus:ring-[#61DAFB] focus:ring-offset-2 focus:ring-offset-[#061220]"
                aria-label="Close modal"
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
                        <span className="text-4xl" role="img" aria-hidden="true">{selectedProject.emoji}</span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold text-white">
                          {selectedProject.category}
                        </span>
                      </div>
                      <h2 id="modal-title" className="text-4xl font-bold text-white mb-2">{selectedProject.title}</h2>
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
                        <span className="text-2xl" role="img" aria-hidden="true">📝</span> Project Overview
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{selectedProject.description}</p>
                    </div>

                    {/* Challenge & Solution */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-[#061220]/60 border border-orange-500/30">
                        <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                          <span role="img" aria-hidden="true">⚠️</span> Technical Challenge
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{selectedProject.challenge}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-[#061220]/60 border border-green-500/30">
                        <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                          <span role="img" aria-hidden="true">✅</span> Engineering Solution
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{selectedProject.solution}</p>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#005792]/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-hidden="true">⚡</span> Core Features ({selectedProject.features.length})
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.02 }}
                            className="flex items-start gap-2 text-gray-300 text-sm"
                          >
                            <div className="mt-1 text-[#61DAFB] flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                        <span className="text-2xl" role="img" aria-hidden="true">🔧</span> Technical Highlights
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.technicalHighlights.map((highlight, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.03 }}
                            className="flex items-start gap-2 text-gray-300 text-sm"
                          >
                            <div className="mt-1 text-purple-400 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                        <span className="text-2xl" role="img" aria-hidden="true">🏗️</span> System Architecture
                      </h3>
                      <div className="space-y-2">
                        {selectedProject.architecture.map((arch, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.04 }}
                            className="p-3 rounded-lg bg-[#0a1929] border border-blue-500/20 text-gray-300 text-sm font-mono"
                          >
                            {arch}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Database Schema */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#3ECF8E]/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-hidden="true">🗄️</span> Database Schema
                      </h3>
                      <div className="space-y-2">
                        {selectedProject.databaseSchema.map((table, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.05 }}
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
                        <span className="text-2xl" role="img" aria-hidden="true">⚡</span> Performance Metrics
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.performanceMetrics.map((metric, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.04 }}
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
                        <span className="text-2xl" role="img" aria-hidden="true">🏆</span> Key Achievements
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.keyAchievements.map((achievement, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.03 }}
                            className="flex items-start gap-2 text-gray-300 text-sm"
                          >
                            <div className="mt-1 text-[#D4A017] flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                        <span className="text-2xl" role="img" aria-hidden="true">📊</span> Impact Metrics
                      </h3>
                      <div className="space-y-4">
                        {selectedProject.metrics.map((metric, idx) => (
                          <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.1 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-[#0a1929] to-[#061220] border border-[#005792]/40"
                          >
                            <div className="text-2xl mb-2" role="img" aria-hidden="true">{metric.icon}</div>
                            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                            <div className="text-xs text-gray-400 uppercase tracking-wider">{metric.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div className="p-6 rounded-2xl bg-[#061220]/60 border border-[#005792]/30">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl" role="img" aria-hidden="true">🛠️</span> Tech Stack
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech, idx) => (
                          <motion.span
                            key={tech}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.03 }}
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
                        <span className="text-2xl" role="img" aria-hidden="true">👨‍💼</span> Admin Panel
                      </h3>
                      <div className="space-y-2">
                        {selectedProject.adminFeatures.slice(0, 8).map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.04 }}
                            className="flex items-start gap-2 text-gray-300 text-xs"
                          >
                            <div className="mt-0.5 text-[#61DAFB] flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                        {selectedProject.adminFeatures.length > 8 && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            +{selectedProject.adminFeatures.length - 8} more admin features
                          </p>
                        )}
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
                        className={`block w-full text-center bg-gradient-to-r ${selectedProject.gradient} text-white py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#061220]`}
                        style={{ focusRingColor: selectedProject.color }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          🚀 View Live Platform
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      </motion.a>
                      {selectedProject.githubUrl && (
                        <motion.a 
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="block w-full text-center bg-[#0a1929] border-2 border-[#005792]/50 text-white py-4 rounded-xl font-bold hover:border-[#61DAFB]/70 transition-all focus:outline-none focus:ring-2 focus:ring-[#61DAFB] focus:ring-offset-2 focus:ring-offset-[#061220]"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            View Source Code
                          </span>
                        </motion.a>
                      )}
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
      variants={containerVariants}
      className="py-20 px-4 md:px-8 relative overflow-hidden"
      aria-labelledby="projects-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#3ECF8E] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-[#61DAFB] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#E67E22] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full border-2 border-[#D4A017]/60 bg-[#D4A017]/10 text-[#D4A017] text-sm font-semibold tracking-[0.2em] uppercase">
              Featured Work
            </span>
          </div>
          
          <h2 id="projects-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Production-Ready{' '}
            <span className="bg-gradient-to-r from-[#3ECF8E] via-[#61DAFB] to-[#E67E22] text-transparent bg-clip-text">
              Full-Stack Platforms
            </span>
          </h2>
          
          <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Enterprise-grade applications built with{' '}
            <span className="text-[#3ECF8E] font-semibold">modern architecture</span>,{' '}
            <span className="text-[#61DAFB] font-semibold">scalable infrastructure</span>, and{' '}
            <span className="text-[#E67E22] font-semibold">production best practices</span>
          </p>
        </motion.div>

        {/* Category Filter */}
        {categories.length > 2 && (
          <motion.div 
            variants={itemVariants}
            className="flex justify-center gap-3 mb-12 flex-wrap"
            role="tablist"
            aria-label="Filter projects by category"
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => {
                  setActiveFilter(category);
                  trackEvent('project_filter', { category });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                role="tab"
                aria-selected={activeFilter === category}
                aria-controls="projects-grid"
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#61DAFB] focus:ring-offset-2 focus:ring-offset-[#0a1929] ${
                  activeFilter === category
                    ? 'bg-gradient-to-r from-[#3ECF8E] to-[#61DAFB] text-white shadow-lg'
                    : 'bg-[#0a1929] text-gray-400 border border-[#005792]/40 hover:border-[#61DAFB]/60 hover:text-white'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Projects Grid */}
        <motion.div 
          layout
          id="projects-grid"
          role="tabpanel"
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.article
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : index * 0.1 }}
                whileHover={shouldReduceMotion ? {} : { y: -8 }}
                onClick={() => openProjectDetails(project)}
                onKeyDown={(e) => e.key === 'Enter' && openProjectDetails(project)}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${project.title}`}
                className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#61DAFB] focus:ring-offset-4 focus:ring-offset-[#0a1929] rounded-3xl"
              >
                <div className="relative bg-gradient-to-br from-[#0a1929] to-[#061220] backdrop-blur-sm border-2 border-[#005792]/30 rounded-3xl overflow-hidden hover:border-[#61DAFB]/60 transition-all duration-300 shadow-xl hover:shadow-2xl h-full">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#61DAFB]/0 to-[#61DAFB]/0 group-hover:from-[#61DAFB]/10 group-hover:to-transparent transition-all duration-300 pointer-events-none" aria-hidden="true" />
                  
                  {/* Header */}
                  <div className={`relative p-8 bg-gradient-to-br ${project.gradient}`}>
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-5xl" role="img" aria-hidden="true">{project.emoji}</span>
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
                          <div className="text-xl mb-1" role="img" aria-hidden="true">{metric.icon}</div>
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
                      whileHover={shouldReduceMotion ? {} : { x: 5 }}
                      className="flex items-center gap-2 text-[#61DAFB] font-semibold text-sm pt-2"
                    >
                      Explore Full Details
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Additional Info */}
        <motion.div 
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-[#3ECF8E]">✓</span>
              <span>10,000+ lines of production code</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-[#61DAFB]">✓</span>
              <span>90%+ test coverage</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-[#E67E22]">✓</span>
              <span>Zero compilation errors</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-[#D4A017]">✓</span>
              <span>WCAG 2.1 AA compliant</span>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack Summary */}
        <motion.div
          variants={itemVariants}
          className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-[#0a1929]/80 to-[#061220]/80 border border-[#005792]/30 backdrop-blur-sm"
        >
          <h3 className="text-xl font-bold text-white text-center mb-6">
            Technologies I Work With
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Framer Motion', 'Three.js', 'Vite', 'React Query', 'Zod'].map((tech, idx) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: shouldReduceMotion ? 0 : 0.5 + idx * 0.05 }}
                className="px-4 py-2 rounded-xl bg-[#005792]/20 text-[#61DAFB] text-sm font-medium border border-[#005792]/40 hover:border-[#61DAFB]/60 hover:bg-[#61DAFB]/10 transition-all cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      <ProjectModal />
    </motion.section>
  );
};

export default Projects;
