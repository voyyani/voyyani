/**
 * Analytics Utility Module
 * Centralized analytics tracking for Google Analytics 4
 * 
 * Features:
 * - Page view tracking
 * - Event tracking with custom parameters
 * - User engagement metrics
 * - Conversion tracking
 * - Error tracking integration
 */

// Google Analytics 4 Measurement ID (replace with your actual ID)
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

/**
 * Initialize Google Analytics
 * Call this once when the app loads
 */
export const initGA = () => {
  if (typeof window === 'undefined') return;
  
  // Only initialize in production
  if (import.meta.env.MODE !== 'production' && !import.meta.env.VITE_GA_DEBUG) {
    console.log('[Analytics] GA4 disabled in development mode');
    return;
  }

  // Check if gtag is already loaded
  if (window.gtag) {
    console.log('[Analytics] GA4 already initialized');
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll send page views manually
    anonymize_ip: true, // GDPR compliance
    cookie_flags: 'SameSite=None;Secure',
  });

  console.log('[Analytics] GA4 initialized:', GA_MEASUREMENT_ID);
};

/**
 * Track page views
 * @param {string} path - Page path
 * @param {string} title - Page title
 */
export const trackPageView = (path, title) => {
  if (!window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });

  console.log('[Analytics] Page view:', path, title);
};

/**
 * Track custom events
 * @param {string} eventName - Event name (e.g., 'button_click', 'form_submit')
 * @param {object} params - Event parameters
 */
export const trackEvent = (eventName, params = {}) => {
  if (!window.gtag) return;

  window.gtag('event', eventName, {
    ...params,
    timestamp: new Date().toISOString(),
  });

  console.log('[Analytics] Event:', eventName, params);
};

/**
 * Track navigation events
 */
export const trackNavigation = (section) => {
  trackEvent('navigation', {
    event_category: 'Navigation',
    event_label: section,
    section_name: section,
  });
};

/**
 * Track CTA button clicks
 */
export const trackCTAClick = (buttonName, destination) => {
  trackEvent('cta_click', {
    event_category: 'CTA',
    event_label: buttonName,
    button_name: buttonName,
    destination: destination,
  });
};

/**
 * Track project views
 */
export const trackProjectView = (projectName) => {
  trackEvent('project_view', {
    event_category: 'Engagement',
    event_label: projectName,
    project_name: projectName,
  });
};

/**
 * Track contact form submissions
 */
export const trackFormSubmission = (formName, success = true) => {
  trackEvent('form_submit', {
    event_category: 'Form',
    event_label: formName,
    form_name: formName,
    success: success,
  });
};

/**
 * Track external link clicks
 */
export const trackExternalLink = (url, linkText) => {
  trackEvent('external_link', {
    event_category: 'Outbound',
    event_label: url,
    link_url: url,
    link_text: linkText,
  });
};

/**
 * Track download events
 */
export const trackDownload = (fileName, fileType) => {
  trackEvent('file_download', {
    event_category: 'Download',
    event_label: fileName,
    file_name: fileName,
    file_type: fileType,
  });
};

/**
 * Track scroll depth
 */
export const trackScrollDepth = (depth) => {
  trackEvent('scroll', {
    event_category: 'Engagement',
    event_label: `${depth}%`,
    scroll_depth: depth,
  });
};

/**
 * Track errors
 */
export const trackError = (errorMessage, errorStack, fatal = false) => {
  trackEvent('exception', {
    description: errorMessage,
    fatal: fatal,
    error_stack: errorStack?.substring(0, 150), // Limit stack trace length
  });
};

/**
 * Set user properties
 */
export const setUserProperty = (propertyName, value) => {
  if (!window.gtag) return;

  window.gtag('set', 'user_properties', {
    [propertyName]: value,
  });
};

/**
 * Track timing events (performance)
 */
export const trackTiming = (category, variable, value, label) => {
  trackEvent('timing_complete', {
    event_category: category,
    event_label: label,
    name: variable,
    value: Math.round(value),
  });
};

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackNavigation,
  trackCTAClick,
  trackProjectView,
  trackFormSubmission,
  trackExternalLink,
  trackDownload,
  trackScrollDepth,
  trackError,
  setUserProperty,
  trackTiming,
};
