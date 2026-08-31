import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../utils/analytics';

/**
 * Cookie consent.
 *
 * Rewritten into the Kanga Sheet, and corrected while it was open.
 *
 * The panel used to offer a "Marketing Cookies" toggle described as tracking visitors
 * across websites to display relevant advertisements. This site has no ad tech of any
 * kind, and nothing read that preference — so the control governed nothing and the
 * sentence beside it was untrue. Consent copy that describes behaviour the product does
 * not have is worse than no banner. The key survives in the stored shape so an existing
 * visitor's saved consent still parses; it is simply always false and never offered.
 *
 * What is actually loaded, and now named: Google Analytics and Sentry error reporting,
 * both behind the single analytics preference (see App.jsx — Sentry previously
 * initialised on ANY stored decision, including "Reject all").
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
      /**
       * Wait for the visitor to leave the first viewport.
       *
       * This fired on a 1s timer, which on a 390px phone covered the lead panel's jina
       * mid-sentence — so the first screen carried a client's hero and a cookie dialog,
       * and none of Karisa's own claim. Nothing is loaded before consent either way, so
       * there is no reason to ask before the visitor has read anything. The 20s floor
       * catches someone who lands and never scrolls.
       */
      const reveal = () => {
        setShowBanner(true);
        window.removeEventListener('scroll', onScroll);
      };
      const onScroll = () => {
        if (window.scrollY > window.innerHeight * 0.6) reveal();
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      const fallback = setTimeout(reveal, 20000);

      return () => {
        window.removeEventListener('scroll', onScroll);
        clearTimeout(fallback);
      };
    } else {
      // Load saved preferences
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved);
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
      }
    }

    return undefined;
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
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 32, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 bottom-0 z-[70] max-h-[70svh] overflow-y-auto px-4 pb-4 sm:px-6"
        role="region"
        aria-label="Cookie preferences"
      >
        <div className="mx-auto max-w-sheet border-2 border-pindo bg-cloth-50 p-4 sm:p-5">
          {!showSettings ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-prose">
                <h2 className="font-display text-lg font-bold text-mark-900">
                  Measurement, with your permission
                </h2>
                <p className="mt-1.5 text-sm text-mark-700">
                  Google Analytics and Sentry error reporting, nothing else, nothing sold or
                  shared. Decline and the site works the same.{' '}
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="link font-semibold"
                  >
                    What each one does
                  </button>
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <button type="button" onClick={handleRejectAll} className="btn-outline px-5 py-2.5">
                  Decline
                </button>
                <button type="button" onClick={handleAcceptAll} className="btn-pindo px-5 py-2.5">
                  Allow
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-title font-bold text-mark-900">
                  What this site can load
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="shrink-0 border border-cloth-400 p-2 text-mark-700 transition-colors duration-250 ease-press hover:border-pindo hover:text-pindo"
                  aria-label="Close settings"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <dl className="mt-5 border-t border-cloth-300">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-cloth-300 py-4">
                  <div className="max-w-prose">
                    <dt className="font-semibold text-mark-900">Strictly necessary</dt>
                    <dd className="m-0 mt-1 text-sm text-mark-600">
                      Your consent choice itself, stored in this browser. Nothing else. It cannot
                      be turned off, because turning it off is what it records.
                    </dd>
                  </div>
                  <span className="mark-state shrink-0">Always on</span>
                </div>

                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-cloth-300 py-4">
                  <div className="max-w-prose">
                    <dt className="font-semibold text-mark-900">Measurement and error reporting</dt>
                    <dd className="m-0 mt-1 text-sm text-mark-600">
                      Google Analytics — which pages are read, from where, on what device. Sentry —
                      the stack trace when something on this site breaks. Neither is used for
                      advertising.
                    </dd>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting('analytics')}
                    role="switch"
                    aria-checked={preferences.analytics}
                    className={`shrink-0 border-2 px-4 py-2 text-sm font-semibold transition-colors duration-250 ease-press ${
                      preferences.analytics
                        ? 'border-pindo bg-pindo text-cloth-50'
                        : 'border-cloth-400 text-mark-700 hover:border-pindo hover:text-pindo'
                    }`}
                  >
                    {preferences.analytics ? 'Allowed' : 'Declined'}
                  </button>
                </div>
              </dl>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={handleSavePreferences} className="btn-pindo">
                  Save choice
                </button>
                <button type="button" onClick={() => setShowSettings(false)} className="btn-outline">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
