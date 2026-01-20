/**
 * Sentry Error Monitoring Configuration
 * Production-grade error tracking and performance monitoring
 * 
 * Features:
 * - Automatic error capture
 * - Performance monitoring
 * - User feedback
 * - Release tracking
 * - Source maps support
 */

import * as Sentry from '@sentry/react';

// Sentry DSN (replace with your actual DSN)
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

/**
 * Initialize Sentry
 * Call this once when the app loads
 */
export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.log('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  // Only initialize in production or when explicitly enabled
  if (import.meta.env.MODE !== 'production' && !import.meta.env.VITE_SENTRY_DEBUG) {
    console.log('[Sentry] Disabled in development mode');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking (use git commit SHA or version)
      release: `portfolio@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      
      // Performance Monitoring
      integrations: [
        // Browser tracing for performance monitoring
        Sentry.browserTracingIntegration({
          // Trace all navigation
          tracePropagationTargets: [
            'localhost',
            'voyani.tech',
            /^\//,
          ],
        }),
        
        // Replay integration for session recording (only on errors)
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring sample rate
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      
      // Session Replay sample rate
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Always capture replays on errors
      
      // Before send hook for filtering
      beforeSend(event, hint) {
        // Filter out non-critical errors in production
        if (import.meta.env.MODE === 'production') {
          // Ignore ResizeObserver errors (common browser quirk)
          if (event.message?.includes('ResizeObserver')) {
            return null;
          }
          
          // Ignore network errors from ad blockers
          if (event.message?.includes('adsbygoogle')) {
            return null;
          }
        }
        
        // Add custom context
        event.contexts = {
          ...event.contexts,
          app: {
            version: import.meta.env.VITE_APP_VERSION,
            buildTime: import.meta.env.VITE_BUILD_TIME,
          },
        };
        
        return event;
      },
      
      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        
        // Network errors
        'NetworkError',
        'Failed to fetch',
        
        // Third-party script errors
        'Script error',
      ],
      
      // Deny URLs to prevent tracking third-party errors
      denyUrls: [
        // Browser extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^moz-extension:\/\//i,
        
        // Facebook flakiness
        /graph\.facebook\.com/i,
        
        // Google Analytics
        /google-analytics\.com/i,
        /googletagmanager\.com/i,
      ],
    });

    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Initialization failed:', error);
  }
};

/**
 * Set user context
 */
export const setSentryUser = (userId, email, username) => {
  Sentry.setUser({
    id: userId,
    email: email,
    username: username,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message, category = 'custom', level = 'info', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Capture exception manually
 */
export const captureException = (error, context = {}) => {
  Sentry.captureException(error, {
    tags: context.tags,
    extra: context.extra,
    level: context.level || 'error',
  });
};

/**
 * Capture message
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  Sentry.captureMessage(message, {
    level,
    tags: context.tags,
    extra: context.extra,
  });
};

/**
 * Set custom tag
 */
export const setTag = (key, value) => {
  Sentry.setTag(key, value);
};

/**
 * Set custom context
 */
export const setContext = (name, context) => {
  Sentry.setContext(name, context);
};

/**
 * Show user feedback dialog
 */
export const showFeedbackDialog = () => {
  const eventId = Sentry.captureMessage('User Feedback');
  
  Sentry.showReportDialog({
    eventId,
    title: 'It looks like something went wrong',
    subtitle: 'Help us improve by telling us what happened.',
    subtitle2: 'Your feedback is valuable to us.',
    labelName: 'Name',
    labelEmail: 'Email',
    labelComments: 'What happened?',
    labelClose: 'Close',
    labelSubmit: 'Submit',
    errorGeneric: 'An error occurred while submitting your feedback. Please try again.',
    errorFormEntry: 'Please check your entries and try again.',
    successMessage: 'Thank you for your feedback!',
  });
};

/**
 * Wrap component with Sentry Error Boundary
 */
export const withSentryErrorBoundary = (component, options = {}) => {
  return Sentry.withErrorBoundary(component, {
    fallback: options.fallback,
    showDialog: options.showDialog || false,
    dialogOptions: {
      title: 'Oops! Something went wrong',
      subtitle: 'Our team has been notified.',
    },
  });
};

/**
 * Profile component performance
 */
export const withSentryProfiler = (component, name) => {
  return Sentry.withProfiler(component, { name });
};

export default {
  initSentry,
  setSentryUser,
  clearSentryUser,
  addBreadcrumb,
  captureException,
  captureMessage,
  setTag,
  setContext,
  showFeedbackDialog,
  withSentryErrorBoundary,
  withSentryProfiler,
};
