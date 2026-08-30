import React from 'react';
import { motion } from 'framer-motion';
import { SITE, mailto } from '../config/site';

const Footer = () => {
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
      url: mailto('Portfolio enquiry')
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.98 3.5C4.98 4.881 3.87 6 2.5 6S0 4.881 0 3.5C0 2.12 1.12 1 2.5 1S4.98 2.12 4.98 3.5zM.02 8.5h4.96V24H.02V8.5zm7.44 0h4.75v2.11h.07c.66-1.25 2.27-2.57 4.68-2.57 5 0 5.92 3.29 5.92 7.57V24h-4.95v-7.4c0-1.77-.03-4.04-2.46-4.04-2.47 0-2.85 1.93-2.85 3.92V24H7.46V8.5z" />
        </svg>
      ),
      url: SITE.social.linkedin
    },
    {
      name: 'GitHub',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
      url: SITE.social.github
    },
  ];

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="border-t border-ink-800 bg-ink-950 px-5 pb-10 pt-16 md:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Brand Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-2.5 w-2.5 bg-signal" aria-hidden="true"></span>
              <h2 className="text-xl font-bold text-ink-50">Voyani.tech</h2>
            </div>
            <p className="text-ink-300 mb-6">
              {SITE.role}
              <br />
              Crafting high-performance solutions with engineering precision
            </p>

            <div className="mt-auto">
              <a
                href={SITE.resume.href}
                download={SITE.resume.downloadAs}
                className="btn-signal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Resume
              </a>
            </div>
          </div>
          
          {/* Contact Section */}
          <div className="lg:px-6">
            <h3 className="text-xl font-bold mb-6 pb-2 border-b border-ink-800 text-ink-50">
              Get in Touch
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-signal">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-ink-300 text-sm">Email</h4>
                  <a
                    href={mailto('Portfolio enquiry')}
                    className="text-ink-50 hover:text-signal transition-colors break-all"
                  >
                    {SITE.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 text-signal">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-ink-300 text-sm">Based In</h4>
                  <p className="text-ink-50">{SITE.location}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-ink-300 text-sm mb-3">Connect with me</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-ink-950/70 hover:bg-ink-800 backdrop-blur-sm p-3 transition-all border border-ink-800 hover:border-signal flex items-center gap-2"
                    whileHover={{ y: -3 }}
                  >
                    <div className="text-signal">
                      {social.icon}
                    </div>
                    <span className="text-sm text-ink-50 hidden sm:inline">{social.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 pb-2 border-b border-ink-800 text-ink-50">
              Quick Links
            </h3>
            
            <ul className="space-y-3 mb-6">
              {[
                { name: 'Home', href: '#', onClick: scrollToTop },
                { name: 'About', href: '#about' },
                { name: 'Projects', href: '#projects' },
                { name: 'Activity', href: '#activity' },
                { name: 'Skills', href: '#skills' },
                { name: 'Philosophy', href: '#philosophy' },
                { name: 'Contact', href: '#contact' }
              ].map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    onClick={link.onClick || undefined}
                    className="text-ink-300 hover:text-signal transition-colors flex items-center gap-2 group py-2"
                  >
                    <span className="text-signal opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="p-4 bg-ink-850 border border-ink-800">
              <h4 className="text-ink-50 font-bold mb-2">Engineering Heritage</h4>
              <p className="text-ink-300 text-sm">
                Bringing African innovation and engineering excellence to digital solutions
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-ink-800 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-ink-400 text-sm">
              © {new Date().getFullYear()} .     
               <span>All rights reserved.</span> 
            </p>
            
            
            
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;