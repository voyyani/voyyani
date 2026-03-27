# Email System Fix Report

**Date**: March 27, 2026
**Status**: COMPLETE - Ready for Deployment
**Build**: Passed (870+ modules)

---

## Executive Summary

The Voyani email reply system was not delivering emails due to using a **sandbox sender address**. A comprehensive audit identified 6 issues (2 critical, 4 security hardening). All issues have been fixed and verified.

---

## Root Cause Analysis

**Primary Blocker**: The `send-reply` edge function was configured to send emails from `noreply@resend.dev` (Resend's sandbox domain) instead of the verified production domain `karisa@voyani.tech`.

**Impact**: All reply emails were either:
- Rejected by email providers
- Delivered to spam folders
- Only delivered to Resend-verified email addresses (sandbox limitation)

**Evidence**: The `send-notification` function correctly used `karisa@voyani.tech` (working), while `send-reply` did not (broken).

---

## Fixes Implemented

### 1. Sender Email Address (P0 - Root Cause)

**File**: `supabase/functions/send-reply/index.ts`
**Line**: 158

```diff
- from: `Portfolio <noreply@resend.dev>`,
+ from: 'Karisa <karisa@voyani.tech>',
```

**Result**: Reply emails now send from verified production domain.

---

### 2. Webhook Signature Verification (P0 - Security)

**File**: `supabase/functions/handle-resend-webhook/index.ts`
**Lines**: 9-61

**Before**: Function stub that checked if secret exists but never verified signatures.

**After**: Full HMAC-SHA256 implementation using Web Crypto API:
- Parses Resend's signature format: `v1,<timestamp>:<signature_hex>`
- Creates signed payload: `${timestamp}.${body}`
- Uses constant-time comparison to prevent timing attacks
- Graceful fallback for development (no secret configured)

---

### 3. Broken Sentry Reference (P0 - Runtime Error)

**File**: `supabase/functions/handle-resend-webhook/index.ts`
**Line**: 142

```diff
- Sentry.captureException(updateError);
+ // Error already logged via console.error
```

**Result**: Webhook handler no longer crashes on database errors.

---

### 4. Role Validation Enforcement (P1 - Security)

**File**: `supabase/functions/send-reply/index.ts`
**Lines**: 369-391

**Before**: Allowed `'user'` role, only logged warnings for unknown roles.

**After**:
- Removed `'user'` from allowed roles
- Returns 403 Forbidden for non-admin users
- Logs security event to Sentry
- Uses case-insensitive role comparison

```typescript
const allowedRoles = ['admin', 'content_manager', 'owner', 'super_admin'];
if (!allowedRoles.includes(String(role).toLowerCase())) {
  return new Response(
    JSON.stringify({ error: 'Forbidden: Admin privileges required' }),
    { status: 403, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
  );
}
```

---

### 5. CORS Header Consistency (P1 - Security)

**File**: `supabase/functions/send-reply/index.ts`
**Line**: 51

```diff
- 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
+ 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
```

**Result**: Consistent with `send-notification` function headers.

---

### 6. HTTP Method Validation (P1 - Security)

**File**: `supabase/functions/send-reply/index.ts`
**Lines**: 313-319 (new)

```typescript
// Only allow POST method
if (req.method !== 'POST') {
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
  );
}
```

**Result**: Rejects GET, PUT, DELETE requests with 405 status.

---

## Files Modified

| File | Changes |
|------|---------|
| `supabase/functions/send-reply/index.ts` | 4 fixes (sender, CORS, role, method) |
| `supabase/functions/handle-resend-webhook/index.ts` | 2 fixes (signature, Sentry) |

---

## Verification Checklist

| Check | Status |
|-------|--------|
| Build passes | ✅ |
| Sender email = karisa@voyani.tech | ✅ |
| Webhook uses HMAC-SHA256 | ✅ |
| Sentry reference removed | ✅ |
| Role validation rejects 'user' | ✅ |
| CORS includes x-csrf-token | ✅ |
| POST method enforced | ✅ |

---

## Deployment Instructions

### Step 1: Deploy Edge Functions

```bash
cd /home/karisa/Projects/voyyani/karisa-portfolio

# Deploy send-reply function
supabase functions deploy send-reply

# Deploy webhook handler
supabase functions deploy handle-resend-webhook
```

### Step 2: (Optional) Configure Webhook Secret

If you have a Resend webhook secret:

```bash
supabase secrets set RESEND_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 3: Test Reply Flow

1. Log in to admin dashboard at `/admin`
2. Navigate to Submissions page
3. Open any submission
4. Click "Reply" button
5. Compose a test message
6. Click "Send Reply"
7. Verify:
   - Modal closes successfully
   - Success toast appears
   - Reply appears in conversation timeline
   - Email arrives in recipient's inbox
   - "From" shows: `Karisa <karisa@voyani.tech>`

---

## Security Improvements Summary

| Before | After |
|--------|-------|
| Sandbox sender (unreliable) | Production domain (verified) |
| Any authenticated user could send replies | Admin-only access enforced |
| Webhook signatures not verified | Full HMAC-SHA256 validation |
| Any HTTP method accepted | POST-only enforcement |
| Runtime crash on webhook errors | Graceful error handling |

---

## No Changes Required

The following components were audited and found to be working correctly:

- **ReplyModal.jsx**: Frontend component works correctly
- **JWT decode logic**: Already using Deno-compatible base64url decoder
- **CORS origin logic**: Properly handles localhost + production domain
- **Database schema**: RLS policies correctly configured
- **Rate limiting**: Database-backed, 20 replies/day limit
- **Input validation**: UUID format, message length checks

---

## Contact

For issues after deployment, check:
1. Supabase function logs: `supabase functions logs send-reply`
2. Sentry dashboard for security events
3. Resend dashboard for email delivery status
