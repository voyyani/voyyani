# Portfolio Website - Email & Reply System Implementation Guide

## Overview
Implement a complete email and conversation management system for a portfolio website contact form. This system should allow:
- Visitors to submit contact inquiries through a form
- Admin dashboard to manage and reply to submissions
- Full conversation threading and history tracking
- Branded email responses with Resend integration

## System Architecture

### 1. Database Schema

Create the following Supabase tables:

#### `submissions` Table
Stores all contact form submissions from visitors.

```sql
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'contact',
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'responded', 'closed')),
  notes text,
  responded_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index idx_submissions_status on submissions(status);
create index idx_submissions_email on submissions(email);
create index idx_submissions_created_at on submissions(created_at desc);
```

#### `submission_replies` Table
Stores all admin replies to submissions.

```sql
create table public.submission_replies (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  reply_message text not null,
  reply_type text default 'manual'
    check (reply_type in ('manual', 'quick_reply', 'status_change')),
  sent_by uuid,
  resend_email_id text,
  created_at timestamp default now()
);

create index idx_replies_submission_id on submission_replies(submission_id);
create index idx_replies_created_at on submission_replies(created_at);
```

#### `quick_reply_templates` Table (Optional but Recommended)
Pre-written response templates for common replies.

```sql
create table public.quick_reply_templates (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  content text not null,
  applicable_to text[] default array['contact'],
  created_at timestamp default now()
);
```

### 2. Backend - Supabase Edge Functions

#### `send-notification` Function
Handles incoming contact form submissions.

**Endpoint:** `POST /functions/v1/send-notification`

**Request Body:**
```json
{
  "type": "contact",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Project Inquiry",
  "message": "I'm interested in collaborating..."
}
```

**Responsibilities:**
1. Save submission to `submissions` table
2. Send branded HTML email to admin inbox via Resend
3. Send confirmation email to visitor
4. Return success/error response

**Environment Variables Needed:**
- `RESEND_API_KEY` - From Resend dashboard
- `NOTIFICATION_TO_EMAIL` - Admin inbox (e.g., your@email.com)
- `EMAIL_FROM` - Sender address (e.g., Portfolio <noreply@resend.dev>)

**Email Template Design:**
- Use branded HTML with portfolio styling
- Submission details (name, email, phone, subject, message)
- Admin action buttons/links to reply
- Responsive design for all email clients

#### `send-reply` Function
Enables admin to reply to submissions.

**Endpoint:** `POST /functions/v1/send-reply`

**Request Body:**
```json
{
  "submission_id": "uuid",
  "reply_message": "Thank you for your inquiry...",
  "reply_type": "manual",
  "template_id": null
}
```

**Requirements:**
1. JWT authentication required (admin role check)
2. Rate limiting: 20 replies per hour per user
3. Save reply to `submission_replies` table
4. Send reply via Resend to visitor's email
5. Auto-update submission status to 'responded'
6. Include quoted original message in email
7. HTML escape all user input (XSS prevention)
8. Return delivery status and email ID

**Security:**
- Verify JWT token and user role
- Only allow content_manager, admin, owner, super_admin roles
- Check rate limits
- Validate submission_id ownership

### 3. Frontend Components

#### Contact Form Component
**File:** `src/components/ContactForm.tsx` or similar

**Features:**
- Form fields: name, email, phone, subject, message
- Form validation:
  - Name: required, min 2 chars
  - Email: required, valid format
  - Phone: optional, valid format
  - Subject: required, min 5 chars
  - Message: required, min 20 chars, max 5000 chars
- Loading state during submission
- Success notification with confirmation message
- Error handling with user-friendly messages
- Optional: reCAPTCHA integration for spam prevention

**On Submit:**
- Call `send-notification` edge function
- Show loading spinner
- Handle errors gracefully
- Display success message
- Clear form on success

#### Admin Dashboard - Submissions List Page
**File:** `src/admin/pages/SubmissionsPage.tsx`

**Features:**
- Table view of all submissions
- Columns: Name, Email, Subject, Status, Created Date, Actions
- Filter/search by:
  - Status (New, In Progress, Responded, Closed)
  - Name or email
  - Date range
- Clickable rows to open submission detail view
- Status indicators with color coding
- Reply count badge on each row
- "Last replied" timestamp
- Bulk actions: mark as read, change status, delete

#### Admin Dashboard - Submission Detail Modal/Page
**File:** `src/admin/components/SubmissionDetailPanel.tsx`

**Features:**
- Display full submission details
- Original message with formatted display
- Inline status selector
- Internal notes field
- Conversation timeline showing all replies
- "Reply" button to open reply modal
- Recipient email verification
- Timestamps for all activities

#### Reply Modal Component
**File:** `src/admin/components/ReplyModal.tsx`

**Features:**
- Modal dialog for composing replies
- Pre-filled subject with "Re:" prefix
- Pre-filled greeting with recipient's first name
- Quick reply template dropdown selector
- Character count: min 10, max 5000 for message body
- Subject max 200 characters
- "Quoted" section showing original message (collapsible)
- Keyboard shortcut: Ctrl+Enter / Cmd+Enter to send
- Send button with loading spinner
- Success/error feedback
- Double-send prevention

