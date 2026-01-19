# Contact Form Setup Guide

## Overview
The contact form uses EmailJS for sending emails directly from the client-side, with comprehensive validation, security features, and accessibility.

## Features Implemented ✅

### Core Functionality
- ✅ Full form validation with Zod schema
- ✅ Real-time validation feedback
- ✅ Email integration via EmailJS
- ✅ Success/error toast notifications
- ✅ Loading states with spinner
- ✅ Character counter for message field

### Security Features
- ✅ Honeypot field for bot detection
- ✅ Rate limiting (30 seconds between submissions)
- ✅ Maximum 3 submissions per session
- ✅ Client-side validation to prevent malicious input

### Accessibility Features
- ✅ ARIA labels and descriptions
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Clear error messages
- ✅ Focus management
- ✅ Semantic HTML

### User Experience
- ✅ Smooth animations with Framer Motion
- ✅ Mobile responsive design
- ✅ Clear visual feedback
- ✅ Disabled state when invalid
- ✅ Auto-complete support

## Setup Instructions

### 1. Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account (100 emails/month free tier)
3. Verify your email address

### 2. Configure EmailJS

#### Create Email Service
1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended for testing)
4. Follow the connection instructions
5. Copy your **Service ID**

#### Create Email Template
1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template structure:

```
Subject: {{subject}}

From: {{from_name}} ({{from_email}})

Message:
{{message}}

---
Sent from voyani.tech contact form
```

4. Template variables to use:
   - `{{from_name}}` - Sender's name
   - `{{from_email}}` - Sender's email
   - `{{subject}}` - Email subject
   - `{{message}}` - Message content
   - `{{to_name}}` - Your name (optional)

5. Copy your **Template ID**

#### Get Public Key
1. Go to **Account** > **General**
2. Find your **Public Key**
3. Copy it

### 3. Configure Environment Variables

1. Create a `.env` file in your project root:
```bash
cp .env.example .env
```

2. Add your EmailJS credentials:
```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

3. **Important:** Never commit `.env` to version control!

### 4. Test the Form

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the contact section
3. Fill out and submit the form
4. Check your email for the test message
5. Verify toast notifications appear

## Usage in Your App

The ContactForm is already integrated in the app. To use it elsewhere:

```jsx
import ContactForm from './components/ContactForm';

function ContactSection() {
  return (
    <section id="contact" className="py-20">
      <h2>Get In Touch</h2>
      <ContactForm />
    </section>
  );
}
```

## Customization

### Modify Validation Rules

Edit the Zod schema in `ContactForm.jsx`:

```javascript
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  // ... add your custom rules
});
```

### Change Rate Limiting

Modify the `checkRateLimit` function:

```javascript
const minTimeBetweenSubmits = 30000; // Change to desired milliseconds
const maxSubmissions = 3; // Change max submissions per session
```

### Customize Toast Notifications

Update toast options in `App.jsx`:

```javascript
<Toaster
  position="top-right" // Change position
  toastOptions={{
    duration: 5000, // Auto-dismiss duration
    // ... other options
  }}
/>
```

## Troubleshooting

### Emails Not Sending

1. **Check console for errors:**
   - Open browser DevTools > Console
   - Look for EmailJS error messages

2. **Verify credentials:**
   - Ensure `.env` file exists
   - Check Service ID, Template ID, and Public Key are correct
   - Try regenerating your EmailJS Public Key

3. **Check EmailJS dashboard:**
   - Verify service is connected
   - Check email quota (100/month on free tier)
   - Look at the logs for failed attempts

4. **Test with EmailJS directly:**
   - Use their test feature in the dashboard
   - Ensure template variables are correct

### Validation Issues

1. **Check Zod schema:**
   - Ensure field names match
   - Verify regex patterns are correct

2. **Console errors:**
   - Look for validation error messages
   - Check browser console for details

### Rate Limiting Too Strict

Adjust the timing in `ContactForm.jsx`:
```javascript
const minTimeBetweenSubmits = 10000; // 10 seconds instead of 30
```

## Alternative Email Services

If you prefer not to use EmailJS:

### Option A: Resend API (Recommended for Production)

```bash
npm install resend
```

Update the form to use server-side sending (requires backend).

### Option B: Serverless Function

Create a Vercel/Netlify serverless function:

```javascript
// api/contact.js
export default async function handler(req, res) {
  // Send email using your preferred service
  // e.g., SendGrid, Mailgun, AWS SES
}
```

### Option C: FormSubmit

Use a service like FormSubmit.co for zero-config emails (less secure).

## Security Notes

1. **Environment Variables:** Never expose your EmailJS private keys
2. **Rate Limiting:** Current implementation is client-side only
3. **For Production:** Consider adding:
   - reCAPTCHA v3
   - Server-side validation
   - IP-based rate limiting
   - CSRF protection

## Analytics Tracking

The form tracks submissions if Google Analytics is configured:

```javascript
if (window.gtag) {
  window.gtag('event', 'form_submission', {
    event_category: 'Contact',
    event_label: 'Contact Form',
  });
}
```

## Support

For issues:
1. Check the [EmailJS Documentation](https://www.emailjs.com/docs/)
2. Review browser console errors
3. Test with EmailJS dashboard
4. Check network tab for failed requests

---

**Created:** January 18, 2026  
**Last Updated:** January 18, 2026
