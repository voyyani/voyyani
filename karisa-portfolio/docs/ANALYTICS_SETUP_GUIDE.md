# Week 4: Production Analytics & Monitoring Setup Guide

## Quick Start

### 1. Install Dependencies
All packages already installed. If starting fresh:
```bash
npm install --save-dev vite-plugin-pwa workbox-window
npm install web-vitals @sentry/react
```

### 2. Configure Environment Variables
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Required for Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Required for Sentry Error Monitoring  
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Optional - App version for release tracking
VITE_APP_VERSION=1.0.0
```

### 3. Obtain API Keys

#### Google Analytics 4
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create account → Create property
3. Set up Web data stream
4. Copy **Measurement ID** (starts with `G-`)
5. Add to `.env` as `VITE_GA_MEASUREMENT_ID`

#### Sentry.io
1. Go to [Sentry.io](https://sentry.io/)
2. Create free account
3. Create new project (React)
4. Copy **DSN** from Settings → Projects → Client Keys
5. Add to `.env` as `VITE_SENTRY_DSN`

### 4. Build & Test
```bash
# Development mode
npm run dev

# Production build
npm run build

# Run tests
npm test
```

---

## Features Included

### ✅ Google Analytics 4
- Page view tracking
- Custom event tracking (13 events)
- CTA click conversions
- Form submission tracking
- Project engagement metrics
- Scroll depth measurement
- GDPR-compliant (IP anonymization)

### ✅ Web Vitals Monitoring
- LCP (Largest Contentful Paint)
- INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)
- Long task detection (> 50ms)

### ✅ Sentry Error Monitoring
- Automatic error capture
- Performance tracing
- Session replay (on errors)
- User feedback dialog
- Release tracking
- Breadcrumbs & context

### ✅ Progressive Web App (PWA)
- Installable on mobile/desktop
- Offline support with service worker
- Asset caching (fonts, images)
- Auto-update on new version
- App manifest configuration

### ✅ Privacy & Compliance
- Cookie consent banner (GDPR)
- Granular consent controls
- Privacy policy component
- Third-party disclosure
- User rights documentation

---

## Analytics Events Tracked

| Event | Trigger | Parameters |
|-------|---------|------------|
| `page_view` | Route change | path, title |
| `cta_click` | Hero buttons | button, destination |
| `project_view` | Modal open | project_name |
| `skills_category_switch` | Tab change | category |
| `form_submission` | Contact form | form_name, success |
| `cookie_consent` | Consent action | action, analytics, marketing |
| `external_link` | Outbound click | url, text |
| `web_vitals` | Performance | metric_name, value, rating |
| `long_task` | Blocking task | duration, start_time |

---

## File Structure

```
src/
├── utils/
│   ├── analytics.js          # Google Analytics 4 integration
│   ├── webVitals.js          # Core Web Vitals tracking
│   └── sentry.js             # Sentry error monitoring
├── components/
│   ├── CookieConsent.jsx     # GDPR cookie banner
│   ├── PrivacyPolicy.jsx     # Privacy policy page
│   ├── Hero.jsx              # + CTA tracking
│   ├── Projects.jsx          # + Project view tracking
│   ├── Skills.jsx            # + Category switch tracking
│   └── ContactForm.jsx       # + Form submission tracking
└── App.jsx                   # + Analytics initialization
```

---

## Usage Examples

### Track Custom Event
```javascript
import { trackEvent } from './utils/analytics';

trackEvent('button_click', {
  button_name: 'Download Resume',
  button_location: 'Hero Section'
});
```

### Track Form Submission
```javascript
import { trackFormSubmission } from './utils/analytics';

try {
  await submitForm(data);
  trackFormSubmission('Contact Form', true);
} catch (error) {
  trackFormSubmission('Contact Form', false);
}
```

### Capture Error Manually
```javascript
import { captureException } from './utils/sentry';

try {
  riskyOperation();
} catch (error) {
  captureException(error, {
    tags: { operation: 'risky' },
    extra: { userId: '123' }
  });
}
```

---

## Verification

### Development
1. Open DevTools Console
2. Look for initialization logs:
   ```
   [Analytics] Initializing Google Analytics...
   [Web Vitals] Tracking initialized
   [Sentry] Initialized successfully
   ```

### Production
1. **Google Analytics**: Check Real-Time report
2. **Sentry**: Navigate to Issues dashboard
3. **PWA**: Check Application tab for service worker

---

## Troubleshooting

### Analytics Not Working
- ✅ Check `.env` has correct `VITE_GA_MEASUREMENT_ID`
- ✅ Verify cookie consent given (check localStorage)
- ✅ Check browser console for errors
- ✅ Disable ad blockers temporarily

### Sentry Not Capturing Errors
- ✅ Check `.env` has correct `VITE_SENTRY_DSN`
- ✅ Verify in production mode (or `VITE_SENTRY_DEBUG=true`)
- ✅ Test with `captureMessage('test')`

### PWA Not Installing
- ✅ Run production build (`npm run build`)
- ✅ Serve with HTTPS (required for PWA)
- ✅ Check manifest.webmanifest exists in dist/
- ✅ Verify icons are 192x192 and 512x512

### Build Errors
- ✅ Clear node_modules and reinstall
- ✅ Update to latest dependencies
- ✅ Check for TypeScript errors

---

## Performance Impact

| Feature | Bundle Size (gzipped) |
|---------|----------------------|
| Analytics | ~15 KB |
| Web Vitals | ~5 KB |
| Sentry | ~25 KB |
| PWA (runtime) | ~50 KB |
| **Total** | **~95 KB** |

**Total Build**: 221 KB gzipped (excellent)

---

## Next Steps

1. **Deploy to Production**
   - Set environment variables in hosting platform
   - Enable HTTPS for PWA
   - Verify service worker registration

2. **Monitor Dashboards**
   - Google Analytics 4: Track user behavior
   - Sentry: Monitor error rates
   - Search Console: Check Web Vitals

3. **Optimize Based on Data**
   - Identify high-bounce pages
   - Fix performance bottlenecks
   - Reduce error rates

---

## Resources

- [Google Analytics 4 Docs](https://developers.google.com/analytics/devguides/collection/ga4)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [GDPR Compliance](https://gdpr.eu/)

---

**Status**: ✅ Production Ready  
**Last Updated**: January 20, 2026  
**Version**: 4.0
