# 🚀 Inbound Email System - Quick Reference

## 📧 Email Format
```
reply+{submission_id}@voyani.tech
```
**Example:** `reply+550e8400-e29b-41d4-a716-446655440000@voyani.tech`

---

## 📊 Database Tables

### `inbound_replies` (Main Table)
| Key Columns | Description |
|-------------|-------------|
| `id` | UUID primary key |
| `submission_id` | Links to submissions table |
| `from_email` / `from_name` | Sender info |
| `to_email` | The reply+{id}@ address |
| `subject` | Email subject |
| `body_html` / `body_text` | Email content (both formats) |
| `body_preview` | Auto-generated 200-char preview |
| `message_id` | RFC 2822 Message-ID (for threading) |
| `spam_score` | 0-10 spam probability |
| `is_spam` | Boolean spam flag |
| `status` | received/processing/processed/failed/spam |
| `is_read` | Has admin read this? |
| `has_attachments` | Boolean flag |
| `received_at` | When email arrived |

### `inbound_attachments`
| Key Columns | Description |
|-------------|-------------|
| `id` | UUID primary key |
| `inbound_reply_id` | Links to inbound_replies |
| `file_name` | Original filename |
| `file_size` | Size in bytes (max 25MB) |
| `storage_path` | Supabase Storage path |
| `is_executable` | Security flag for .exe, .sh, etc |
| `virus_scan_status` | pending/clean/infected |

### `spam_patterns` (Admin Configurable)
| Key Columns | Description |
|-------------|-------------|
| `pattern` | Regex or keyword pattern |
| `pattern_type` | keyword/regex/domain |
| `severity` | low/medium/high |
| `score_weight` | How much this adds to spam score |

---

## 🔧 Key Functions

### Email Processing
```sql
-- Extract submission ID from email
SELECT extract_submission_id_from_email('reply+abc123@voyani.tech');
-- Returns: uuid 'abc123...'

-- Calculate spam score
SELECT calculate_spam_score(
  '{"spf": "fail", "dkim": "pass"}'::jsonb,
  'URGENT: You Won the Lottery!!!',
  'Click here now to claim your prize...',
  'scammer@example.com',
  false
);
-- Returns: decimal (e.g., 8.5)

-- Verify sender email
SELECT verify_sender_email(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'user@example.com'
);
-- Returns: boolean
```

### Admin Actions
```sql
-- Mark reply as read
SELECT mark_inbound_reply_read(
  'reply-uuid-here'::uuid,
  'admin-user-uuid'::uuid
);

-- Get conversation stats
SELECT * FROM get_submission_conversation_stats(
  'submission-uuid-here'::uuid
);
```

---

## 👀 Useful Views

### Conversation Timeline
```sql
-- Get full conversation for a submission
SELECT * FROM submission_conversation_timeline
WHERE submission_id = 'your-uuid-here';

-- Fields:
--   - outbound_count: # of sent emails
--   - inbound_count: # of received replies
--   - unread_inbound_count: # of unread
--   - last_activity_at: Latest message time
--   - outbound_messages: JSON array
--   - inbound_messages: JSON array
```

### Spam Quarantine
```sql
-- Review spam emails
SELECT * FROM inbound_spam_quarantine
ORDER BY spam_score DESC
LIMIT 20;
```

---

## 📈 Common Queries

### Get unread inbound replies
```sql
SELECT
  ir.id,
  s.name as submitter_name,
  ir.from_email,
  ir.subject,
  ir.body_preview,
  ir.received_at
FROM inbound_replies ir
JOIN submissions s ON s.id = ir.submission_id
WHERE ir.is_read = false
  AND ir.is_spam = false
ORDER BY ir.received_at DESC;
```

### Get submissions with recent replies
```sql
SELECT DISTINCT
  s.id,
  s.name,
  s.email,
  s.subject,
  COUNT(ir.id) as reply_count,
  MAX(ir.received_at) as last_reply_at
FROM submissions s
JOIN inbound_replies ir ON ir.submission_id = s.id
WHERE ir.received_at > now() - interval '7 days'
  AND ir.is_spam = false
GROUP BY s.id
ORDER BY last_reply_at DESC;
```

### Get attachments for a reply
```sql
SELECT
  file_name,
  file_size / 1024.0 / 1024.0 as size_mb,
  mime_type,
  storage_path,
  virus_scan_status
FROM inbound_attachments
WHERE inbound_reply_id = 'reply-uuid-here'
ORDER BY created_at;
```

### Spam statistics
```sql
SELECT
  DATE(received_at) as date,
  COUNT(*) as total_emails,
  COUNT(*) FILTER (WHERE is_spam) as spam_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_spam) / COUNT(*), 2) as spam_percentage,
  AVG(spam_score) as avg_spam_score
FROM inbound_replies
WHERE received_at > now() - interval '30 days'
GROUP BY DATE(received_at)
ORDER BY date DESC;
```

