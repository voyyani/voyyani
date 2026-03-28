# 🌟 World-Class Inbound Email System - Implementation Guide

## 📋 Phase 2 Complete: Database Schema ✅

**Migration File:** `supabase/migrations/20260328000000_inbound_email_system.sql`

---

## 🎯 What Was Created

### **1. Core Tables**

#### **`inbound_replies`** - Main email storage
- ✅ Full email metadata (from, to, subject, body HTML/text)
- ✅ Auto-generated 200-char preview (computed column)
- ✅ Email threading headers (Message-ID, In-Reply-To, References)
- ✅ Spam detection (score, reasons, security checks)
- ✅ Processing workflow (received → processing → processed/failed/spam)
- ✅ Sender verification (matches original submission email?)
- ✅ Content analysis (attachment count, link detection)
- ✅ Admin actions (read status, notes, importance flag)
- ✅ **20+ columns** covering every use case

#### **`inbound_attachments`** - File attachments
- ✅ File metadata (name, size, mime type, extension)
- ✅ Storage integration (Supabase Storage paths)
- ✅ Security scanning (virus scan status, executable detection)
- ✅ Inline images support (Content-ID for HTML emails)
- ✅ Download tracking (count, last downloaded by/at)
- ✅ 25MB per file size limit

#### **`spam_patterns`** - Configurable spam rules
- ✅ Admin-managed spam detection patterns
- ✅ Supports keywords, regex, and domain blocking
- ✅ Severity levels (low/medium/high)
- ✅ Score weights for fine-tuning

---

### **2. Intelligent Functions**

#### **Email Processing**
- `extract_submission_id_from_email()` - Parse `reply+{uuid}@voyani.tech`
- `generate_thread_id()` - RFC 2822 email threading
- `calculate_spam_score()` - Multi-factor spam detection (0-10 score)
- `verify_sender_email()` - Validate sender matches submission

#### **Admin Utilities**
- `mark_inbound_reply_read()` - Track read status
- `get_submission_conversation_stats()` - Conversation analytics

---

### **3. Automated Triggers**

1. **`trigger_inbound_reply_update_submission`**
   - Auto-updates submission status to `in_progress` when user replies
   - Only triggers for non-spam, processed emails

2. **`trigger_set_thread_id`**
   - Auto-calculates thread_id from Message-ID headers
   - Ensures proper email threading

3. **`trigger_update_attachment_metadata`**
   - Auto-updates attachment counts and total size in parent reply
   - Keeps `has_attachments` flag in sync

4. **`trigger_log_inbound_reply_analytics`**
   - Logs all inbound emails to `analytics_events` table
   - Tracks spam, failures, and successful replies

5. **`trigger_*_updated_at`**
   - Auto-updates `updated_at` timestamps

---

### **4. Performance Optimizations**

#### **15+ Strategic Indexes:**
- Submission lookups (by submission_id, received_at)
- Sender tracking (by from_email)
- Status filtering (spam, unread, processed)
- Full-text search on email body (GIN index)
- Thread tracking (by thread_id)
- Resend ID lookups (webhook processing)

#### **Computed Columns:**
- `body_preview` - Auto-generated 200-char preview (STORED)
- `file_extension` - Extracted from filename (STORED)
- `is_executable` - Security check for dangerous files (STORED)

---

### **5. Security Features**

#### **Row Level Security (RLS)**
- ✅ Admin-only access to inbound replies
- ✅ Service role access for webhook processing
- ✅ Reuses existing `has_any_role()` function

#### **Data Validation**
- ✅ Email format validation (regex)
- ✅ Spam score range (0-10)
- ✅ File size limits (25MB max)
- ✅ MIME type validation
- ✅ Status enum constraints

#### **Spam Detection (Multi-Layer)**
1. **SPF/DKIM/DMARC checks** (+2.0-2.5 points each)
2. **Sender verification** (+1.0 if fails)
3. **Keyword matching** (+0.5 per suspicious word)
4. **ALL CAPS detection** (+1.0)
5. **Excessive punctuation** (+0.5)
6. **Threshold:** 5.0+ = spam 🚫

---

### **6. Powerful Views**

#### **`submission_conversation_timeline`**
- Unified view of outbound + inbound messages
- Message counts, unread counts
- Latest activity timestamp
- Latest message preview
- Full message aggregation (JSON)

#### **`inbound_spam_quarantine`**
- All spam/quarantined emails for admin review
- Shows expected vs actual sender
- Displays spam score and reasons
- Sorted by severity

---

## 🚀 Next Steps (Phase 3-4)

### **Step 1: Apply Migration**
```bash
cd karisa-portfolio
supabase db push
```

### **Step 2: Create Storage Bucket**
```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inbound-attachments',
  'inbound-attachments',
  false,  -- Private (admin only)
  26214400,  -- 25MB max
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ]
);

-- Set RLS policies for storage
CREATE POLICY "Admins can upload inbound attachments"
  ON storage.objects FOR INSERT
  USING (
    bucket_id = 'inbound-attachments'
    AND auth.role() = 'service_role'
  );

CREATE POLICY "Admins can download inbound attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'inbound-attachments'
    AND public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "Admins can delete inbound attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inbound-attachments'
    AND public.has_any_role(ARRAY['admin', 'owner', 'super_admin'])
  );
```

