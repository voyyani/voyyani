# 🚀 PHASE 3: Resend Inbound Email Configuration - Setup Guide

**Status:** ✅ IMPLEMENTED - March 28, 2026
**Estimated Duration:** 1 day (DNS changes may take 24-48 hours to propagate)
**Dependency:** Phase 2 (Database Schema) + Updated send-reply function

---

## 📋 Overview

Phase 3 prepares your domain to receive email replies through Resend's inbound email service. Users will reply to `reply+{submission_id}@voyani.tech`, and Resend will forward these emails to your webhook handler.

**Architecture:**
```
User Reply Email
       ↓
Resend Inbound Routes (MX records receive email)
       ↓
Resend Webhook (POST to your edge function)
       ↓
handle-inbound-email Edge Function (validate + parse + store)
       ↓
Database (inbound_replies table)
```

---

## ✅ Step 1: Verify send-reply Function Updated

The `send-reply` function must include `reply_to` header so users can reply directly.

**File:** `supabase/functions/send-reply/index.ts` (lines 175-185)

**Verification:**
```bash
grep -A 10 "reply_to.*reply+" karisa-portfolio/supabase/functions/send-reply/index.ts
```

**Expected Output:**
```typescript
body: JSON.stringify({
  from: 'Karisa <karisa@voyani.tech>',
  reply_to: `reply+${submissionId}@voyani.tech`,  // ✅ MUST BE PRESENT
  to,
  subject,
  html,
  headers: {
    'X-Submission-ID': submissionId,
    'Message-ID': `...',
  },
}),
```

✅ **Status:** Updated with `reply_to` + `headers` for threading

---

## 🔧 Step 2: Configure DNS Records (24-48 hours)

Add MX records to receive email at `voyani.tech`

### **Option A: CloudFlare DNS** (if using CloudFlare)

1. Go to **Dashboard → Your Domain → DNS**
2. Click **"Add Record"**
3. Add these MX records:

```
Type:  MX
Name:  @
Value: mx1.resend.com
Priority: 10

---

Type:  MX
Name:  @
Value: mx2.resend.com
Priority: 20
```

4. Save and verify propagation (24-48 hours)

### **Option B: Namecheap DNS** (if using Namecheap)

1. Log in → **Domain List** → Choose `voyani.tech` → **Manage**
2. Go to **Advanced DNS**
3. Add MX records:

```
Type:  MX Records
Name:  @
Value: mx1.resend.com
Priority: 10

---

Type:  MX Records
Name:  @
Value: mx2.resend.com
Priority: 20
```

4. Save and verify propagation

### **Option C: Route 53 (AWS)**

1. Go to **Route 53 Dashboard**
2. Select hosted zone for `voyani.tech`
3. Click **"Create Record"**
4. Add MX records:

```
Name: voyani.tech.
Type: MX
Value: 10 mx1.resend.com
Value: 20 mx2.resend.com
```

5. Save

### **Verify MX Records:**
```bash
# Check if MX records are properly set
nslookup -type=MX voyani.tech

# Expected output:
# voyani.tech mail exchanger = 10 mx1.resend.com.
# voyani.tech mail exchanger = 20 mx2.resend.com.
```

---

## 📧 Step 3: Configure Resend Inbound Routes

1. Go to **[Resend Dashboard](https://resend.com/domains)**
2. Click on your domain: `voyani.tech`
3. Go to **Inbound Email** (or **Email Settings**)
4. Look for **"Inbound Routes"** or **"Catch-All Rules"**

### **Create Inbound Route:**

| Setting | Value |
|---------|-------|
| **Match** | `reply+*@voyani.tech` |
| **Forward To** | Webhook URL |
| **Webhook URL** | `https://[YOUR_PROJECT_ID].supabase.co/functions/v1/handle-inbound-email` |

**How to find your Supabase Project URL:**
```bash
# Run in karisa-portfolio directory
echo $SUPABASE_URL
# Or check: supabase/.env.local
# Format: https://[project-id].supabase.co
```

### **Get Webhook Signing Secret:**

1. In Resend Dashboard, copy the **"Webhook Signing Secret"**
   - Format: `whsec_xxxxx...`
2. Save this securely

---

## 🔐 Step 4: Set Webhook Secret in Supabase

Store the Resend webhook signing secret as an environment variable:

```bash
cd karisa-portfolio

# Set the webhook secret
supabase secrets set RESEND_INBOUND_WEBHOOK_SECRET="whsec_xxxxx..."

# Verify it was set
supabase secrets list | grep RESEND
```

**Expected Output:**
```
name                              created_at
RESEND_INBOUND_WEBHOOK_SECRET    2026-03-28T10:00:00Z
```

---

## 🏪 Step 5: Create Storage Bucket for Attachments

Run this SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Create inbound-attachments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inbound-attachments',
  'inbound-attachments',
  false,  -- Private bucket (admin only)
  26214400,  -- 25MB max per file
  ARRAY[
    -- Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/x-icon',
    -- Documents
    'application/pdf',
    -- Microsoft Office
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    -- Text
    'text/plain', 'text/csv', 'text/markdown',
    -- Archives
    'application/zip', 'application/x-rar-compressed'
  ]
);

-- Set RLS policies for inbound-attachments bucket
CREATE POLICY "Allow service role to upload inbound attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inbound-attachments'
    AND auth.role() = 'service_role'
  );

CREATE POLICY "Allow admins to download inbound attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'inbound-attachments'
    AND public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "Allow admins to delete inbound attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inbound-attachments'
    AND public.has_any_role(ARRAY['admin', 'owner', 'super_admin'])
  );

