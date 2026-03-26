# Email System - Quick Reference

## 🚀 Quick Start (5 steps)

### 1. Environment Setup
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_key
```

### 2. Database
```bash
# Run SQL from supabase/schema.sql in Supabase dashboard
```

### 3. Deploy Functions
```bash
supabase functions deploy send-notification
supabase functions deploy send-reply
```

### 4. Use Contact Form
```jsx
import ContactForm from '@/components/ContactForm';

<ContactForm />
```

### 5. Admin Dashboard
```jsx
import SubmissionsPage from '@/admin/pages/SubmissionsPage';
import { supabase } from '@/lib/supabase';

<SubmissionsPage client={supabase} />
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/components/ContactForm.jsx` | Public contact form |
| `src/admin/pages/SubmissionsPage.jsx` | Admin dashboard |
| `src/admin/components/ReplyModal.jsx` | Reply composer |
| `supabase/schema.sql` | Database setup |
| `supabase/functions/send-notification/` | Form handler |
| `supabase/functions/send-reply/` | Reply handler |

---

## 🔧 Configuration

### Contact Form Props
```jsx
<ContactForm
  onSuccess={() => console.log('Sent!')}
  apiEndpoint="custom_endpoint"
/>
```

### Admin Dashboard Props
```jsx
<SubmissionsPage
  client={supabaseClient}
/>
```

### Environment Variables
```
VITE_SUPABASE_URL          # Supabase project URL
VITE_SUPABASE_ANON_KEY     # Supabase public key
RESEND_API_KEY             # Resend API key
ADMIN_EMAIL                # Your email address
PORTFOLIO_URL              # Portfolio domain
DASHBOARD_URL              # Admin dashboard URL
```

---

## 📧 Email Templates

Customize by editing `src/utils/emailTemplates.ts`:

- `submissionEmailTemplate()` - Admin notification
- `confirmationEmailTemplate()` - Visitor confirmation
- `replyEmailTemplate()` - Admin reply

---

## 🎯 Quick Reply Templates

Edit `src/utils/replyTemplates.ts`:

```typescript
export const QUICK_REPLY_TEMPLATES = {
  acknowledgement: [
    { id: 'thank_you', title: 'Thank you', content: '...' }
  ],
  collaboration: [...],
  // etc
}
```

Variables available:
- `{name}` - Visitor name
- `{subject}` - Submission subject
- `{email}` - Visitor email

---

## ✅ Validation Rules

### Contact Form
- Name: 2-100 chars
- Email: valid format
- Phone: optional, valid format
- Subject: 5-200 chars
- Message: 20-5000 chars

### Reply
- Message: 10-5000 chars
- Submission ID: must exist

Customize in `src/utils/validationSchemas.ts`

---

## 🔐 Security Features

- JWT authentication
- Role-based access (admin only)
- Rate limiting (20 replies/hour)
- Input validation (Zod)
- XSS prevention (HTML escaping)
- Honeypot spam protection
- Database RLS policies

---

## 🐛 Debugging

### Form not submitting?
- Check VITE_SUPABASE_URL in console
- Verify edge function is deployed
- Check browser network tab

### Emails not sending?
- Verify RESEND_API_KEY
- Check sender domain in Resend
- Verify ADMIN_EMAIL is correct

### Admin can't reply?
- Check JWT token is valid
- Verify user role is 'admin'
- Check rate limit (20/hour)

---

## 📊 Database Queries

### Get all submissions
```typescript
const { data } = await supabase
  .from('submissions')
  .select('*')
  .order('created_at', { ascending: false });
```

### Get submission with replies
```typescript
const { data } = await supabase
  .from('submissions')
  .select(`
    *,
    submission_replies(*)
  `)
  .eq('id', submissionId);
```

### Update submission status
```typescript
await supabase
  .from('submissions')
  .update({ status: 'responded' })
  .eq('id', submissionId);
```

---

## 🎨 Styling Customization

All components use Tailwind CSS. Key colors:
- Primary: `indigo-600`
- Success: `green-600`
- Error: `red-600`
- Neutral: `gray-*`

Edit component className attributes to customize.

---

## ⚡ Performance Tips

1. **Implement React.memo** on admin components for large lists
2. **Debounce search** input with 300ms delay
3. **Lazy load** hidden sections with Suspense
4. **Cache submissions** locally with React Query
5. **Use pagination** if > 1000 submissions

---

## 🚀 Production Checklist

- [ ] Environment variables set in production
- [ ] Edge functions deployed
- [ ] Database backups configured
- [ ] Error monitoring (Sentry) set up
- [ ] Email domain verified in Resend
- [ ] Admin auth configured
- [ ] Rate limits tested
- [ ] Performance tested under load
- [ ] Mobile responsiveness verified
- [ ] Security audit completed

---

## 📞 Support

- Supabase: https://supabase.com/docs
- Resend: https://resend.com/docs
- React Hook Form: https://react-hook-form.com
- Zod: https://zod.dev

---

## 🎓 Architecture Diagram

```
Visitor
  ↓
ContactForm (validation + rate limit)
  ↓
send-notification edge function
  ↓
submissions table INSERT + emails sent
  ↓
Admin Dashboard (real-time update)
  ↓
ReplyModal (template selection)
  ↓
send-reply edge function (JWT auth + rate limit)
  ↓
submission_replies table INSERT + email sent
  ↓
Visitor receives reply email
```

---

Generated: 2024
Last Updated: Today
Status: ✅ Production Ready
