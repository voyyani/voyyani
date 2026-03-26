# Production Deployment Checklist - Phase 3

## Pre-Deployment Verification

### Database & Schema

- [ ] **Schema Applied**: Execute `supabase/schema.sql` on production database
- [ ] **Rate Limits Table Exists**: Verify `rate_limits` table is present
  ```sql
  SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'rate_limits'
  ```
- [ ] **Indexes Created**: Check indexes exist and are active
  ```sql
  SELECT schemaname, tablename, indexname FROM pg_indexes
  WHERE tablename IN ('rate_limits', 'submissions', 'submission_replies')
  ```
- [ ] **RLS Policies Enabled**: Verify all policies are in place
  ```sql
  SELECT * FROM pg_policies WHERE schemaname = 'public'
  ```

### Environment Variables

- [ ] **SUPABASE_URL**: Set to production URL
- [ ] **SUPABASE_SERVICE_ROLE_KEY**: Stored securely (never in version control)
- [ ] **SUPABASE_ANON_KEY**: Set correctly
- [ ] **RESEND_API_KEY**: Configured with production key
- [ ] **VITE_SENTRY_DSN**: Pointing to production Sentry project
- [ ] **PORTFOLIO_URL**: Set to `https://voyani.tech`
- [ ] **DASHBOARD_URL**: Set to `https://voyani.tech/admin/submissions`
- [ ] **ADMIN_EMAIL**: Set to correct email

### Backend Functions

- [ ] **send-notification Function**:
  - [ ] Deployed to Supabase
  - [ ] CSRF token validation enabled
  - [ ] CORS correctly restricted
  - [ ] Rate limiting working
  - [ ] Error logging to Sentry

- [ ] **send-reply Function**:
  - [ ] Deployed to Supabase
  - [ ] JWT verification implemented
  - [ ] CORS correctly restricted (portfolio domain only)
  - [ ] Persistent rate limiting (database-backed) working
  - [ ] Error logging to Sentry
  - [ ] Test: Can send reply as admin
  - [ ] Test: Cannot send reply as non-admin

### Frontend Configuration

- [ ] **CSRF Token Utility**:
  - [ ] `src/utils/csrfTokens.ts` exists
  - [ ] Exports: generateCSRFToken, getCSRFToken, validateCSRFToken, clearCSRFToken
  - [ ] SessionStorage integration working

- [ ] **ContactForm Component**:
  - [ ] Imports CSRF utility
  - [ ] Initializes CSRF token on mount
  - [ ] Sends token with form submission
  - [ ] Clears and regenerates token after success

- [ ] **Sentry Integration**:
  - [ ] Initialized in main.jsx with production DSN
  - [ ] Environment set to 'production'
  - [ ] Release version set correctly
  - [ ] Error callbacks configured

### Monitoring & Logging

- [ ] **Sentry Project Created**: https://sentry.io
- [ ] **Sentry Alerts Configured**:
  - [ ] Alert on security errors (tags: type='security_error')
  - [ ] Alert on rate limit violations (tags: type='rate_limit')
  - [ ] Alert on auth failures (tags: type='auth_error')
  - Alert email configured

- [ ] **Cloud Logging**:
  - [ ] Supabase function logs accessible
  - [ ] Function execution logs visible
  - [ ] Error logs being captured

### Security Audit

- [ ] **Security Header Check**:
  - [ ] Test: `curl -I https://voyani.tech`
  - [ ] Verify CSP header present (if implemented)
  - [ ] Verify X-Frame-Options: DENY (if implemented)

- [ ] **CORS Testing**:
  - [ ] Request from voyani.tech: Succeeds
  - [ ] Request from external domain: Blocked
  - [ ] OPTIONS preflight: Allowed

- [ ] **JWT Token Verification**:
  - [ ] Token expiration checking working
  - [ ] Invalid tokens rejected (401)
  - [ ] Missing authorization header rejected (401)

