import React, { useEffect, lazy, Suspense, useState, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import SEO from './components/SEO';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BackToTop from './components/BackToTop';
import ScrollProgressIndicator from './components/ScrollProgressIndicator';
import SectionLoader from './components/SectionLoader';
import CookieConsent from './components/CookieConsent';
import NotFound from './components/NotFound';
import { initGA, trackPageView } from './utils/analytics';
import { initWebVitals } from './utils/webVitals';

/**
 * Supabase and Sentry are imported dynamically, never at module scope.
 *
 * Both used to sit at the top of this file, which put @supabase/supabase-js and
 * @sentry/react — 183KB minified between them — into the graph every first-time visitor
 * downloads before the homepage can paint. Neither is needed to read this site:
 * Supabase serves only the private /admin session check, and Sentry only loads once a
 * visitor has actually consented to it. PRODUCT.md records this audience as frequently
 * on constrained Kenyan mobile connections, which makes that weight a product problem
 * rather than a tidiness one.
 */
const loadSupabase = () => import('./lib/supabase');

/**
 * Admin pages are lazy, not eager.
 *
 * They were imported at the top of this module, which meant Supabase's client, the
 * whole admin surface, its tables, modals and editors all landed in the entry chunk
 * every first-time visitor downloads before the homepage can paint — for routes almost
 * nobody who reaches this site can even open. docs/AUDIT.md §4.2 measured the entry
 * chunk at 821KB raw because of this and the manualChunks miss.
 */
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const SubmissionsPage = lazy(() => import('./admin/pages/SubmissionsPage'));
const AnalyticsPage = lazy(() => import('./admin/pages/AnalyticsPage'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));

// Lazy load heavy sections for better initial load performance
const About = lazy(() => import('./components/About'));
const GitHubActivity = lazy(() => import('./components/GitHubActivity'));
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const Philosophy = lazy(() => import('./components/Philosophy'));
const ContactSection = lazy(() => import('./sections/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));

// Auth Guard Component
const ProtectedAdminRoute = ({ children, isAuthenticated, isAdmin, isLoading, isConfigured }) => {
  if (isConfigured === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloth-100 px-4">
        <div className="text-center max-w-md">
          <h1 className="mb-4 text-2xl font-bold text-warn">Admin area unavailable</h1>
          <p className="mb-6 text-mark-700">
            Supabase environment variables are not configured for this deployment.
          </p>
          <a href="/" className="text-pindo hover:text-pindo-deep">Return to homepage</a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloth-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-mark-700">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloth-100">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-alarm">Access Denied</h1>
          <p className="mb-6 text-mark-700">You do not have admin permissions to access this area.</p>
          <a href="/" className="text-pindo hover:text-pindo-deep">Return to homepage</a>
        </div>
      </div>
    );
  }

  return children;
};

// Portal page for homepage
const HomePage = () => (
  <>
    <SEO />
    <div className="relative min-h-screen overflow-x-hidden bg-cloth-100 text-mark-900">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FAF8F3',
            color: '#14171C',
            border: '1px solid #14171C',
            borderRadius: '0px',
            fontFamily: 'Archivo, system-ui, sans-serif',
          },
          success: { iconTheme: { primary: '#243D8F', secondary: '#FAF8F3' } },
          error: { iconTheme: { primary: '#A32014', secondary: '#FAF8F3' } },
        }}
      />

      {/* First focusable element in the DOM, so a keyboard user meets it before the nav. */}
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <ScrollProgressIndicator />
      <div className="relative z-10">
        <Navbar />
        <main id="main" tabIndex={-1}>
          <Hero />

          <Suspense fallback={<SectionLoader />}>
            <About />
          </Suspense>

          {/* Projects before Skills: the work is the evidence, the toolkit is the footnote. */}
          <Suspense fallback={<SectionLoader />}>
            <Projects />
          </Suspense>

          {/* Activity sits next to the work it evidences, before the toolkit. */}
          <Suspense fallback={<SectionLoader />}>
            <GitHubActivity />
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            <Skills />
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            <Philosophy />
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            <ContactSection />
          </Suspense>
        </main>

        <Suspense fallback={<SectionLoader />}>
          <Footer />
        </Suspense>
      </div>

      <BackToTop />
      <CookieConsent />
    </div>
  </>
);

const ALLOWED_ADMIN_ROLES = ['admin', 'content_manager', 'owner', 'super_admin'];

