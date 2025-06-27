import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  // African-inspired pattern as base64
  const africanPattern = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
  
  const socialLinks = [
    {
      name: 'Website',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      url: 'https://voyani.tech'
    },
    {
      name: 'Email',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      url: 'mailto:karisa@thebikecollector.tech'
    },
    {
      name: 'GitHub',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      url: 'https://github.com/voyyani'
    },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      console.log("Subscribed with email:", email);
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      id="contact" 
      className="relative overflow-hidden pt-16 pb-10 px-4 border-t border-[#005792]/30"
      style={{ backgroundImage: `url("${africanPattern}")` }}
    >
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-[#D4A017] rounded-full mix-blend-multiply blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#008751] rounded-full mix-blend-multiply blur-xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Brand Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-3 h-3 rounded-full bg-[#61DAFB] animate-pulse"></div>
              <h2 className="text-xl font-bold text-white">Voyani.tech</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Mechanical Engineer → Full-Stack Developer
              <br />
              Crafting high-performance solutions with engineering precision
            </p>
            
            <div className="mt-auto">
              <h3 className="text-lg font-bold mb-4 text-gray-200">Stay Updated</h3>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="bg-[#061220]/70 border border-[#005792]/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#61DAFB]"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#005792] to-[#004274] text-white px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                >
                  Subscribe
                </button>
              </form>
              {subscribed && (
                <p className="mt-2 text-sm text-[#3ECF8E]">
                  Thank you for subscribing!
                </p>
              )}
            </div>
          </div>
          
          {/* Contact Section */}
          <div className="lg:px-6">
            <h3 className="text-xl font-bold mb-6 pb-2 border-b border-[#005792]/30 text-white">
              Get in Touch
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-[#61DAFB]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm">Email</h4>
                  <a 
                    href="mailto:karisa@thebikecollector.info" 
                    className="text-white hover:text-[#61DAFB] transition-colors break-all"
                  >
                    karisa@thebikecollector.info
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 text-[#61DAFB]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm">Based In</h4>
                  <p className="text-white">Nairobi, Kenya</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-gray-400 text-sm mb-3">Connect with me</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#061220]/70 hover:bg-[#005792]/30 backdrop-blur-sm p-3 rounded-lg transition-all border border-[#005792]/30 hover:border-[#61DAFB]/50 flex items-center gap-2"
                    whileHover={{ y: -3 }}
                  >
                    <div className="text-[#61DAFB]">
                      {social.icon}
                    </div>
                    <span className="text-sm text-white hidden sm:inline">{social.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 pb-2 border-b border-[#005792]/30 text-white">
              Quick Links
            </h3>
            
            <ul className="space-y-3 mb-6">
              {[
                { name: 'Home', href: '#', onClick: scrollToTop },
                { name: 'Projects', href: '#projects' },
                { name: 'Skills', href: '#skills' },
                { name: 'Philosophy', href: '#philosophy' },
                { name: 'Contact', href: '#contact' }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    onClick={link.onClick || undefined}
                    className="text-gray-400 hover:text-[#61DAFB] transition-colors flex items-center gap-2 group py-2"
                  >
                    <span className="text-[#61DAFB] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="p-4 rounded-xl bg-[#061220]/50 border border-[#005792]/30">
              <h4 className="text-gray-200 font-bold mb-2">Engineering Heritage</h4>
              <p className="text-gray-400 text-sm">
                Bringing African innovation and engineering excellence to digital solutions
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-[#005792]/20 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Karisa. All rights reserved.
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 hidden sm:inline">Crafted with</span>
              <div className="text-[#61DAFB]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <a 
              href="#" 
              onClick={scrollToTop}
              className="text-gray-500 hover:text-[#61DAFB] transition-colors flex items-center gap-1 text-sm"
            >
              Back to top
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;