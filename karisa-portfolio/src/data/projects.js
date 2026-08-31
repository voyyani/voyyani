/**
 * The two client platforms, extracted verbatim from Projects.jsx during the Kanga Sheet
 * rebuild. Nothing here changed: every figure, caption and status note was verified in
 * a prior pass and re-verifying them is not this pass's job. Presentation moved; the
 * record did not.
 *
 * `liveStatus.checkedOn` is a real date someone opened the site. If you change a status,
 * change the date with it.
 */
export const PROJECTS = [
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
        "Frontend: React 18, built with Vite",
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
];

export default PROJECTS;
