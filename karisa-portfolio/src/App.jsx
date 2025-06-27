import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Philosophy from './components/Philosophy';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';

function App() {
  // Track page views
  useEffect(() => {
    // In a real app, you would use an analytics service
    console.log('Portfolio loaded');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061220] to-[#0a1929] text-gray-100 overflow-x-hidden relative">
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Skills />
          <Projects />
          <Philosophy />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;