### **Step 3: Update send-reply Function**
```typescript
// File: supabase/functions/send-reply/index.ts
// Add reply_to header to outbound emails

const submissionId = '...'; // from request

const resendResponse = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${resendApiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: "Karisa <karisa@voyani.tech>",
    reply_to: `reply+${submissionId}@voyani.tech`, // ✅ ADD THIS
    to: [recipientEmail],
    subject: emailSubject,
    html: emailHtml,
    headers: {
      "X-Submission-ID": submissionId,
      "Message-ID": `<${submissionId}.${Date.now()}@voyani.tech>`,
    },
  }),
});
```

### **Step 4: Configure Resend (Phase 3)**
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add **MX Records** to your DNS:
   ```
   Type: MX  |  Name: @  |  Value: mx1.resend.com  |  Priority: 10
   Type: MX  |  Name: @  |  Value: mx2.resend.com  |  Priority: 20
   ```
3. Add **Inbound Route**:
   - Pattern: `reply+*@voyani.tech`
   - Forward to: Webhook
   - URL: `https://[your-project].supabase.co/functions/v1/handle-inbound-email`

4. Get **Webhook Signing Secret**:
   ```bash
   # Copy from Resend dashboard, then:
   supabase secrets set RESEND_INBOUND_WEBHOOK_SECRET="whsec_xxxxx..."
   ```

### **Step 5: Create Webhook Handler (Phase 4)**
```bash
# Create the edge function (content provided in roadmap)
mkdir -p supabase/functions/handle-inbound-email
# Copy Phase 4 webhook handler code from roadmap
```

---

## 📊 Database Schema Summary

```
┌─────────────────────────┐
│   submissions           │
│   (existing)            │
└──────────┬──────────────┘
           │
           │ 1:N
           │
┌──────────▼──────────────┐        ┌──────────────────────┐
│   inbound_replies       │   1:N  │  inbound_attachments │
│   - email metadata      │◄───────┤  - files             │
│   - spam detection      │        │  - virus scanning    │
│   - threading           │        └──────────────────────┘
│   - read status         │
└─────────────────────────┘

┌─────────────────────────┐
│   spam_patterns         │
│   (configurable rules)  │
└─────────────────────────┘
```

---

## ✨ Key Features Delivered

### **Email Processing**
- ✅ Parse `reply+{submission_id}@voyani.tech` addresses
- ✅ Extract clean email body (remove quoted text)
- ✅ Support HTML and plain text formats
- ✅ Handle attachments (up to 25MB per file)
- ✅ Preserve email threading (RFC 2822)

### **Spam Protection**
- ✅ Multi-factor spam scoring (0-10 scale)
- ✅ SPF/DKIM/DMARC validation
- ✅ Sender email verification
- ✅ Keyword pattern matching
- ✅ Configurable spam rules

### **Admin Experience**
- ✅ Unified conversation timeline view
- ✅ Unread message counting
- ✅ Spam quarantine review
- ✅ Attachment download tracking
- ✅ Conversation statistics

### **Performance**
- ✅ 15+ optimized indexes
- ✅ Computed columns (no runtime overhead)
- ✅ Full-text search on email body
- ✅ Efficient JSON aggregation in views

### **Security**
- ✅ Row Level Security (RLS) on all tables
- ✅ File type validation
- ✅ Executable file detection
- ✅ Virus scan support (ready for integration)
- ✅ Email format validation

---

## 🧪 Testing Checklist

After deployment, test these scenarios:

- [ ] Send email from admin → user's email
- [ ] Reply from user's email client
- [ ] Verify reply appears in `inbound_replies` table
- [ ] Check submission status changed to `in_progress`
- [ ] Test with attachment (< 25MB)
- [ ] Test spam detection (send test with "viagra" keyword)
- [ ] Verify sender mismatch detection
- [ ] Check conversation timeline view
- [ ] Test full-text search on email body
- [ ] Verify analytics events logged

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Email Processing Time | < 2 seconds | Webhook response time |
| Spam Detection Accuracy | > 95% | False positive rate < 5% |
| Attachment Support | Up to 25MB | File upload success rate |
| Threading Accuracy | 100% | Message-ID matching |
| Uptime | 99.9% | Webhook availability |
| Query Performance | < 100ms | Timeline view load time |

---

## 🎓 Migration Features Breakdown

### **Total Lines:** 680+
### **Total Comments:** 80+
### **Tables Created:** 3
### **Functions Created:** 8
### **Triggers Created:** 6
### **Views Created:** 2
### **Indexes Created:** 15
### **RLS Policies:** 8

---

## 🔗 Related Documentation

- **Resend Inbound Email Docs:** https://resend.com/docs/api-reference/emails/receive-email
- **RFC 2822 (Email Headers):** https://www.ietf.org/rfc/rfc2822.txt
- **Supabase Storage:** https://supabase.com/docs/guides/storage
- **RLS Policies:** https://supabase.com/docs/guides/auth/row-level-security

---

## 🆘 Troubleshooting

### **Problem:** Migration fails with "function already exists"
**Solution:** Drop existing functions first or add `IF EXISTS` checks

### **Problem:** Webhook returns 401 Unauthorized
**Solution:** Verify `RESEND_INBOUND_WEBHOOK_SECRET` is set correctly

### **Problem:** Emails not appearing in database
**Solution:** Check Resend webhook logs, verify MX records, check edge function logs

### **Problem:** Attachments not uploading
**Solution:** Ensure `inbound-attachments` bucket exists with correct RLS policies

### **Problem:** Spam detection too aggressive
**Solution:** Adjust spam score thresholds in `calculate_spam_score()` function

---

**Status:** ✅ Phase 2 Complete - Ready for Phase 3 (Resend Configuration)

**Estimated Total Implementation Time:** 14-20 days (all phases)

**Current Progress:** Day 1-2 Complete 🎉
