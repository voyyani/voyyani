import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Philosophy from './components/Philosophy';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#061220] to-[#0a1929] text-gray-100 overflow-x-hidden">
      <Navbar />
      <Hero />
      <Skills />
      <Projects />
      <Philosophy />
      <Footer />
    </div>
  );
}

export default App;