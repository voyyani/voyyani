import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import SEO from './components/SEO';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Philosophy from './components/Philosophy';
import ContactSection from './sections/ContactSection';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import BackToTop from './components/BackToTop';
import ScrollProgressIndicator from './components/ScrollProgressIndicator';

function App() {
  // Track page views
  useEffect(() => {
    // In a real app, you would use an analytics service
    if (import.meta.env.PROD) {
      console.log('Portfolio loaded');
    }
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
          <Skills />
          <Projects />
          <Philosophy />
          <ContactSection />
        </main>
        <Footer />
      </div>

      {/* Back to Top Button */}
      <BackToTop />
      </div>
    </>
  );
}

export default App;