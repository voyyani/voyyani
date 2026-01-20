import React, { useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
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

// Lazy load heavy sections for better initial load performance
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const Philosophy = lazy(() => import('./components/Philosophy'));
const ContactSection = lazy(() => import('./sections/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));

function App() {
  // Initialize analytics and monitoring
  useEffect(() => {
    // Check cookie consent before initializing analytics
    const checkConsentAndInitialize = () => {
      const consent = localStorage.getItem('cookieConsent');
      
      if (consent) {
        try {
          const preferences = JSON.parse(consent);
          
          // Initialize Sentry (always in production for error tracking)
          initSentry();
          
          // Initialize Google Analytics if analytics cookies are enabled
          if (preferences.analytics) {
            initGA();
            trackPageView(window.location.pathname, document.title);
          }
          
          // Initialize Web Vitals if analytics cookies are enabled
          if (preferences.analytics) {
            initWebVitals();
          }
        } catch (error) {
          console.error('Error parsing cookie consent:', error);
        }
      }
    };

    // Initial check
    checkConsentAndInitialize();

    // Listen for consent updates
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

  return (
    <>
      <SEO />
      <div className="min-h-screen bg-gradient-to-br from-[#061220] to-[#0a1929] text-gray-100 overflow-x-hidden relative">
      {/* Toast Notifications */}
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

      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator />

      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          
          {/* Lazy-loaded sections with Suspense boundaries */}
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

      {/* Back to Top Button */}
      <BackToTop />

      {/* Cookie Consent Banner */}
      <CookieConsent />
      </div>

      {/* Vercel Web Analytics */}
      <Analytics />
    </>
  );
}

export default App;