**On Send:**
- Call `send-reply` edge function
- Update submission status to 'responded'
- Close modal
- Refresh conversation timeline
- Show success notification

#### Conversation Timeline Component
**File:** `src/admin/components/ConversationTimeline.tsx`

**Features:**
- Vertical timeline layout
- Show original message at top
- Each reply shows:
  - Sender metadata (who replied, when)
  - Reply type icon (manual, quick_reply, status_change)
  - Reply content with proper formatting
  - Timestamp
- Visual connection line between messages
- Chronological order (oldest to newest)

### 4. Quick Reply Templates

Create a config file with pre-written templates:

**File:** `src/admin/config/replyTemplates.ts`

```typescript
export const REPLY_TEMPLATES = {
  acknowledgement: [
    {
      id: 'thank_you',
      title: 'Thank you',
      content: 'Thank you for reaching out, {name}! I appreciate your interest in {subject}. I will review your message and get back to you shortly.'
    },
    {
      id: 'received',
      title: 'Message received',
      content: 'Hi {name},\n\nI have received your message and will respond within 24-48 hours.\n\nBest regards'
    }
  ],
  information: [
    {
      id: 'need_more_info',
      title: 'Need more information',
      content: 'Thank you for your inquiry, {name}. To better assist you, could you please provide more details about {subject}?'
    }
  ],
  collaboration: [
    {
      id: 'interested',
      title: 'Very interested',
      content: 'Hi {name},\n\nThank you for reaching out about {subject}. I am very interested in exploring this opportunity further. Let\'s discuss more details.'
    }
  ]
};
```

### 5. Email Branding & Templates

**HTML Email Template Structure:**
- Header with portfolio logo/name
- Submission details section
- Message content (for incoming)
- Reply content (for outgoing)
- Footer with contact info and social links
- Responsive design using table-based layout
- Brand colors and fonts
- Clear call-to-action buttons

### 6. Environment Configuration

**Required Supabase Secrets:**
```
RESEND_API_KEY=your_resend_api_key
NOTIFICATION_TO_EMAIL=your-admin@email.com
EMAIL_FROM=Your Portfolio <noreply@resend.dev>
PORTFOLIO_URL=https://yourportfolio.com
```

### 7. Security Considerations

**Authentication & Authorization:**
- All admin endpoints require valid JWT token
- Role-based access control for admin functions
- Only authenticated users can send/view replies

**Input Validation:**
- Client-side validation for form fields
- Server-side validation on edge functions
- Email format validation
- Length/character limits enforcement

**XSS Prevention:**
- HTML escape all user-submitted content
- Sanitize reply message before sending
- Use safe rendering in React components

**CSRF Protection:**
- Ensure Supabase handles CSRF tokens
- Validate origin headers on edge functions

**Rate Limiting:**
- Limit submission rate per IP (optional)
- Limit replies per user (20/hour)
- Prevent email flooding

**Data Protection:**
- All sensitive data should use RLS policies
- Mark personal data as sensitive if needed
- Consider GDPR compliance if handling EU data

### 8. Implementation Steps

1. **Setup Database**
   - Create tables with proper indexes
   - Set up RLS policies for data access
   - Create quick reply templates

2. **Setup Resend Integration**
   - Create Resend account
   - Set up sender domain
   - Store API key in Supabase secrets
   - Create email templates

3. **Create Edge Functions**
   - `send-notification` function for form submissions
   - `send-reply` function for admin replies
   - Add proper error handling and logging

4. **Build Frontend Components**
   - Create contact form component
   - Build admin submissions dashboard
   - Create reply modal
   - Build conversation timeline
   - Create submission detail view

5. **Integrate with Admin Dashboard**
   - Add submissions management section
   - Add authentication checks
   - Add navigation to submissions

6. **Testing**
   - Test form submission end-to-end
   - Test email delivery
   - Test reply functionality
   - Test admin access control
   - Test rate limiting
   - Test XSS prevention

7. **Deployment**
   - Deploy edge functions
   - Deploy front-end changes
   - Verify email delivery in production
   - Monitor error logs

## Reference Implementation

This specification is based on the Neema Foundation Kilifi implementation:
- Database schema: `/NF/supabase-schema.sql`
- Edge functions: `/NF/supabase/functions/send-notification/` and `/send-reply/`
- Frontend components: `/NF/src/admin/components/shared/`
- Admin pages: `/NF/src/admin/pages/SubmissionsPage.tsx`
- Quick reply templates: `/NF/src/admin/config/replyTemplates.ts`

Adapt the implementation style, component structure, and Resend integration patterns from these existing files.

## Additional Features (Optional Enhancements)

- Email thread grouping by sender
- Submission export to CSV
- Email open/click tracking via Resend
- Automated responses based on keywords
- Custom email templates per submission type
- Admin notification when new submission arrives
- Two-factor authentication for admin dashboard
- Submission archival/soft delete
- Custom fields per submission type
