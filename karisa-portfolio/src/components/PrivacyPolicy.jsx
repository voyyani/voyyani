import { motion } from 'framer-motion';
import { useState } from 'react';
import { SITE } from '../config/site';

/**
 * Privacy Policy Component
 * Detailed privacy policy with sections and navigation
 */
const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: '📋' },
    { id: 'information-collection', title: 'Information We Collect', icon: '📊' },
    { id: 'cookies', title: 'Cookies & Tracking', icon: '🍪' },
    { id: 'data-usage', title: 'How We Use Your Data', icon: '⚙️' },
    { id: 'data-sharing', title: 'Data Sharing', icon: '🔗' },
    { id: 'security', title: 'Security', icon: '🔒' },
    { id: 'your-rights', title: 'Your Rights', icon: '⚖️' },
    { id: 'contact', title: 'Contact Us', icon: '📧' },
  ];

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-ink-50">
      {/* Header */}
      <div className="bg-ink-950 border-b border-signal/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-ink-50">
            Privacy Policy
          </h1>
          <p className="text-ink-300 mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-4 py-2  transition-all ${
                    activeSection === section.id
                      ? 'bg-signal/20 text-signal border-l-4 border-signal'
                      : 'text-ink-300 hover:bg-ink-900 hover:text-ink-50'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </button>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Introduction */}
            <section id="introduction">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>📋</span> Introduction
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-ink-200 leading-relaxed">
                  Welcome to Karisa Voyani's portfolio website. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website. We are committed to protecting your privacy and ensuring transparency about our data practices.
                </p>
                <p className="text-ink-200 leading-relaxed mt-4">
                  By using this website, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>
            </section>

            {/* Information Collection */}
            <section id="information-collection">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>📊</span> Information We Collect
              </h2>
              <div className="space-y-4">
                <div className="bg-ink-900/50 p-6 border border-ink-800">
                  <h3 className="text-xl font-semibold mb-3 text-signal">Information You Provide</h3>
                  <ul className="list-disc list-inside space-y-2 text-ink-200">
                    <li><strong>Contact Form:</strong> Name, email address, and message content</li>
                    <li><strong>Voluntary Information:</strong> Any additional information you choose to provide</li>
                  </ul>
                </div>

                <div className="bg-ink-900/50 p-6 border border-ink-800">
                  <h3 className="text-xl font-semibold mb-3 text-signal">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-ink-200">
                    <li><strong>Analytics Data:</strong> Page views, session duration, bounce rate, and traffic sources</li>
                    <li><strong>Device Information:</strong> Browser type, device type, operating system, and screen resolution</li>
                    <li><strong>Performance Data:</strong> Page load times, Core Web Vitals (LCP, FID, CLS)</li>
                    <li><strong>IP Address:</strong> Anonymized for analytics purposes</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section id="cookies">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>🍪</span> Cookies & Tracking Technologies
              </h2>
              <div className="space-y-4">
                <p className="text-ink-200">
                  We use cookies and similar tracking technologies to improve your experience and analyze website usage.
                </p>

                <div className="space-y-3">
                  <div className="bg-ink-900/50 p-4 border border-ink-800">
                    <h4 className="font-semibold text-ink-50 mb-2">Necessary Cookies (Always Active)</h4>
                    <p className="text-sm text-ink-300">
                      Essential for core functionality like cookie consent preferences and session management.
                    </p>
                  </div>

                  <div className="bg-ink-900/50 p-4 border border-ink-800">
                    <h4 className="font-semibold text-ink-50 mb-2">Analytics Cookies (Optional)</h4>
                    <p className="text-sm text-ink-300">
                      Google Analytics 4 tracks user behavior, page views, and traffic sources. IP addresses are anonymized.
                    </p>
                  </div>

                  <div className="bg-ink-900/50 p-4 border border-ink-800">
                    <h4 className="font-semibold text-ink-50 mb-2">Performance Monitoring (Optional)</h4>
                    <p className="text-sm text-ink-300">
                      Web Vitals tracking and Sentry error monitoring to improve site performance and user experience.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Usage */}
            <section id="data-usage">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>⚙️</span> How We Use Your Data
              </h2>
              <div className="bg-ink-900/50 p-6 border border-ink-800">
                <ul className="space-y-3 text-ink-200">
                  <li className="flex items-start gap-3">
                    <span className="text-signal mt-1">✓</span>
                    <span><strong>Respond to inquiries:</strong> Process and respond to messages sent via the contact form</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-signal mt-1">✓</span>
                    <span><strong>Improve user experience:</strong> Analyze how visitors use the site to enhance functionality</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-signal mt-1">✓</span>
                    <span><strong>Monitor performance:</strong> Track Core Web Vitals and errors to ensure optimal performance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-signal mt-1">✓</span>
                    <span><strong>Understand traffic:</strong> Analyze visitor demographics and traffic sources</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Sharing */}
            <section id="data-sharing">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>🔗</span> Data Sharing & Third Parties
              </h2>
              <div className="space-y-4">
                <p className="text-ink-200">
                  We do not sell your personal information. We share data only with the following service providers:
                </p>
                <div className="grid gap-4">
                  <div className="bg-ink-900/50 p-4 border border-ink-800">
                    <h4 className="font-semibold text-ink-50 mb-2">Google Analytics 4</h4>
                    <p className="text-sm text-ink-300">
                      Analytics and website usage tracking. 
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-signal hover:underline ml-1">
                        Privacy Policy →
                      </a>
                    </p>
                  </div>
                  <div className="bg-ink-900/50 p-4 border border-ink-800">
                    <h4 className="font-semibold text-ink-50 mb-2">Sentry.io</h4>
                    <p className="text-sm text-ink-300">
                      Error monitoring and performance tracking.
                      <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-signal hover:underline ml-1">
                        Privacy Policy →
                      </a>
                    </p>
                  </div>
                  <div className="bg-ink-900/50 p-4 border border-ink-800">
                    <h4 className="font-semibold text-ink-50 mb-2">EmailJS</h4>
                    <p className="text-sm text-ink-300">
                      Contact form message delivery.
                      <a href="https://www.emailjs.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-signal hover:underline ml-1">
                        Privacy Policy →
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section id="security">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>🔒</span> Security
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-ink-200 leading-relaxed">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-ink-200 mt-4">
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Secure cookie flags (HttpOnly, Secure, SameSite)</li>
                  <li>IP address anonymization for analytics</li>
                  <li>Regular security updates and monitoring</li>
                  <li>Limited data retention periods</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section id="your-rights">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>⚖️</span> Your Privacy Rights
              </h2>
              <div className="bg-ink-900 border border-signal/30 p-6">
                <p className="text-ink-200 mb-4">You have the right to:</p>
                <ul className="space-y-3 text-ink-200">
                  <li className="flex items-start gap-3">
                    <span className="text-signal">•</span>
                    <span><strong>Access:</strong> Request a copy of your personal data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-signal">•</span>
                    <span><strong>Rectification:</strong> Correct inaccurate or incomplete data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-signal">•</span>
                    <span><strong>Erasure:</strong> Request deletion of your data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-signal">•</span>
                    <span><strong>Opt-out:</strong> Withdraw consent for cookies and tracking at any time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-signal">•</span>
                    <span><strong>Data portability:</strong> Receive your data in a machine-readable format</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section id="contact">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>📧</span> Contact Us
              </h2>
              <div className="bg-ink-900/50 p-6 border border-ink-800">
                <p className="text-ink-200 mb-4">
                  For privacy-related questions or to exercise your rights, please contact:
                </p>
                <div className="space-y-2 text-ink-200">
                  <p><strong>Email:</strong> <a href={`mailto:${SITE.email}`} className="text-signal hover:underline">{SITE.email}</a></p>
                  <p><strong>Website:</strong> <a href={SITE.url} className="text-signal hover:underline">{SITE.url}</a></p>
                </div>
                <p className="text-sm text-ink-300 mt-4">
                  We will respond to your request within 30 days.
                </p>
              </div>
            </section>

            {/* Footer Note */}
            <div className="border-t border-ink-800 pt-8 mt-12">
              <p className="text-sm text-ink-300 text-center">
                This privacy policy is effective as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
