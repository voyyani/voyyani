/**
 * Web Vitals Tracking Module
 * Monitors and reports Core Web Vitals to Google Analytics
 * 
 * Core Web Vitals (Updated for web-vitals v3+):
 * - LCP (Largest Contentful Paint): Loading performance
 * - INP (Interaction to Next Paint): Responsiveness (replaces FID)
 * - CLS (Cumulative Layout Shift): Visual stability
 * 
 * Other Metrics:
 * - FCP (First Contentful Paint): Loading
 * - TTFB (Time to First Byte): Server response time
 */

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { trackEvent } from './analytics';

/**
 * Initialize Web Vitals tracking
 * Call this once when the app loads
 */
export const initWebVitals = () => {
  try {
    // Track Largest Contentful Paint (LCP)
    // Good: < 2.5s, Needs Improvement: 2.5s - 4s, Poor: > 4s
    onLCP(sendToAnalytics);

    // Track Interaction to Next Paint (INP) - replaces FID in v3
    // Good: < 200ms, Needs Improvement: 200ms - 500ms, Poor: > 500ms
    onINP(sendToAnalytics);

    // Track Cumulative Layout Shift (CLS)
    // Good: < 0.1, Needs Improvement: 0.1 - 0.25, Poor: > 0.25
    onCLS(sendToAnalytics);

    // Track First Contentful Paint (FCP)
    // Good: < 1.8s, Needs Improvement: 1.8s - 3s, Poor: > 3s
    onFCP(sendToAnalytics);

    // Track Time to First Byte (TTFB)
    // Good: < 800ms, Needs Improvement: 800ms - 1800ms, Poor: > 1800ms
    onTTFB(sendToAnalytics);

    console.log('[Web Vitals] Tracking initialized');
  } catch (error) {
    console.error('[Web Vitals] Initialization failed:', error);
  }
};

/**
 * Send Web Vitals data to Google Analytics
 */
const sendToAnalytics = ({ name, value, rating, delta, id }) => {
  // Send to Google Analytics via our analytics module
  trackEvent('web_vitals', {
    metric_name: name,
    metric_value: Math.round(name === 'CLS' ? value * 1000 : value),
    metric_delta: Math.round(name === 'CLS' ? delta * 1000 : delta),
    metric_rating: rating,
    metric_id: id,
  });

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(name === 'CLS' ? value * 1000 : value) / (name === 'CLS' ? 1000 : 1),
      rating,
      delta,
    });
  }
};

/**
 * Get rating for a metric based on thresholds
 */
export const getRating = (name, value) => {
  const thresholds = {
    LCP: { good: 2500, needsImprovement: 4000 },
    INP: { good: 200, needsImprovement: 500 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = () => {
  const performance = window.performance;
  
  if (!performance || !performance.timing) {
    return null;
  }

  const timing = performance.timing;
  
  return {
    // Navigation timing
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    dom: timing.domComplete - timing.domLoading,
    
    // Paint timing
    firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    
    // Total load time
    loadTime: timing.loadEventEnd - timing.navigationStart,
  };
};

/**
 * Report a custom performance mark
 */
export const reportPerformanceMark = (name) => {
  try {
    if (performance.mark) {
      performance.mark(name);
      
      trackEvent('performance_mark', {
        mark_name: name,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('[Web Vitals] Failed to create performance mark:', error);
  }
};

/**
 * Track long tasks (tasks taking > 50ms)
 */
export const trackLongTasks = () => {
  try {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Track tasks longer than 50ms (blocking main thread)
          if (entry.duration > 50) {
            trackEvent('long_task', {
              duration: Math.round(entry.duration),
              start_time: Math.round(entry.startTime),
            });

            if (import.meta.env.DEV) {
              console.warn(`[Web Vitals] Long task detected: ${Math.round(entry.duration)}ms`);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    }
  } catch (error) {
    console.error('[Web Vitals] Long task tracking failed:', error);
  }
};

/**
 * Get a summary of all Web Vitals
 */
export const getWebVitalsSummary = () => {
  const metrics = getPerformanceMetrics();
  
  return {
    timestamp: new Date().toISOString(),
    metrics,
    userAgent: navigator.userAgent,
    connection: navigator.connection ? {
      effectiveType: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt,
    } : null,
  };
};

export default {
  initWebVitals,
  getRating,
  getPerformanceMetrics,
  reportPerformanceMark,
  trackLongTasks,
  getWebVitalsSummary,
};