const resolveUserRole = (authUser) => {
  const role =
    authUser?.app_metadata?.role ||
    authUser?.user_metadata?.role ||
    authUser?.role ||
    '';

  return typeof role === 'string' ? role.toLowerCase() : '';
};

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize analytics and auth
  useEffect(() => {
    // Check cookie consent before initializing analytics
    const checkConsentAndInitialize = () => {
      const consent = localStorage.getItem('cookieConsent');

      if (consent) {
        try {
          const preferences = JSON.parse(consent);

          // Sentry used to initialise here on ANY stored decision, "Reject all"
          // included. It rides the same preference as the rest of the measurement now,
          // which is what the consent panel says it does.
          if (preferences.analytics) {
            import('./utils/sentry').then(({ initSentry }) => initSentry());
            initGA();
            trackPageView(window.location.pathname, document.title);
            initWebVitals();
          }
        } catch (error) {
          console.error('Error parsing cookie consent:', error);
        }
      }
    };

    checkConsentAndInitialize();

    const handleConsentUpdate = (event) => {
      const preferences = event.detail;

      if (preferences.analytics) {
        import('./utils/sentry').then(({ initSentry }) => initSentry());
        initGA();
        trackPageView(window.location.pathname, document.title);
        initWebVitals();
      }
    };

    window.addEventListener('cookieConsentUpdated', handleConsentUpdate);

    return () => {
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate);
    };
  }, []);

  // Check authentication status.
  //
  // Only on an /admin path. On the public homepage there is no session to check and no
  // reason to pay for the client that would check it.
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(null);
  const supabaseRef = useRef(null);

  useEffect(() => {
    if (!window.location.pathname.startsWith('/admin')) {
      setIsLoading(false);
      return undefined;
    }

    let subscription;
    let cancelled = false;

    const applySession = (session) => {
      if (session?.user) {
        // Accept admin role from app/user metadata to match RLS policies.
        const role = resolveUserRole(session.user);
        const hasAdminAccess = ALLOWED_ADMIN_ROLES.includes(role);

        setUser(session.user);
        setIsAuthenticated(true);
        setIsAdmin(hasAdminAccess);

        if (!hasAdminAccess) {
          console.warn('User authenticated but lacks admin role:', role);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    loadSupabase()
      .then(async ({ supabase, isSupabaseConfigured: configured }) => {
        if (cancelled) return;

        setIsSupabaseConfigured(configured);
        supabaseRef.current = supabase;

        // Admin auth needs Supabase; the public site does not. Bail out quietly rather
        // than letting a missing admin credential break the whole page.
        if (!configured) {
          setIsLoading(false);
          return;
        }

        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!cancelled) applySession(session);
        } catch (error) {
          console.error('Auth check error:', error);
          if (!cancelled) {
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }

        subscription = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') applySession(session);
        }).data.subscription;
      })
      .catch((error) => {
        console.error('Could not load the admin session client:', error);
        if (!cancelled) {
          setIsSupabaseConfigured(false);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = supabaseRef.current;
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />

      {/*
        The privacy policy had a component but no route, so every link to it — the
        cookie banner's included — resolved to the 404 page.
      */}
      <Route
        path="/privacy-policy"
        element={
          <Suspense fallback={<SectionLoader />}>
            <PrivacyPolicy />
          </Suspense>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<SectionLoader />}>
            <AdminLogin />
          </Suspense>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} isLoading={isLoading} isConfigured={isSupabaseConfigured}>
            <Suspense fallback={<SectionLoader />}>
            <AdminLayout supabaseClient={supabaseRef.current} user={user} onLogout={handleLogout}>
              <AdminDashboard supabaseClient={supabaseRef.current} />
            </AdminLayout>
            </Suspense>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/submissions"
        element={
          <ProtectedAdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} isLoading={isLoading} isConfigured={isSupabaseConfigured}>
            <Suspense fallback={<SectionLoader />}>
            <AdminLayout supabaseClient={supabaseRef.current} user={user} onLogout={handleLogout}>
              <SubmissionsPage client={supabaseRef.current} />
            </AdminLayout>
            </Suspense>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <ProtectedAdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} isLoading={isLoading} isConfigured={isSupabaseConfigured}>
            <Suspense fallback={<SectionLoader />}>
            <AdminLayout supabaseClient={supabaseRef.current} user={user} onLogout={handleLogout}>
              <AnalyticsPage client={supabaseRef.current} />
            </AdminLayout>
            </Suspense>
          </ProtectedAdminRoute>
        }
      />

      {/*
        Fallback. This was `<Navigate to="/" replace />`, which turned every unmatched
        URL — typos, stale links, crawler probes — into the homepage at a 200. Search
        engines saw unlimited distinct URLs serving identical content. A real 404 page
        carrying `noindex` replaces it. See docs/AUDIT.md §3.3.
      */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