- [ ] **Rate Limiting**:
  - [ ] Contact form rate limit: 30 seconds between submissions
  - [ ] Admin reply rate limit: 20 per day
  - [ ] Test: Send 21 replies, verify 21st is rejected

- [ ] **CSRF Protection**:
  - [ ] Token generated on form load (sessionStorage)
  - [ ] Token sent with submission
  - [ ] API rejects missing CSRF token (403)
  - [ ] API rejects invalid CSRF token (403)

- [ ] **Input Validation**:
  - [ ] All fields validated with Zod schemas
  - [ ] HTML injection attempts escaped
  - [ ] Email format validated
  - [ ] Message length validated (20-5000 chars)

### Performance Testing

- [ ] **Database Performance**:
  - [ ] Rate limit query: < 10ms (with index)
  - [ ] Submission query: < 100ms (with index)
  - [ ] Pagination working (SubmissionsPage)
  - [ ] No N+1 queries

- [ ] **API Response Time**:
  - [ ] Form submission: < 3s
  - [ ] Reply send: < 5s
  - [ ] Dashboard load: < 2s
  - [ ] Single submission view: < 1s

- [ ] **Email Delivery**:
  - [ ] Resend API responds in < 1s
  - [ ] Emails delivered to inbox within 1 minute
  - [ ] No bounces or failures
  - [ ] Retry logic working (test with invalid API key)

### Database Backups

- [ ] **Automatic Backups Enabled**:
  - [ ] Go to Supabase Dashboard > Settings > Backups
  - [ ] Backup frequency set (daily recommended)
  - [ ] Backup retention set (7+ days recommended)

- [ ] **Backup Content Verified**:
  - [ ] Backups include submissions table
  - [ ] Backups include submission_replies table
  - [ ] Backups include quick_reply_templates table
  - [ ] Backups include rate_limits table (NEW)

- [ ] **Restore Procedure Documented**:
  - [ ] Document backup restore steps
  - [ ] Test restore on dev environment
  - [ ] Estimate RTO/RPO (Recovery Time/Point Objectives)

### Admin Dashboard

- [ ] **Authentication**:
  - [ ] Login page loads
  - [ ] Email validation working
  - [ ] Password minimum requirements (6 chars)
  - [ ] Invalid credentials show error

- [ ] **Role-Based Access**:
  - [ ] Admin user can access /admin/submissions
  - [ ] Non-admin redirected to login
  - [ ] All CRUD operations working

- [ ] **Dashboard Features**:
  - [ ] Real-time stats refresh (30s interval)
  - [ ] Search functionality (name, email, subject)
  - [ ] Filter by status (new, in_progress, responded, closed)
  - [ ] Sort options working
  - [ ] Submission detail view loads
  - [ ] Reply functionality works
  - [ ] Notes editor works

### Error Handling

- [ ] **Form Submission Errors**:
  - [ ] Invalid email shows error
  - [ ] Missing required fields show error
  - [ ] Rate limit exceeded shows helpful message
  - [ ] API errors display friendly messages

- [ ] **Admin Reply Errors**:
  - [ ] Unauthorized (non-admin) shows 403 error
  - [ ] Rate limit exceeded shows 429 error
  - [ ] Invalid JWT shows 401 error
  - [ ] Validation errors show 400

- [ ] **Recovery**:
  - [ ] Errors logged to Sentry
  - [ ] User-friendly error messages
  - [ ] Retry UI for transient failures
  - [ ] Graceful degradation

### Documentation

- [ ] **Phase 3 Security Hardening Document**: `docs/PHASE3_SECURITY_HARDENING.md` exists
- [ ] **Phase 3 Testing Guide**: `docs/PHASE3_TESTING_GUIDE.md` exists
- [ ] **README Updated**: Links to Phase 3 documentation
- [ ] **Deployment Notes**: Documented in commit message or wiki
- [ ] **Admin Runbooks**: Created procedures for:
  - [ ] How to manage admin users
  - [ ] How to review security events
  - [ ] How to handle rate limit issues
  - [ ] How to investigate security incidents

---

## Deployment Steps

### Step 1: Pre-Deployment Backup