---

## 🔐 Security Checks

### Spam Score Calculation
| Factor | Score Added | Condition |
|--------|-------------|-----------|
| SPF Failure | +2.0 | security_checks->>'spf' = 'fail' |
| DKIM Failure | +2.0 | security_checks->>'dkim' = 'fail' |
| DMARC Failure | +1.5 | security_checks->>'dmarc' = 'fail' |
| Unverified Sender | +1.0 | Email doesn't match submission |
| Suspicious Keywords | +0.5 each | viagra, lottery, etc. (max +3.0) |
| ALL CAPS Subject | +1.0 | Subject is all uppercase |
| Excessive ! | +0.5 | More than 2 exclamation marks |

**Spam Threshold:** Score ≥ 5.0 = Marked as spam

---

## ⚡ Performance Tips

### Indexes (Already Created)
- ✅ `idx_inbound_replies_submission` - Fast lookup by submission
- ✅ `idx_inbound_replies_from_email` - Track sender history
- ✅ `idx_inbound_replies_unread` - Quick unread count
- ✅ `idx_inbound_replies_body_search` - Full-text search (GIN)
- ✅ `idx_inbound_attachments_reply` - Fast attachment lookup

### Query Optimization
```sql
-- ✅ GOOD: Use indexed columns
SELECT * FROM inbound_replies
WHERE submission_id = $1 AND is_read = false;

-- ❌ BAD: Avoid full table scans
SELECT * FROM inbound_replies
WHERE body_text LIKE '%keyword%';  -- Use full-text search instead:

-- ✅ BETTER: Use full-text search
SELECT * FROM inbound_replies
WHERE to_tsvector('english', body_text) @@ to_tsquery('keyword');
```

---

## 🎯 Status Flow

```
Email Received → Webhook Triggered → Status: 'received'
                                     ↓
                              Validation & Processing
                                     ↓
                    ┌────────────────┴────────────────┐
                    ↓                                 ↓
            Status: 'processed'              Status: 'spam'/'failed'
                    ↓
            Submission status → 'in_progress'
                    ↓
            Analytics logged
                    ↓
            Admin notified
```

---

## 🔗 API Integration

### Webhook Payload (from Resend)
```typescript
{
  type: "email.received",
  data: {
    email_id: "re_abc123",
    from: { email: "user@example.com", name: "John Doe" },
    to: ["reply+uuid@voyani.tech"],
    subject: "Re: Your inquiry",
    html: "<p>Email body HTML</p>",
    text: "Email body plain text",
    headers: {
      "message-id": "<unique-id@example.com>",
      "in-reply-to": "<previous-id@voyani.tech>",
      "references": "<thread-id-1> <thread-id-2>"
    },
    attachments: [
      {
        filename: "document.pdf",
        content_type: "application/pdf",
        size: 1048576,
        content: "base64-encoded-content..."
      }
    ],
    spam_score: 0.2,
    security: {
      spf: "pass",
      dkim: "pass",
      dmarc: "pass"
    }
  }
}
```

---

## 📞 Quick Commands

```bash
# Validate migration
./scripts/validate-inbound-email-migration.sh

# Deploy migration
cd karisa-portfolio
supabase db push

# Check migration status
supabase db remote --status

# Rollback (if needed)
supabase db reset

# View logs
supabase functions logs handle-inbound-email

# Test webhook locally
supabase functions serve handle-inbound-email
```

---

## 🐛 Debugging

### Check if email was received
```sql
SELECT * FROM inbound_replies
WHERE to_email LIKE '%submission-id%'
ORDER BY received_at DESC
LIMIT 5;
```

### Check processing errors
```sql
SELECT
  id,
  from_email,
  subject,
  status,
  processing_error,
  processing_attempts,
  received_at
FROM inbound_replies
WHERE status = 'failed'
ORDER BY received_at DESC;
```

### Verify webhook signature (in logs)
```typescript
// Look for these log messages:
"[Webhook] Invalid signature format"
"[Webhook] Signature mismatch"
"[Inbound] Received email from..."
"[Inbound] Created inbound_reply: uuid"
```

---

## 📚 References

- **Migration File:** `supabase/migrations/20260328000000_inbound_email_system.sql`
- **Implementation Guide:** `docs/INBOUND_EMAIL_IMPLEMENTATION.md`
- **Validation Script:** `scripts/validate-inbound-email-migration.sh`
- **Resend Docs:** https://resend.com/docs/api-reference/emails/receive-email

---

**Last Updated:** March 28, 2026
**Version:** 1.0.0
**Status:** ✅ Ready for Deployment
