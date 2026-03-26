# ⚡ Email System - Quick Execution Plan

## 🎯 Where We Are Now

```
Database       Backend         Frontend        Email Templates
✅ Tables      ✅ Code         ✅ Components   ✅ HTML Ready
✅ RLS         ⏳ Deploy       ✅ Connected   ✅ Beautiful
✅ Data        ⏳ Test         ✅ Validated   ✅ Branded
```

## 🚀 Next 24 Hours - Phase 1 Execution

### Hour 1: Resend Setup
```
[ ] Go to https://resend.com/domains
[ ] Add domain: voyani.tech
[ ] Verify DNS records (follow Resend instructions)
[ ] Get API key: re_dzwByD7r_PwVVQ9YdbBQxgg2Ufrf4fD6U ✅
[ ] Test email send (send to yourself)
```

**Time: 15 minutes**

---

### Hour 2: Supabase Configuration
```
[ ] Open https://app.supabase.com/project/mrqzsfcfzvejreowkykm/settings/variables
[ ] Click "New secret"
[ ] Add these 4 secrets:
    • RESEND_API_KEY = re_dzwByD7r_PwVVQ9YdbBQxgg2Ufrf4fD6U
    • ADMIN_EMAIL = karisa@voyani.tech
    • PORTFOLIO_URL = https://voyani.tech
    • DASHBOARD_URL = https://voyani.tech/admin/submissions
[ ] Save and verify all 4 appear in list
```

**Time: 10 minutes**

---

### Hour 3: Deploy Edge Functions

#### 3A. Deploy send-notification
```
[ ] Go to https://app.supabase.com/project/mrqzsfcfzvejreowkykm/functions
[ ] Click "Create a new function"
[ ] Name: send-notification
[ ] Open file: supabase/functions/send-notification/index.ts
[ ] Copy ALL content
[ ] Paste into Supabase editor
[ ] Click "Deploy"
[ ] Wait for ✅ success
[ ] Note the function URL
```

#### 3B. Deploy send-reply
```
[ ] Click "Create a new function" again
[ ] Name: send-reply
[ ] Open file: supabase/functions/send-reply/index.ts
[ ] Copy ALL content
[ ] Paste into Supabase editor
[ ] Click "Deploy"
[ ] Wait for ✅ success
[ ] Note the function URL
```

**Time: 20 minutes**

---

### Hour 4: Test End-to-End

#### 4A. Test Form Submission
```
[ ] Open your portfolio app in browser
[ ] Go to contact form page
[ ] Fill out form with:
    Name: Test User
    Email: your-email@voyani.tech
    Subject: Test Submission
    Message: This is a test message to verify the email system is working.
[ ] Click Send
[ ] Wait for success toast notification
[ ] Check that modal/message appears
```

#### 4B. Verify Database
```
[ ] Go to Supabase SQL Editor
[ ] Run: SELECT * FROM submissions ORDER BY created_at DESC LIMIT 1;
[ ] Verify your test submission appears ✅
```

#### 4C. Check Email
```
[ ] Open your email (your-karisa@voyani.tech)
[ ] Should have 2 emails:
    1. Admin notification: "New Portfolio Inquiry: Test Submission"
    2. Confirmation: "We received your message: Test Submission"
[ ] Open both to verify formatting
[ ] Click "Reply in Dashboard" link (should work if dashboard route exists)
```

#### 4D. Test Admin Reply
```
[ ] Go to admin dashboard (if route exists yet)
[ ] Find your test submission
[ ] Click to open detail view
[ ] Click "Send Reply"
[ ] Select a quick reply template
[ ] Modify the message if desired
[ ] Click "Send Reply"
[ ] Go back to email and check for reply email ✅
```

**Time: 15 minutes**

---

## ✅ Success Checklist for Phase 1

- [ ] Resend domain verified
- [ ] All 4 secrets added to Supabase
- [ ] send-notification function deployed ✅
- [ ] send-reply function deployed ✅
- [ ] Test form submits without errors
- [ ] Test submission appears in database
- [ ] Admin notification email received
- [ ] Visitor confirmation email received
- [ ] No console errors in browser
- [ ] Email HTML renders beautifully

**Result: System is functional end-to-end** ✨

---

## 📱 Phase 2: Admin Integration (Next 2-3 Hours)

Once Phase 1 is done:

```
[ ] Create admin route: /admin/submissions
[ ] Add authentication check (admin-only access)
[ ] Import SubmissionsPage component
[ ] Pass supabase client to component
[ ] Test dashboard loads
[ ] Test all dashboard features:
    • Search by name/email/subject
    • Filter by status
    • Sort by date
    • Click submission to open detail
    • Change status
    • Add notes
    • Send reply with templates
```

---

## 🎯 Critical Blocker Check

Before you start, verify:

```
✅ Supabase project created: https://mrqzsfcfzvejreowkykm.supabase.co
✅ Service role key obtained
✅ Anon key obtained
✅ Database schema already ran (tables exist)
✅ Email credentials have
✅ Resend account created: https://resend.com
✅ .env.local updated with credentials
```

All ✅? **You're ready to go!**

---

## 🆘 Troubleshooting Quick Reference

### "Edge function not found"
→ Make sure function is deployed in Supabase dashboard

### "Email not sending"
→ Check Resend API key is correct
→ Verify sender domain in Resend is active

### "Submission not saving"
→ Check Supabase database connection
→ Verify RLS policies aren't blocking INSERT

### "Admin can't reply"
→ Check JWT token is valid
→ Verify user has admin role
→ Check rate limit (20/hour)

### "Form validation errors"
→ Check browser console for validation messages
→ Check .env.local has all required keys

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Resend Docs**: https://resend.com/docs
- **Email Templates**: View in `src/utils/emailTemplates.ts`
- **Quick Templates**: Edit `src/utils/replyTemplates.ts`
- **Edge Functions**: See `supabase/functions/*/index.ts`

---

## ⏱️ Time Summary

```
Phase 1 Setup:     ~1 hour
Phase 1 Testing:   ~0.5 hours
Phase 1 Total:     ~1.5 hours

Phase 2 Setup:     ~2-3 hours
Phase 2 Testing:   ~1 hour
Phase 2 Total:     ~3-4 hours

Total to Production Ready: 4-5 hours
```

**You can do this today! 🚀**

---

## 🎓 Learning Resources

After deployment, consider:
- [ ] Add Sentry error monitoring
- [ ] Set up Resend webhook for tracking
- [ ] Create analytics dashboard
- [ ] Implement automated tests
- [ ] Add reCAPTCHA spam protection
- [ ] Set up scheduled backups

But these are optional - **you'll have a production-ready system after Phase 2.**

---

**Last Updated:** March 26, 2026
**Status:** Ready for Phase 1 Execution
**Next Step:** Deploy edge functions 🚀
