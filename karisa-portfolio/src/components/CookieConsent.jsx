import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../utils/analytics';

/**
 * Cookie Consent Banner Component
 * GDPR-compliant cookie consent with granular controls
 */
const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    trackEvent('cookie_consent', {
      action: 'accept_all',
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    trackEvent('cookie_consent', {
      action: 'reject_all',
      analytics: false,
      marketing: false,
    });
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    trackEvent('cookie_consent', {
      action: 'custom',
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    });
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply preferences
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: prefs,
    }));
  };

  const toggleSetting = (key) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-ink-950 border border-signal/30 p-6">
            {!showSettings ? (
              // Main Banner
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink-50 mb-2">
                    🍪 We Value Your Privacy
                  </h3>
                  <p className="text-ink-200 text-sm">
                    We use cookies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from. 
                    By clicking "Accept All", you consent to our use of cookies.
                  </p>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-signal hover:text-signal text-sm underline mt-2"
                  >
                    Customize Preferences
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-2 border border-ink-700 text-ink-200 rounded-md hover:bg-ink-900 transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2 bg-signal text-ink-50 rounded-md transition-colors font-medium"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              // Settings Panel
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink-50">
                    Cookie Preferences
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-ink-300 hover:text-ink-50"
                    aria-label="Close settings"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Necessary Cookies */}
                  <div className="flex items-start justify-between p-4 bg-ink-900/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-ink-50">Necessary Cookies</h4>
                        <span className="text-xs bg-signal/20 text-signal px-2 py-0.5 rounded">Required</span>
                      </div>
                      <p className="text-sm text-ink-300 mt-1">
                        Essential for the website to function properly. Cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-6 bg-signal rounded-full flex items-center justify-end p-1">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start justify-between p-4 bg-ink-900/50">
                    <div className="flex-1">
                      <h4 className="font-medium text-ink-50">Analytics Cookies</h4>
                      <p className="text-sm text-ink-300 mt-1">
                        Help us understand how visitors interact with the website (Google Analytics).
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting('analytics')}
                      className="ml-4"
                      aria-label="Toggle analytics cookies"
                    >
                      <div
                        className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${
                          preferences.analytics ? 'bg-signal justify-end' : 'bg-ink-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </button>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start justify-between p-4 bg-ink-900/50">
                    <div className="flex-1">
                      <h4 className="font-medium text-ink-50">Marketing Cookies</h4>
                      <p className="text-sm text-ink-300 mt-1">
                        Track visitors across websites to display relevant advertisements.
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting('marketing')}
                      className="ml-4"
                      aria-label="Toggle marketing cookies"
                    >
                      <div
                        className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${
                          preferences.marketing ? 'bg-signal justify-end' : 'bg-ink-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSavePreferences}
                    className="flex-1 px-6 py-2 bg-signal text-ink-50 rounded-md transition-colors font-medium"
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-2 border border-ink-700 text-ink-200 rounded-md hover:bg-ink-900 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