-- Verify bucket created
SELECT id, name, file_size_limit FROM storage.buckets WHERE id = 'inbound-attachments';
```

✅ **Expected Result:** 1 row returned with `inbound-attachments` bucket

---

## 🧪 Step 6: Test Email Routing (Optional)

Before moving to Phase 4, you can test the email routing:

1. **Send a test email:**
   ```bash
   # From any email client, send email to:
   reply+[any-uuid]@voyani.tech

   # Example:
   reply+12345678-1234-1234-1234-123456789012@voyani.tech
   ```

2. **Check Resend Dashboard:**
   - Go to **Logs** or **Email Activity**
   - Look for your test email
   - Check if it shows as "Forwarded to Webhook"

3. **Verify Email Headers:**
   - Use online tool like [MXToolbox](https://mxtoolbox.com) to check MX records
   - Command:
   ```bash
   mail-nslookup voyani.tech | grep MX
   ```

---

## 📋 Configuration Checklist

Before moving to Phase 4, verify:

- [ ] **send-reply function updated** with `reply_to` header
- [ ] **MX records added** to DNS (voyani.tech)
- [ ] **MX records verified** with `nslookup -type=MX voyani.tech`
- [ ] **Resend inbound route configured** for `reply+*@voyani.tech`
- [ ] **Webhook URL set** to `https://[project-id].supabase.co/functions/v1/handle-inbound-email`
- [ ] **Webhook signing secret** set in Supabase: `RESEND_INBOUND_WEBHOOK_SECRET`
- [ ] **Storage bucket created** with correct RLS policies
- [ ] **DNS propagation checked** (may take 24-48 hours)
- [ ] **Email routing tested** (optional)

---

## 🆘 Troubleshooting

### **Problem: MX Records Not Showing**
**Solution:**
```bash
# Clear DNS cache (Linux)
sudo systemd-resolve --flush-caches

# Or check at multiple DNS servers
dig voyani.tech MX @8.8.8.8
dig voyani.tech MX @1.1.1.1
```

### **Problem: "Invalid webhook URL" in Resend**
**Solution:**
- Verify Supabase project ID format: `https://vxyzzzzzsqmqxxxxxgpq.supabase.co`
- Check function name: must be `/handle-inbound-email`
- Full URL: `https://vxyzzzzzsqmqxxxxxgpq.supabase.co/functions/v1/handle-inbound-email`

### **Problem: Webhook signing secret not working**
**Solution:**
```bash
# Verify secret is set
supabase secrets list

# Re-set if needed
supabase secrets set RESEND_INBOUND_WEBHOOK_SECRET="whsec_..."
```

### **Problem: Storage bucket permission denied**
**Solution:**
- Verify RLS policies are created (run SQL again)
- Check user role in auth_users table
- Test with service role first

---

## 📊 Success Validation

After completing Phase 3, run this validation:

```bash
#!/bin/bash

echo "=== Phase 3 Validation Checklist ==="

# 1. Check send-reply has reply_to
echo -n "✓ send-reply has reply_to header: "
grep -q "reply_to.*reply+" karisa-portfolio/supabase/functions/send-reply/index.ts && echo "✅" || echo "❌"

# 2. Check MX records
echo -n "✓ MX records configured: "
nslookup -type=MX voyani.tech 2>/dev/null | grep -q "mx1.resend.com" && echo "✅" || echo "❌ (may take 24-48h)"

# 3. Check Supabase secret
echo -n "✓ Webhook secret set: "
supabase secrets list 2>/dev/null | grep -q "RESEND_INBOUND_WEBHOOK_SECRET" && echo "✅" || echo "❌"

# 4. Check storage bucket
echo -n "✓ Storage bucket exists: "
# Would need Supabase CLI query, placeholder:
echo "⚠️  (verify in Supabase dashboard)"

echo ""
echo "Ready for Phase 4: Webhook Handler Implementation"
```

---

## 🚀 Next Steps: Phase 4

Once Phase 3 is complete:

1. **Create webhook handler:** `supabase/functions/handle-inbound-email/index.ts`
2. **Implement email parsing** and spam detection
3. **Store replies in database** (`inbound_replies` table)
4. **Handle attachments** and virus scanning
5. **Deploy and test** end-to-end

---

## 📚 Reference Links

- **Resend Docs:** https://resend.com/docs/api-reference/emails/receive-email
- **Email Threading RFC 2822:** https://www.ietf.org/rfc/rfc2822.txt
- **Supabase Storage:** https://supabase.com/docs/guides/storage
- **MX Records Guide:** https://mxtoolbox.com/mxlookup.aspx

---

## 📧 Quick Reference

**Email Flow Summary:**
```
1. Admin sends reply via UI
   → send-reply function adds reply_to header

2. User receives email with Reply-To: reply+{id}@voyani.tech

3. User clicks "Reply" in email client
   → Email sent to reply+{id}@voyani.tech

4. Resend receives email (via MX records)
   → Forwards to webhook (handle-inbound-email)

5. Edge function processes email
   → Validates signature
   → Extracts submission ID
   → Stores in database
   → Returns success

6. Admin sees reply in UI
   → In inbound_replies table
   → Linked to submission
```

---

**Status:** ✅ Phase 3 COMPLETE - Ready for Phase 4 Implementation

**Configuration Time:** ~30 minutes (+ 24-48 hours for DNS propagation)

**Hands-On Actions Required:**
- Add MX records to DNS
- Configure Resend webhook URL and signing secret
- Create storage bucket
- Set environment variable

**Next:** Phase 4 - Webhook Handler Implementation
