# Email & Reply System - Implementation Guide

## Overview

This is a world-class email and reply management system for your portfolio website built on Supabase and Resend.

## Quick Setup

### 1. Environment Variables

Add these to your `.env.local`:

```
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend
RESEND_API_KEY=re_your_api_key

# Email Configuration
ADMIN_EMAIL=your-karisa@voyanitech
EMAIL_FROM="Your Name <karisa@voyani.tech>"

# URLs
PORTFOLIO_URL=https://voyanitech
DASHBOARD_URL=https://voyanitech/admin/submissions
```

### 2. Database Setup

Run the SQL schema:

```bash
# Via Supabase dashboard:
# 1. Go to SQL Editor
# 2. Create new query
# 3. Copy and paste content from supabase/schema.sql
# 4. Run
```

Or via CLI:

```bash
supabase db push
```

### 3. Deploy Edge Functions

```bash
supabase functions deploy send-notification
supabase functions deploy send-reply
```

### 4. Configure Resend

1. Create account at https://resend.com
2. Add and verify sender domain
3. Get API key from dashboard
4. Add to Supabase secrets via dashboard or CLI:

```bash
supabase secrets set RESEND_API_KEY=your_key
```

### 5. Add to Your App

#### Contact Form Usage

```jsx
import ContactForm from './components/ContactForm';

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12">
      <h1>Get in Touch</h1>
      <ContactForm />
    </div>
  );
}
```

#### Admin Dashboard

```jsx
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import SubmissionsPage from './admin/pages/SubmissionsPage';

export default function AdminDashboard() {
  const supabase = useSupabaseClient();

  return <SubmissionsPage client={supabase} />;
}
```

## Features

### Contact Form
- ✅ Real-time validation with Zod
- ✅ Rate limiting (30 seconds between submissions)
- ✅ Honeypot spam protection
- ✅ Character count tracking
- ✅ Toast notifications
- ✅ Auto-save state

### Admin Dashboard
- ✅ Real-time submission list
- ✅ Search and filter by status/name/email/subject
- ✅ Status management (New → In Progress → Responded → Closed)
- ✅ Internal notes
- ✅ Reply count badges
- ✅ Sort options (Newest, Oldest, Unanswered)

### Admin Submission Detail
- ✅ Full conversation timeline
- ✅ Original message reference
- ✅ Inline reply composer
- ✅ Quick reply templates with auto-interpolation
- ✅ Status tracking
- ✅ Internal notes
- ✅ Sent email IDs for tracking

### Email Templates
- ✅ Branded HTML emails
- ✅ Responsive design
- ✅ Beautiful typography
- ✅ Professional formatting
- ✅ Confirmation emails to visitors
- ✅ Reply emails with quoted messages

### Quick Reply Templates

Pre-configured categories:
- **Acknowledgement**: Thank you messages, received confirmations
- **Information**: Requests for more details
- **Collaboration**: Interest responses, collaboration proposals
- **Scheduling**: Call scheduling requests
- **Follow-ups**: Follow-up messages

Templates support variable interpolation:
- `{name}` - Contact name
- `{subject}` - Inquiry subject
- `{email}` - Contact email

## File Structure

```
src/
├── components/
│   └── ContactForm.jsx          # Public contact form
├── admin/
│   ├── pages/
│   │   └── SubmissionsPage.jsx   # Submissions dashboard
│   └── components/
│       ├── SubmissionDetailPanel.jsx  # Submission view & edit
│       ├── ReplyModal.jsx             # Reply composer
│       └── ConversationTimeline.jsx   # Message thread view
├── types/
│   └── email.ts                  # TypeScript types
└── utils/
    ├── validationSchemas.ts      # Zod schemas
    ├── replyTemplates.ts         # Quick reply templates
    └── emailTemplates.ts         # Email HTML templates

supabase/
├── schema.sql                    # Database schema
└── functions/
    ├── send-notification/        # New submission handler
    └── send-reply/              # Reply handler
```

## API Endpoints

### POST `/functions/v1/send-notification`

Submit a new contact form.

**Request:**
```json
{
  "type": "contact",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "subject": "Project Inquiry",
  "message": "I'm interested in collaborating..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission received and emails sent",
  "submission_id": "uuid"
}
```

### POST `/functions/v1/send-reply`

Send a reply to a submission (admin only).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request:**
```json
{
  "submission_id": "uuid",
  "reply_message": "Thank you for reaching out...",
  "reply_type": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "reply_id": "uuid",
  "email_id": "resend_email_id"
}
```

## Security

✅ **Row Level Security (RLS)**: Database protected with RLS policies
✅ **JWT Authentication**: Admin endpoints require valid JWT tokens
✅ **Role-Based Access Control**: Only admins can send replies
✅ **Rate Limiting**: 20 replies per hour per user
✅ **XSS Prevention**: All user input HTML-escaped
✅ **Input Validation**: Server-side Zod validation
✅ **CSRF Protection**: Handled by Supabase
✅ **Email Verification**: Only verified Resend domains send emails

## Customization

### Change Email Template Design

Edit `src/utils/emailTemplates.ts` - all templates are plain functions returning HTML.

### Add More Templates

1. Add template to `QUICK_REPLY_TEMPLATES` in `src/utils/replyTemplates.ts`
2. Use interpolation variables: `{name}`, `{subject}`, etc.
3. Templates automatically appear in admin reply composer

### Modify Validation Rules

Update schemas in `src/utils/validationSchemas.ts`:

```typescript
export const contactFormSchema = z.object({
  message: z.string()
    .min(20)  // Change minimum message length
    .max(5000) // Change maximum length
});
```

### Adjust Rate Limits

In `supabase/functions/send-reply/index.ts`:

```typescript
if (recentRequests.length >= 20) {  // Change from 20 to desired limit
  return false;
}
```

## Monitoring

### View Submissions

- Supabase Dashboard → submissions table
- Real-time updates every 10 seconds

### Track Email Delivery

- Resend Dashboard shows delivery status
- Email IDs stored in `submission_replies.resend_email_id`

### Error Logs

- Check browser console for client errors
- Supabase Edge Function logs for server errors
- Sentry integration if configured

## Troubleshooting

### Emails not sending

1. Check Resend API key is valid
2. Verify sender domain is added to Resend
3. Check ADMIN_EMAIL is correct
4. Look at edge function logs in Supabase dashboard

### Forms submitting but not saving

1. Check database connection
2. Verify RLS policies are correct
3. Ensure service role key is set

### Admin can't send replies

1. Check JWT token is valid
2. Verify user role includes 'admin'
3. Check rate limit hasn't been exceeded

## Next Steps

1. ✅ Test contact form with dummy submission
2. ✅ Verify emails arrive in admin inbox
3. ✅ Test admin dashboard access
4. ✅ Send test reply email
5. ✅ Verify visitor gets confirmation + reply emails
6. ✅ Set up monitoring/alerts

## Support

For issues, check:
- Supabase docs: https://supabase.com/docs
- Resend docs: https://resend.com/docs
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev
