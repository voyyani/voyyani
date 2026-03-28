# Component Architecture & Data Flow

## Visual Component Tree

```
SubmissionsPage
  └── SubmissionDetailPanel (when submission selected)
       ├── Header (Submission title, close button)
       ├── Original Message Section
       ├── Outbound Messages Section
       │   └── ConversationTimeline
       │       └── Timeline of admin replies
       │
       ├── ✨ INBOUND EMAILS SECTION ✨  ← NEW!
       │   └── useInboundEmails(submissionId, client)
       │       ├── Real-time subscription active
       │       └── Shows:
       │           ├── Loading state
       │           ├── Error state
       │           ├── Empty state
       │           └── Email list
       │               └── InboundEmailCard[] (for each email)
       │                   ├── Email Header
       │                   │   ├── Sender Avatar
       │                   │   ├── Name & Email
       │                   │   ├── Subject
       │                   │   └── Metadata (timestamp, badges)
       │                   ├── Security Indicators
       │                   │   ├── Verification status
       │                   │   ├── Spam score
       │                   │   └── Risk warnings
       │                   ├── Email Body (sanitized HTML)
       │                   ├── AttachmentPreview
       │                   │   └── File list with download tracking
       │                   └── Admin Notes Editor
       │
       ├── Reply Button
       │   └── Opens ReplyModal
       │
       └── Sidebar
           ├── Status selector
           ├── Notes editor
           └── Submission info

API/Database Layer
       ↑
Supabase Realtime
       ↑
Tables:
  - submissions
  - submission_replies
  - inbound_replies (NEW!)
  - inbound_attachments (NEW!)
  - analytics_events (tracks interactions)
```

---

## Data Flow Diagram

### 1️⃣ Initial Load
```
User clicks submission
        ↓
SubmissionDetailPanel mounts
        ↓
useInboundEmails() hook runs
        ↓
SELECT * FROM inbound_replies
WHERE submission_id = $1
ORDER BY received_at ASC
        ↓
Data returned + subscription started
        ↓
Component renders with emails
```

### 2️⃣ Real-time Update
```
Email arrives at Resend
        ↓
Webhook → Edge Function
        ↓
INSERT INTO inbound_replies
        ↓
Database triggers:
  - Update submission status
  - Calculate spam score
  - Run security checks
  - Log analytics event
        ↓
PostgreSQL NOTIFY sent
        ↓
Supabase Realtime receives it
        ↓
useInboundEmails subscription fires
        ↓
Component re-renders with new email
```

### 3️⃣ User Interaction
```
User clicks "Mark as Read"
        ↓
markEmailAsRead() called
        ↓
RPC: mark_inbound_reply_read(emailId, userId)
        ↓
UPDATE inbound_replies
SET is_read = true, read_at = now()
        ↓
Subscription update fires
        ↓
UI updates instantly
```

---

## Hook: useInboundEmails

### Function Signature
```typescript
function useInboundEmails(
  submissionId: string | undefined,
  client: SupabaseClient
): {
  emails: InboundReply[],
  loading: boolean,
  error: string | null
}
```

### Implementation Details
```typescript
// 1. Guard against missing dependencies
if (!submissionId || !client) return { emails: [], loading: false, error: null }

// 2. Initial fetch with attachments
const { data, error } = await client
  .from('inbound_replies')
  .select('*, inbound_attachments(*)')  // JOIN with attachments
  .eq('submission_id', submissionId)
  .order('received_at', { ascending: true })

// 3. Subscribe to new INSERTs
subscription.on('postgres_changes', {
  event: 'INSERT',
  filter: `submission_id=eq.${submissionId}`,
}, (payload) => {
  setEmails(prev => [...prev, payload.new])
})

// 4. Subscribe to UPDATEs
subscription.on('postgres_changes', {
  event: 'UPDATE',
  filter: `submission_id=eq.${submissionId}`,
}, (payload) => {
  setEmails(prev =>
    prev.map(e => e.id === payload.new.id ? payload.new : e)
  )
})

// 5. Cleanup on unmount
return () => {
  isMounted = false
  subscription.unsubscribe()
}
```

---

## Component: InboundEmailCard

### Props
```typescript
interface InboundEmailCardProps {
  email: InboundReply                    // The email data
  attachments?: InboundAttachment[]      // Files (from relation query)
  onMarkAsRead?: (id: string) => void    // Callback when marked read
  onToggleStar?: (id: string, important: boolean) => void
  onAddNote?: (id: string, note: string) => void
  isSelected?: boolean                   // Highlight selected email
  onSelect?: () => void                  // Called when user clicks card
  client: SupabaseClient                 // For API calls
  userId?: string                        // Current user ID
}
```

### Features
```
✅ Security Risk Indicators
   - Sender verification badge (✓/⚠️)
   - Spam score with color coding (0-10)
   - Risk level warnings (safe/warning/critical)

✅ Email Content Display
   - Safe HTML rendering (XSS-proofed)
   - Text preview (200 chars)
   - Full content viewable

✅ Attachment Management
   - File list with icons
   - Virus scan status
   - Download tracking
   - Download count

✅ Admin Actions
   - Mark as read/unread
   - Star for importance
   - Add/edit internal notes
   - Delete (future)

✅ Responsive Design
   - Mobile-optimized
   - Touch-friendly buttons
   - Collapsible sections
   - Dark mode support
```

### State Management
```typescript
const [showNotes, setShowNotes] = useState(false)
const [notes, setNotes] = useState(email.admin_notes || '')
const [savingNotes, setSavingNotes] = useState(false)
const [notesError, setNotesError] = useState<string | null>(null)
```

### Event Handlers
```typescript
handleMarkAsRead()      // RPC call + callback
handleSaveNotes()       // Update database + close editor
(click on star)         // toggleEmailImportant()
(click on attachment)   // Download notification
```

---

## Validation: validateInboundEmail()

### Security Checks
```typescript
function validateInboundEmail(email: InboundReply): ValidationResult {
  return {
    riskLevel: 'safe' | 'warning' | 'critical',
    warnings: [],  // Non-blocking issues
    errors: []     // Critical issues
  }
}

Checks performed:
  1. Sender verification matches submission.email
  2. Spam score evaluation (0-10)
  3. SPF/DKIM/DMARC validation
  4. Attachment safety
  5. Known spam patterns
  6. Executable file detection
  7. URL validation
```

### Risk Levels
- **SAFE** (green): All checks passed, sender verified
- **WARNING** (yellow): Some issues but content safe, show warnings
- **CRITICAL** (red): Major security concern, high spam score, unverified sender

---

## Sanitization: sanitizeEmailHTML()

### Security Features
```typescript
function sanitizeEmailHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'blockquote', 'code', 'del', 'em', 'h1', 'h2',
      'h3', 'hr', 'i', 'li', 'ol', 'p', 'pre', 'strong', 'ul', 'img'
    ],
    ALLOWED_ATTR: {
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'title']
    }
  })
}

Protections:
  ✅ XSS attack prevention
  ✅ Script injection blocking
  ✅ Malicious iframe removal
  ✅ Safe image rendering
  ✅ URL validation (http/https only)
  ✅ noopener/noreferrer on links
```

---

## Database Relationships

### Submission ←→ Inbound Replies (1:Many)
```sql
submissions(id) ←-- inbound_replies(submission_id)

Example query to get all emails for a submission:
SELECT ir.*, ia.*
FROM inbound_replies ir
LEFT JOIN inbound_attachments ia ON ir.id = ia.inbound_reply_id
WHERE ir.submission_id = $1
ORDER BY ir.received_at DESC
```

### Triggers & Functions
```sql
✅ set_thread_id_trigger
   - Auto-generates thread_id from message headers

✅ handle_inbound_reply_trigger
   - Updates submission status to 'in_progress'
   - Logs analytics event

✅ update_attachment_metadata_trigger
   - Updates attachment_count & total_attachment_size
   - Sets has_attachments flag

✅ update_updated_at_column
   - Auto-updates timestamp columns
```

---

## Performance Optimizations

### Indexes
```sql
✅ idx_inbound_replies_submission (submission_id, received_at)
  - Fast lookup by submission
  - Ordered chronologically

✅ idx_inbound_replies_status (status, received_at)
  - Filter by processing status

✅ idx_inbound_replies_spam (is_spam, spam_score)
  - Find quarantined emails

✅ idx_inbound_replies_unread (is_read, received_at)
  - Show notification count

✅ idx_inbound_replies_body_search (tsvector GIN)
  - Full-text search on email content
```

### Component Optimization
```typescript
✅ Memoization on InboundEmailCard
✅ useCallback for event handlers
✅ useEffect cleanup on unmount (subscription)
✅ Lazy loading for attachments
✅ Motion animations disabled for reduced-motion
```

---

## Error Handling Chain

```
User Action (mark as read)
        ↓
Try/Catch wrapper
        ↓
RPC call to Supabase
        ↓
Error?
  ├─ YES → Toast notification (red)
  │         Revert UI state
  │         Log error to console
  │
  └─ NO → Success notification (green)
          Update local state
          Subscribe updates UI
```

---

## Testing Scenarios

### ✅ Happy Path
- User opens submission with emails
- Emails load and display
- New email arrives → UI updates instantly
- User marks as read → Database updates
- User stars email → Persisted

### ✅ Error Scenarios
- No internet → Error message shown
- User not authenticated → Falls back to service role
- Invalid submission ID → Empty state
- Database down → Error boundary catches

### ✅ Edge Cases
- Very long email body → Truncated with "..."
- Many attachments → Scrollable list
- Large file (>25MB) → Rejected before upload
- Malicious HTML → Sanitized and safe
- Spam email → Flagged with warnings

---

**Last Updated**: March 28, 2026
**Component Stack**: React + Supabase + Tailwind
**Status**: Production Ready ✅
