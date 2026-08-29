import React, { useEffect, lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import SEO from './components/SEO';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BackToTop from './components/BackToTop';
import ScrollProgressIndicator from './components/ScrollProgressIndicator';
import SectionLoader from './components/SectionLoader';
import CookieConsent from './components/CookieConsent';
import { initGA, trackPageView } from './utils/analytics';
import { initWebVitals } from './utils/webVitals';
import { initSentry } from './utils/sentry';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// Admin pages
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import SubmissionsPage from './admin/pages/SubmissionsPage';
import AnalyticsPage from './admin/pages/AnalyticsPage';
import AdminLogin from './admin/pages/AdminLogin';

// Lazy load heavy sections for better initial load performance
const About = lazy(() => import('./components/About'));
const GitHubActivity = lazy(() => import('./components/GitHubActivity'));
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const Philosophy = lazy(() => import('./components/Philosophy'));
const ContactSection = lazy(() => import('./sections/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));

// Auth Guard Component
const ProtectedAdminRoute = ({ children, isAuthenticated, isAdmin, isLoading }) => {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
        <div className="text-center max-w-md">
          <h1 className="mb-4 text-2xl font-bold text-warn">Admin area unavailable</h1>
          <p className="mb-6 text-ink-200">
            Supabase environment variables are not configured for this deployment.
          </p>
          <a href="/" className="text-signal hover:text-signal-hover">Return to homepage</a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-ink-200">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-red-500">Access Denied</h1>
          <p className="mb-6 text-ink-200">You do not have admin permissions to access this area.</p>
          <a href="/" className="text-signal hover:text-signal-hover">Return to homepage</a>
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
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950 text-ink-50">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#17161A',
            color: '#F2F1EE',
            border: '1px solid #2E2E33',
            borderRadius: '0px',
          },
          success: { iconTheme: { primary: '#C8FF3D', secondary: '#0B0B0C' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#0B0B0C' } },
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

          initSentry();

          if (preferences.analytics) {
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

  // Check authentication status
  useEffect(() => {
    // Admin auth needs Supabase; the public site does not. Bail out quietly rather
    // than letting a missing admin credential break the whole page.
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

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
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const role = resolveUserRole(session.user);
        const hasAdminAccess = ALLOWED_ADMIN_ROLES.includes(role);

        setUser(session.user);
        setIsAuthenticated(true);
        setIsAdmin(hasAdminAccess);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
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

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} isLoading={isLoading}>
            <AdminLayout supabaseClient={supabase} user={user} onLogout={handleLogout}>
              <AdminDashboard supabaseClient={supabase} />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/submissions"
        element={
          <ProtectedAdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} isLoading={isLoading}>
            <AdminLayout supabaseClient={supabase} user={user} onLogout={handleLogout}>
              <SubmissionsPage client={supabase} />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/analytics"
        element={
          <ProtectedAdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} isLoading={isLoading}>
            <AdminLayout supabaseClient={supabase} user={user} onLogout={handleLogout}>
              <AnalyticsPage client={supabase} />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