```bash
# Backup current database
# Via Supabase Dashboard: Click "Create Manual Backup"
```

### Step 2: Apply Database Schema

```bash
# Option A: Supabase Dashboard SQL Editor
# Copy contents of supabase/schema.sql
# Paste into SQL Editor
# Click "Execute"

# Option B: Via CLI
supabase db push
```

### Step 3: Deploy Edge Functions

```bash
# Deploy send-notification
supabase functions deploy send-notification --project-ref PROJECT_ID

# Deploy send-reply
supabase functions deploy send-reply --project-ref PROJECT_ID
```

### Step 4: Update Frontend & Configuration

```bash
# Build frontend
npm run build

# Test build locally
npm run preview

# Deploy (to Vercel, Netlify, or your hosting)
# Ensure all env vars are set in production
```

### Step 5: Verify Deployment

```bash
# Run through testing checklist above
# Focus on:
# - CORS restrictions
# - JWT verification
# - Rate limiting
# - CSRF protection
# - Error logging to Sentry
```

### Step 6: Monitor & Alert

```bash
# Check Sentry for errors
# Monitor performance metrics
# Check rate limit violators
# Verify email delivery success
```

---

## Rollback Plan

If deployment fails:

### Quick Rollback

```bash
# 1. Revert edge functions to previous version
#    (in Supabase Dashboard: Functions > version history)

# 2. Revert frontend to previous deployment
#    (via Vercel/Netlify: Deployments > Rollback)

# 3. Restore database from backup
#    (Supabase Dashboard: Settings > Backups > Restore)
```

### Manual Rollback Steps

1. **Stop new deployments**: Don't push any new changes
2. **Restore database backup**: Use pre-deployment backup
3. **Revert edge functions**: Use Supabase function versioning
4. **Revert frontend**: Roll back to previous build
5. **Verify**: Test all critical flows

### Partial Rollback

If only specific components need rollback:
- Frontend: Revert just the frontend build
- Edge Functions: Revert just the function deployment
- Database: Restore from backup (full database)

---

## Post-Deployment Monitoring

### Day 1: Immediate Checks

- [ ] **API Health**: Verify functions responding
- [ ] **Error Rate**: Check Sentry for > 5% error rate
- [ ] **Performance**: Verify response times < targets
- [ ] **Rate Limiting**: Confirm working (check database)
- [ ] **Email Delivery**: Verify test emails sent
- [ ] **Admin Dashboard**: Test submission management

### Week 1: Monitoring

- [ ] **Daily Check**: Review Sentry alerts
- [ ] **Performance Trends**: Verify consistent response times
- [ ] **User Feedback**: Check for issues reported
- [ ] **Security Events**: Review auth/rate limit violations
- [ ] **Database**: Monitor growth and query performance

### Monthly: Reviews

- [ ] **Security Audit**: Review all access logs
- [ ] **Performance**: Analyze metrics, identify bottlenecks
- [ ] **Backups**: Verify daily backups running
- [ ] **Alerts**: Adjust thresholds based on patterns
- [ ] **Updates**: Check for dependency updates

---

## Success Criteria

✅ **Deployment is successful if:**

1. **Security**: All security checks pass (CORS, JWT, rate limiting, CSRF)
2. **Functionality**: All features work end-to-end (form submission, admin reply)
3. **Performance**: Response times meet targets (< 3s for form, < 5s for reply)
4. **Monitoring**: Sentry logs errors, no alert storms
5. **Backups**: Database backups created successfully
6. **Documentation**: Phase 3 docs complete and accessible
7. **Zero Blocking Issues**: No critical errors in production for 24+ hours

---

## Sign-Off

- [ ] **Developer**: Code reviewed and tested
- [ ] **Security**: Security audit passed
- [ ] **QA**: Testing checklist completed
- [ ] **DevOps**: Deployment verified
- [ ] **Product**: Features approved for production

**Deployed By**: ___________________________
**Date**: ___________________________
**Version**: 1.0.0 (Phase 3 Complete)
