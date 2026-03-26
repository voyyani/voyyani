import React, { useEffect, lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import SEO from './components/SEO';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ParticleBackground from './components/ParticleBackground';
import BackToTop from './components/BackToTop';
import ScrollProgressIndicator from './components/ScrollProgressIndicator';
import SectionLoader from './components/SectionLoader';
import CookieConsent from './components/CookieConsent';
import { initGA, trackPageView } from './utils/analytics';
import { initWebVitals } from './utils/webVitals';
import { initSentry } from './utils/sentry';
import { supabase } from './lib/supabase';

// Admin pages
import AdminLayout from './admin/layout/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import SubmissionsPage from './admin/pages/SubmissionsPage';
import AdminLogin from './admin/pages/AdminLogin';

// Lazy load heavy sections for better initial load performance
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const Philosophy = lazy(() => import('./components/Philosophy'));
const ContactSection = lazy(() => import('./sections/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));

// Auth Guard Component
const ProtectedAdminRoute = ({ children, isAuthenticated, isLoading }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#061220] to-[#0a1929] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Portal page for homepage
const HomePage = () => (
  <>
    <SEO />
    <div className="min-h-screen bg-gradient-to-br from-[#061220] to-[#0a1929] text-gray-100 overflow-x-hidden relative">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a1929',
            color: '#f0f0f0',
            border: '1px solid rgba(0, 87, 146, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#61DAFB',
              secondary: '#0a1929',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0a1929',
            },
          },
        }}
      />

      <ScrollProgressIndicator />
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />

          <Suspense fallback={<SectionLoader />}>
            <Skills />
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            <Projects />
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

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session?.user) {
          // Verify user is admin (optional - check against admin list)
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
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
          <ProtectedAdminRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <AdminLayout supabaseClient={supabase} user={user} onLogout={handleLogout}>
              <AdminDashboard supabaseClient={supabase} />
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/submissions"
        element={
          <ProtectedAdminRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
            <AdminLayout supabaseClient={supabase} user={user} onLogout={handleLogout}>
              <SubmissionsPage client={supabase} />
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