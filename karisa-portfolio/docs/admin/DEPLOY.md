# Admin revamp — deploy checklist

For the branch `worktree-admin-revamp-plan` (commits `d1de312..e9f1bdc`). Nothing here can be
run from a Claude session (no Supabase or GitHub credentials); each step is yours.

```
1. Apply the migration: Supabase → SQL editor → run supabase/migrations/20260917000000_admin_realtime.sql
   (or `supabase db push`). Confirm: select tablename from pg_publication_tables where pubname='supabase_realtime';
2. Deploy the two functions: supabase functions deploy send-notification && supabase functions deploy handle-inbound-email
   (config.toml pins verify_jwt per function; nothing to pass).
3. Confirm secrets: MAIL_DOMAIN, MAIL_FROM_ADDRESS, MAIL_FROM_NAME, PORTFOLIO_URL, ADMIN_EMAIL, RESEND_API_KEY, RESEND_WEBHOOK_SECRET
   — `supabase secrets list`.
4. Prove the loop end to end:
   a. Submit the contact form on the site → alert lands in Gmail with "Open this thread" → link opens /admin/submissions/<id>.
   b. Reply to that alert from Gmail → visitor receives it from karisa@voyani.tech → the thread shows "You · via Gmail · Sent".
   c. Reply as the visitor → thread shows the inbound within seconds (realtime) and the Overview's "Unread replies" increments.
   d. Open the thread → unread clears.
5. Push the branch and open the PR (no credentials in Claude sessions).
```

Note on step 2: Task 15 also put `send-reply` on the shared `_shared/emailTemplate.ts`, so deploy
it in the same pass — `supabase functions deploy send-reply`. Three functions, not two.

`deno check` was not run on this machine (Deno is not installed); the functions were only
exercised through the Vitest suite that covers `_shared/inbound.ts`, `_shared/mail.ts` and
`_shared/emailTemplate.ts`. Run `deno check supabase/functions/*/index.ts` before deploying.
