import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { trackProjectView, trackEvent } from '../utils/analytics';
import ImageWithFallback from './ImageWithFallback';
import ProjectDiagram from './ProjectDiagram';

/**
 * Shown instead of a screenshot when a project genuinely has no capture available.
 * Deliberately reads as "not captured yet" rather than imitating a screenshot —
 * a portfolio that fakes product imagery is worse than one that admits a gap.
 */
const NoCaptureNotice = ({ project }) => (
  <div
    className="flex h-full w-full items-center justify-center border-b border-ink-800 bg-ink-850"
    style={{ aspectRatio: '16 / 10' }}
  >
    <div className="px-6 text-center">
      <svg className="mx-auto mb-3 h-7 w-7 text-ink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="M3 16l5-5 4 4 3-3 6 6" />
        <path d="M4 4l16 16" />
      </svg>
      <p className="eyebrow text-ink-500">
        {project.liveStatus?.state === 'maintenance'
          ? 'Capture pending — client site in maintenance'
          : 'Capture pending — private client deployment'}
      </p>
    </div>
  </div>
);

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
      tagline: "Real estate booking & client management",
      // Shown on the card. Two sentences, plain language, no adjectives I can't defend.
      summary: "A property platform where buyers book viewings and staff run the whole pipeline — listings, bookings and client history — from one dashboard.",
      description: "A property management platform for a Kenyan real-estate agency. The public side lets buyers search listings and book viewings; the admin side is where the agency actually works — managing properties, rescheduling bookings, tracking which client asked about which property, and keeping a record of every conversation.",
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
      // "Load Time 1.2s" and "Performance 60% ↑" were the same fact stated twice.
      // Merged into one metric that shows the before-and-after the case study explains.
      metrics: [
        { label: "Page Load", value: "3s → 1.2s" },
        { label: "Active Users", value: "100+" },
        { label: "Mobile Lighthouse", value: "95/100" },
        { label: "Test Coverage", value: "90%" }
      ],
      category: "Full-Stack",
      challenge: "The first version loaded every property and every booking on page load. That was fine with 40 listings and painful by 400 — around 3 seconds to first paint, and the agency's staff were the ones paying for it, all day, on slow connections.",
      solution: "Three changes did most of the work. Server-side pagination so a page fetches 20 rows instead of the whole table. A 500ms debounce on search, which stopped firing a query per keystroke. And React Query with a 5-minute stale time, so navigating back to a list you just left is instant instead of a refetch. Load time went to roughly 1.2s. Optimistic updates with rollback came later, once the data layer was predictable enough to trust.",
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
      // Structured rather than pre-formatted strings: this is tabular data and the modal
      // now renders it as a table, so the shape belongs in the data, not in punctuation.
      databaseSchema: [
        { name: "properties", shape: "15 cols · 4 idx", holds: "Listings and their availability" },
        { name: "bookings", shape: "25 cols · 7 idx", holds: "Viewings, reschedules, status history" },
        { name: "clients", shape: "28 cols · 6 idx", holds: "CRM profiles" },
        { name: "client_property_interests", shape: "7 cols · 3 idx", holds: "Which client asked about which property" },
        { name: "client_communications", shape: "10 cols · 4 idx", holds: "Conversation timeline and internal notes" },
        { name: "admin_settings", shape: "20+ cols", holds: "Business hours, email templates, config" }
      ],
      // Kept to things that are distinct from each other and from the sections above.
      keyAchievements: [
        "Cut page load from ~3s to ~1.2s via pagination, debounced search and query caching",
        "Replaced the agency's spreadsheet-based client tracking with a real CRM",
        "Booking pipeline handles reschedules and status changes without losing history",
        "Full-text search over listings using PostgreSQL indexes rather than client-side filtering"
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
      // Checked 2026-08-29: every route serves the client's scheduled-maintenance page,
      // so the "View Live Platform" button would land a visitor on a countdown screen.
      // Say so rather than let them find out. Clear this once the window closes.
      liveStatus: {
        state: "maintenance",
        label: "Client site is in a scheduled maintenance window",
        checkedOn: "29 Aug 2026"
      },
      // No product screenshots yet — the live site is behind the maintenance page and
      // the admin dashboard needs Karisa's own login to capture. See docs/CHANGELOG.md.
      screenshots: [],
      index: "01"
    },
    {
      id: 2,
      title: "Neema Foundation Kilifi",
      tagline: "Non-profit site with a CMS their team actually runs",
      summary: "A public site and content system for a Kilifi non-profit, built so their staff can publish programmes, stories and events themselves — without calling a developer.",
      description: "The public website and admin system for a faith-based non-profit in Ganze, Kilifi County, working in healthcare, education and youth empowerment. The brief was less about the website and more about who maintains it: everything a visitor sees — hero copy, programmes, stories, events, gallery albums, donation routes — is editable by their own staff, none of whom write code.",
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
      // Verified 2026-08-29 against the live site: the donate page reports
      // "10,000+ lives touched" and "4 active programs". The previous "Programs 15+"
      // was not backed by anything the client publishes, and "RBAC Roles 6"
      // contradicted this same object's own "5-tier RBAC" description.
      metrics: [
        { label: "Active Programs", value: "4" },
        { label: "LCP Score", value: "<2.5s" },
        { label: "A11y Score", value: "95+" },
        { label: "RBAC Tiers", value: "5" },
        { label: "Mobile First", value: "100%" },
        { label: "Lives Touched", value: "10K+" }
      ],
      category: "Full-Stack",
      challenge: "A non-profit's site goes stale the moment it needs a developer to change anything. This one had to be editable by staff with no technical background — while still not letting a volunteer with gallery access accidentally edit the donation details.",
      solution: "A 5-tier role system, from Super Admin down to Viewer, with permissions granular enough that someone can be trusted with stories and events but not with site settings or user management. Content editing is TipTap with DOMPurify sanitising everything on the way in, and ordering is drag-and-drop rather than a number field nobody understands. The permission checks live in PostgreSQL Row-Level Security, not just the UI — hiding a button is not access control.",
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
        { name: "profiles", shape: "8 cols · 3 idx", holds: "Accounts and their role tier" },
        { name: "programs", shape: "18 cols · 5 idx", holds: "Programme content, editable by staff" },
        { name: "events", shape: "20 cols · 6 idx", holds: "Events and registrations" },
        { name: "impact_metrics", shape: "12 cols · 4 idx", holds: "The counters shown on the public site" },
        { name: "stories", shape: "15 cols · 5 idx", holds: "Testimonials and success stories" },
        { name: "board_members", shape: "12 cols · 3 idx", holds: "Governance profiles" },
        { name: "hero_content", shape: "10 cols · 2 idx", holds: "Hero slides, CMS-managed" },
        { name: "site_settings", shape: "15 cols · 2 idx", holds: "Branding and configuration" },
        { name: "contact_info", shape: "8 cols", holds: "Organisation contact details" },
        { name: "partners", shape: "10 cols · 3 idx", holds: "Partner organisations" }
      ],
      keyAchievements: [
        "Staff publish programmes, stories and events without developer involvement",
        "Permissions enforced in PostgreSQL RLS, so the API can't be talked around",
        "Rich-text input sanitised with DOMPurify before it ever reaches the database",
        "Three.js hero degrades to a static image under prefers-reduced-motion"
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
      githubUrl: "https://github.com/voyyani/Neema-Foundation-Kilifi",
      liveStatus: { state: "live", checkedOn: "29 Aug 2026" },
      // Captured from the live site on 2026-08-29 at 1440x900 @2x.
      screenshots: [
        {
          src: "/images/projects/neema/home.jpg",
          alt: "Neema Foundation home page: full-bleed hero reading 'Need meets God's Grace In Ganze Community' over a dark red gradient, with donate and programs calls to action",
          caption: "Home — hero copy, imagery and impact counters are all editable from the admin CMS"
        },
        {
          src: "/images/projects/neema/programs.jpg",
          alt: "Programs page listing transformational programs with a gallery timeline and category filters",
          caption: "Programs — CMS-driven listings with drag-and-drop ordering and category filters"
        },
        {
          src: "/images/projects/neema/donate.jpg",
          alt: "Donation page headed 'Support Neema Foundation' showing impact statistics and multiple ways to give",
          caption: "Donate — multi-pathway giving (bank, mobile money, sponsorship)"
        },
        {
          src: "/images/projects/neema/media.jpg",
          alt: "Media gallery page titled 'Our Story, In Pictures' with album filters for programs, events and behind the scenes",
          caption: "Media — album gallery with filtering, populated entirely through the CMS"
        },
        {
          src: "/images/projects/neema/volunteer.jpg",
          alt: "Volunteer registration page headed 'Join Our Volunteer Family'",
          caption: "Volunteer — registration workflow with role matching"
        }
      ],
      index: "02"
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
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-950/92 p-4 backdrop-blur-sm"
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
              className="relative my-8 max-h-[90vh] w-full max-w-5xl overflow-y-auto border border-ink-700 bg-ink-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <motion.button 
                onClick={closeProjectDetails}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="sticky right-4 top-4 z-10 float-right border border-ink-700 bg-ink-950/90 p-2.5 text-ink-300 backdrop-blur transition-colors hover:border-ink-500 hover:text-ink-50"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              
              <div className="p-6 md:p-10">
                {/* Header with Gradient */}
                <div className="mb-8 border-b border-ink-800 pb-7">
                  <div className="eyebrow mb-4 text-signal">
                    {selectedProject.index} — {selectedProject.category}
                  </div>
                  <h2 id="modal-title" className="mb-2 text-display font-bold text-ink-50">{selectedProject.title}</h2>
                  <p className="text-lg text-ink-300">{selectedProject.tagline}</p>
                </div>

                {/* Screenshots — real captures of the shipped product, taken from the live site */}
                {selectedProject.screenshots?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-4 text-lg font-bold text-ink-50">The Shipped Product</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {selectedProject.screenshots.map((shot, idx) => (
                        <motion.figure
                          key={shot.src}
                          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: shouldReduceMotion ? 0 : idx * 0.06 }}
                          className={idx === 0 ? 'sm:col-span-2' : undefined}
                        >
                          <ImageWithFallback
                            src={shot.src}
                            alt={shot.alt}
                            width={1600}
                            height={1000}
                            sizes="(max-width: 640px) 100vw, 640px"
                            className="border border-ink-700"
                          />
                          <figcaption className="mt-2 text-xs text-ink-400">{shot.caption}</figcaption>
                        </motion.figure>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {/* Main Content */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="panel p-6">
                      <h3 className="mb-3 text-lg font-bold text-ink-50">Project Overview</h3>
                      <p className="leading-relaxed text-ink-200">{selectedProject.description}</p>
                    </div>

                    {/* Challenge & Solution */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="panel p-6">
                        <h4 className="mb-3 text-base font-bold text-ink-50">Technical Challenge</h4>
                        <p className="text-sm leading-relaxed text-ink-200">{selectedProject.challenge}</p>
                      </div>
                      <div className="panel p-6">
                        <h4 className="mb-3 text-base font-bold text-ink-50">Engineering Solution</h4>
                        <p className="text-sm leading-relaxed text-ink-200">{selectedProject.solution}</p>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="panel p-6">
                      <h3 className="mb-4 text-lg font-bold text-ink-50">Core Features ({selectedProject.features.length})</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.02 }}
                            className="flex items-start gap-2 text-sm text-ink-200"
                          >
                            <div className="mt-0.5 flex-shrink-0 text-signal">
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
                    <div className="panel p-6">
                      <h3 className="mb-4 text-lg font-bold text-ink-50">Technical Highlights</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.technicalHighlights.map((highlight, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.03 }}
                            className="flex items-start gap-2 text-sm text-ink-200"
                          >
                            <div className="mt-0.5 flex-shrink-0 text-signal">
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
                    {selectedProject.architecture?.length > 0 && (
                    <div className="panel p-6">
                      <h3 className="mb-4 text-lg font-bold text-ink-50">How it works</h3>
                      <ProjectDiagram projectId={selectedProject.id} />
                      <details className="mt-5 border-t border-ink-800 pt-4">
                        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.1em] text-ink-400 transition-colors hover:text-ink-200">
                          Full stack breakdown
                        </summary>
                        <ul className="mt-3 space-y-1.5">
                          {selectedProject.architecture.map((arch) => (
                            <li key={arch} className="font-mono text-xs text-ink-300">{arch}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                    )}

                    {/* Database Schema */}
                    {selectedProject.databaseSchema?.length > 0 && (
                    <div className="panel p-6">
                      <h3 className="mb-4 text-lg font-bold text-ink-50">Database Schema</h3>
                      <table className="w-full text-left">
                        <caption className="sr-only">Tables in the {selectedProject.title} schema</caption>
                        <thead>
                          <tr className="border-b border-ink-700">
                            <th scope="col" className="pb-2 font-mono text-eyebrow uppercase text-ink-400">Table</th>
                            <th scope="col" className="pb-2 font-mono text-eyebrow uppercase text-ink-400">Shape</th>
                            <th scope="col" className="pb-2 font-mono text-eyebrow uppercase text-ink-400">Holds</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProject.databaseSchema.map((row) => (
                            <tr key={row.name} className="border-b border-ink-800">
                              <td className="py-2 pr-3 font-mono text-xs text-signal">{row.name}</td>
                              <td className="py-2 pr-3 font-mono text-xs text-ink-400 whitespace-nowrap">{row.shape}</td>
                              <td className="py-2 text-xs text-ink-200">{row.holds}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    )}

                    {/* Performance Metrics */}
                    {selectedProject.performanceMetrics?.length > 0 && (
                    <div className="panel p-6">
                      <h3 className="mb-4 text-lg font-bold text-ink-50">Performance Metrics</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.performanceMetrics.map((metric, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.04 }}
                            className="border border-ink-800 bg-ink-850 p-3 text-sm text-ink-200"
                          >
                            {metric}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    )}

                    {/* Key Achievements */}
                    <div className="panel p-6">
                      <h3 className="mb-4 text-lg font-bold text-ink-50">Key Achievements</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedProject.keyAchievements.map((achievement, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.03 }}
                            className="flex items-start gap-2 text-sm text-ink-200"
                          >
                            <div className="mt-0.5 flex-shrink-0 text-signal">
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
                    <div className="panel p-6">
                      <h3 className="mb-4 text-lg font-bold text-ink-50">Impact Metrics</h3>
                      <div className="space-y-4">
                        {selectedProject.metrics.map((metric, idx) => (
                          <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.1 }}
                            className="border border-ink-800 bg-ink-850 p-4"
                          >
                            <div className="text-stat font-bold text-ink-50">{metric.value}</div>
                            <div className="eyebrow mt-1.5">{metric.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div className="panel p-6">
                      <h3 className="mb-4 text-lg font-bold text-ink-50">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.technologies.map((tech, idx) => (
                          <motion.span
                            key={tech}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.03 }}
                            className="border border-ink-700 px-2.5 py-1.5 font-mono text-[11px] text-ink-200"
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Admin Features */}
                    {selectedProject.adminFeatures?.length > 0 && (
                    <div className="panel p-6">
                      <h3 className="mb-4 text-lg font-bold text-ink-50">Admin Panel</h3>
                      <div className="space-y-2">
                        {selectedProject.adminFeatures.slice(0, 8).map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: shouldReduceMotion ? 0 : idx * 0.04 }}
                            className="flex items-start gap-2 text-xs text-ink-200"
                          >
                            <div className="mt-0.5 flex-shrink-0 text-signal">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                        {selectedProject.adminFeatures.length > 8 && (
                          <p className="mt-2 text-xs italic text-ink-400">
                            +{selectedProject.adminFeatures.length - 8} more admin features
                          </p>
                        )}
                      </div>
                    </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      {selectedProject.liveStatus?.state === 'maintenance' && (
                        <p className="border-l-2 border-warn bg-ink-850 p-3 text-xs leading-relaxed text-warn">
                          {selectedProject.liveStatus.label} (checked {selectedProject.liveStatus.checkedOn}),
                          so the live link currently shows the client&apos;s maintenance page.
                        </p>
                      )}
                      {selectedProject.liveStatus?.state === 'private' && (
                        <p className="border-l-2 border-ink-600 bg-ink-850 p-3 text-xs leading-relaxed text-ink-300">
{selectedProject.liveStatus.label}.
                        </p>
                      )}
                      {selectedProject.liveUrl && (
                      <motion.a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="block w-full bg-signal py-3.5 text-center font-semibold text-ink-950 transition-colors duration-250 ease-signal hover:bg-signal-hover"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {selectedProject.liveStatus?.state === 'maintenance'
                            ? 'Visit Site Anyway'
                            : '🚀 View Live Platform'}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      </motion.a>
                      )}
                      {selectedProject.githubUrl && (
                        <motion.a 
                          href={selectedProject.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="block w-full border border-ink-700 py-3.5 text-center font-semibold text-ink-50 transition-colors duration-250 ease-signal hover:border-ink-500 hover:bg-ink-850"
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
      className="relative border-b border-ink-800 px-5 py-section md:px-10"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="mb-12"
        >
          <div className="eyebrow mb-5 text-signal">02 — Selected work</div>

          <h2 id="projects-heading" className="mb-5 max-w-[18ch] text-display font-bold text-ink-50">
            Two platforms, both in daily use
          </h2>

          <p className="max-w-prose text-lg leading-relaxed text-ink-300">
            Real client work, not demos. Each one I built end to end — schema, permissions,
            API, frontend, deploy — and still maintain.
          </p>
        </motion.div>

        {/* Category Filter */}
        {categories.length > 2 && (
          <motion.div 
            variants={itemVariants}
            className="mb-8 flex flex-wrap gap-2"
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
                className={`border px-4 py-2.5 text-sm font-medium transition-colors duration-250 ease-signal ${
                  activeFilter === category
                    ? 'border-signal bg-signal text-ink-950'
                    : 'border-ink-700 text-ink-200 hover:border-ink-500 hover:text-ink-50'
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
          className="grid gap-6 md:grid-cols-2"
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
                className="group cursor-pointer"
              >
                <div className="h-full border border-ink-800 bg-ink-900 transition-colors duration-250 ease-signal group-hover:border-ink-600">
                  
                  {/* Lead visual: a real screenshot where one exists, an honest notice where it doesn't */}
                  <div className="relative">
                    {project.screenshots?.length > 0 ? (
                      <ImageWithFallback
                        src={project.screenshots[0].src}
                        alt={project.screenshots[0].alt}
                        width={1600}
                        height={1000}
                        sizes="(max-width: 768px) 100vw, 560px"
                        className="border-b border-ink-800"
                      />
                    ) : (
                      <NoCaptureNotice project={project} />
                    )}
                  </div>

                  {/* Header */}
                  <div className="border-b border-ink-800 px-6 py-5">
                    <div className="mb-2 flex items-baseline gap-3">
                      <span className="font-mono text-[11px] text-signal">{project.index}</span>
                      <h3 className="text-title font-bold text-ink-50">{project.title}</h3>
                      <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-ink-400">
                        {project.category}
                      </span>
                    </div>
                    <p className="text-sm text-ink-300">{project.tagline}</p>
                  </div>

                  {/* Content */}
                  <div className="space-y-5 p-6">
                    <p className="text-sm leading-relaxed text-ink-200">{project.summary}</p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-px bg-ink-800">
                      {project.metrics.slice(0, 3).map((metric) => (
                        <div key={metric.label} className="bg-ink-850 p-3">
                          <div className="font-bold text-ink-50">{metric.value}</div>
                          <div className="eyebrow mt-1 leading-snug">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tech Stack Preview */}
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span key={tech} className="border border-ink-700 px-2 py-1 font-mono text-[11px] text-ink-300">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="border border-ink-800 px-2 py-1 font-mono text-[11px] text-ink-400">
                          +{project.technologies.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* View Button */}
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { x: 5 }}
                      className="flex items-center gap-2 pt-1 text-sm font-semibold text-signal"
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

        {/* Vanity stat row ("10,000+ lines of production code", "Zero compilation errors",
            "WCAG 2.1 AA compliant") and the 12-item tech-soup list were removed in Phase 1:
            none of it was checkable from this page, and two entries (Next.js, Three.js)
            weren't used by either project shown. What a stack is used for is on each card. */}
        <motion.div variants={itemVariants} className="mt-16 text-center">
          <p className="text-sm text-ink-400">
            Both platforms are still maintained. The technical detail behind each one is in its case study above.
          </p>
        </motion.div>
      </div>

      <ProjectModal />
    </motion.section>
  );
};

export default Projects;
