# Admin Revamp Implementation Plan — "The Kanga Sheet, Operate mode"

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Before editing any UI file in Tasks 1–10, load `impeccable:impeccable` and read its `reference/craft-floor.md`; the design contract is `DESIGN.md` plus §1 of this document.

**Goal:** Rebuild the private `/admin` area so it wears the same design system as the public site, and so every reply — the ones Karisa sends from the dashboard, the ones she sends from Gmail, and the ones visitors send back — is recorded, visible in one thread, and deep-linked from the email that announced it.

**Architecture:** The admin stays a React Router 7 tree under `/admin` behind `ProtectedAdminRoute`, but becomes a layout route with an `<Outlet>` and gains two routes (`/admin/submissions/:id`, `/admin/settings`). All Supabase reads move behind small pure modules (`src/admin/data/*`, `src/utils/analyticsMath.ts`) that are unit-tested without a client; pages only fetch, subscribe and render. Email threading is closed on the server: `send-notification` deep-links and sets `reply_to`, and `handle-inbound-email` learns to recognise a reply *from the admin* and relay it to the visitor while recording it as an outbound reply.

**Tech Stack:** React 19, Vite 6, Tailwind 3 (tokens in `tailwind.config.js`, primitives in `src/index.css`), React Router 7, react-hook-form + Zod, sonner, Supabase JS v2 (Postgres + Realtime + Storage), Supabase Edge Functions (Deno), Resend, Vitest + Testing Library.

**Spec:** §0 (audit) and §1 (design contract) of this document, plus `DESIGN.md` and `PRODUCT.md` at the repo root. Everything below argues from those.

## Status (2026-09-18)

All fifteen tasks are done on branch `worktree-admin-revamp-plan`, commits `d1de312..e9f1bdc` plus the docs commit that follows. Final pass (Task 14): **tests 28 files, 279 passed, 3 skipped** (baseline 12 / 220 / 3); **lint** clean on `src/admin`, `tailwind.config.js`, `vitest.config.js` (51 pre-existing errors remain in untouched public-site files); **build** ok (1m 9s, CSS 45.8 kB); **detector** 0 findings; **ban greps** 0 matches; **deno check** not run (Deno not installed). Deploy steps: `docs/admin/DEPLOY.md`.

| Task | Status | Commits | Note |
|---|---|---|---|
| 1 Foundations — tokens, primitives, StateMark, Skeleton, PageHead, Icon | ✅ | `d1de312` | |
| 2 Shell — AdminNav, AdminLayout with Toaster, layout route | ✅ | `5bc1cc5`, `3e90b81`, `9a4c5b2` | Toaster test corrected in Task 14 (sonner renders nothing until a toast exists) |
| 3 Login page on the cloth | ✅ | `6f0ac82` | |
| 4 Data layer — format, filters, thread, client mock | ✅ | `658a62e`, `88070ce` | |
| 5 Submissions list — URL filters, live updates, stacked rows, bulk bar | ✅ | `4b64c72`, `fe55dad` | |
| 6 Submission detail route — thread, composer, delivery state, read-marking | ✅ | `ec01814`, `94c1a2a`, `b2cbebe` | |
| 7 Overview — honest figures and an activity feed | ✅ | `e752d28`, `7a4d797` | |
| 8 Analytics math | ✅ | `1ec1052` | |
| 9 Analytics page | ✅ | `e9511d6`, `aea1b7a` | |
| 10 Settings — notifications, labels, account | ✅ | `58294ff`, `1555804` | |
| 11 Realtime publication migration | ✅ | `3518e00` | **Applied 2026-09-18** via Management API; `pg_publication_tables` lists all three tables; both RLS policies present |
| 12 `send-notification` — deep link, `reply_to` | ✅ | `3f85b29` | **Deployed 2026-09-18** as v32 (`verify_jwt=false`); OPTIONS 204, POST validates |
| 13 `handle-inbound-email` — relay the admin's Gmail reply | ✅ | `1d58da6`, `73d6b47` | **Deployed 2026-09-18** as v20 (`verify_jwt=false`); boots (405 on GET) |
| 15 Email templates on the brand | ✅ | `f200321` | **Deployed 2026-09-18** with all three functions; `send-reply` v45 (`verify_jwt=true`), boots (401 on GET) |
| 14 Finish — detector, verification, docs, deploy checklist | ✅ | `3e90b81`, `9a4c5b2`, `e9f1bdc`, docs commit | Visual pass covered `/admin/login` only: no `.env.local` in the worktree, so no sign-in |

Merged to `main` and pushed by the user (`e3c926b`); migration and functions pushed to project `mrqzsfcfzvejreowkykm` from this session. Remaining manual step: the end-to-end email loop test (DEPLOY.md step 4). The final whole-branch review was skipped at the user's request.

## Global Constraints

- **No new dependencies.** Charts are inline SVG. No chart library, no icon library, no date library.
- **framer-motion is removed from `src/admin/**`.** Operate mode: no orchestrated load sequences; transitions are colour-only, 150–250 ms, `ease-press`. Loading is a skeleton, never a spinner in content.
- **Colour tokens only:** `cloth-*`, `mark-*`, `pindo`, `pindo-deep`, `pindo-wash`, `warn`, `alarm`. No Tailwind default palette (`blue-500`, `gray-400`, …), no raw hex in JSX (the sonner `toastOptions` object is the one exception, mirroring `App.jsx`), no `dark:` variants, no `white/5`. Text never lighter than `mark-500`.
- **No gradients, shadows, blur, glass, rounded corners** (`rounded-full` only on the state dot). No emoji as icons — inline SVG at 16–18px stroked in `currentColor`.
- **State is a printed mark plus its word** (`.mark-state[data-state]`), never a hue alone.
- **One 2px indigo rule on `/admin`:** the top bar's bottom edge. Page heads use a 1px `mark-900` rule. Nothing else on the admin draws 2px indigo.
- **Type:** Archivo for everything; Bricolage (`font-display`) only for the one page title per page and for figures. Fixed rem sizes, no `clamp()`.
- **Every text control has a visible `<label>`**; every icon-only button has `aria-label`; every table has a `<caption className="sr-only">`.
- **Tabular content gets a stacked rendering below `md`**, never a horizontal scroller.
- **Tests:** Vitest suite must stay green. Baseline on 2026-09-17: 12 files, 220 passed, 3 skipped. Run `npx vitest run <file>` per task and `npx vitest run` before every commit.
- **Commit after every task** on the worktree branch. Do not push; the user pushes (no credentials in Claude sessions).
- **Edge functions are not deployable from here.** Tasks 12–13 end with a deploy checklist for the user, not a deploy.
- **Never invent brand facts or addresses.** `ADMIN_EMAIL` defaults to `voyanitech@gmail.com` and stays that way.

---

## 0. Current state — audit findings (2026-09-17)

Established by reading `src/admin/**`, `src/App.jsx`, `tailwind.config.js`, `src/index.css`, `supabase/**`. Every task below exists because of a line here.

### 0.1 Theme: the admin is two generations behind the site

- `tailwind.config.js` documents the public "Kanga Sheet" (cloth/mark/pindo, square corners, no shadows) and says of the leftover dark `ink`/`signal` ramp: *"If the admin is ever redesigned, delete that block with it."* The admin does not even use that ramp — it hardcodes an older navy/cyan glassmorphism (`#061220`, `#0a1929`, `#61DAFB`, `#005792`, `bg-white/5 backdrop-blur`, `rounded-lg`, gradients) in every file.
- Four admin files (`InboundEmailCard.tsx`, `InboundRepliesFilter.tsx`, `AttachmentPreview.tsx`, `SpamQuarantineView.tsx`) are written for a **light** theme with `dark:` variants (`bg-gray-50 dark:bg-gray-800`). The site sets `color-scheme: light`, so inbound email cards render light-grey-on-white boxes inside a navy page. This is the "colour and theme don't match" the user sees.
- Emoji are used as icons throughout (📨 🆕 ⏳ ✅ 📧 🏷️ ⌛ 📅 💬).
- Every page authors its own framer-motion entrance; Operate surfaces should load into the task.

### 0.2 Functional defects — submissions & replies

| # | Defect | Where |
|---|---|---|
| F1 | **No `<Toaster>` is mounted on admin routes.** `Toaster` is rendered only inside `HomePage` (`src/App.jsx:104`). Every `toast.success/error` in the admin — "Reply sent", "Failed to load", "Status updated" — renders nothing. | `src/App.jsx`, `src/admin/layout/AdminLayout.jsx` |
| F2 | **The email deep link 404s.** `handle-inbound-email` forwards each visitor reply to Gmail with a link to `/admin/submissions/{id}` (`index.ts:641-647`). No such route exists; `App.jsx` only registers `/admin/submissions`. `send-notification` links to `/admin/submissions` with no id at all, though `submission.id` is in hand (`index.ts:838-870`). | `src/App.jsx`, both functions |
| F3 | **Replying from Gmail is lost.** The admin notification has no `reply_to`, so "Reply" in Gmail addresses `karisa@voyani.tech` → inbound handler routes it as `direct` mail → forwards it back to Karisa (`handleDirectMail`). It is never attached to the submission, never sent to the visitor. The forward of a visitor's reply sets `reply_to: sender.email`, so Karisa's answer goes straight to the visitor from Gmail and the CRM never records it. This is "seeing the replies when they are sent to my email". | `send-notification/index.ts:775-795`, `handle-inbound-email/index.ts:328-378` |
| F4 | **Outbound delivery status is invisible.** `handle-resend-webhook` writes `submission_replies.email_status` (sent/delivered/opened/bounced/failed). `ConversationTimeline` shows only the raw `resend_email_id` string. | `ConversationTimeline.jsx:89-93` |
| F5 | **The thread is split in two.** The detail panel renders "Outbound Messages" (original + `submission_replies`) and then a separate "Customer Replies" list (`inbound_replies`). Chronology is lost; a visitor's reply to Karisa's second message appears above the reply it answers. | `SubmissionDetailPanel.jsx` |
| F6 | **Inbound replies are never marked read.** `markEmailAsRead` is only called from a control inside `InboundEmailCard`; opening the thread does nothing. No unread count exists anywhere in the admin. | `SubmissionDetailPanel.jsx`, `InboundEmailCard.tsx` |
| F7 | **Spam/quarantined inbound is shown as if legitimate.** `useInboundEmails` selects all rows regardless of `status`; `SpamQuarantineView` (the component meant to hold them) has **zero importers**. | `src/hooks/useInboundEmails.ts` |
| F8 | **The list re-polls every 10 s** with no Realtime subscription, and the filter effect calls `result.sort(...)` on the state array, mutating it in place. | `SubmissionsPage.jsx:24-28, 90-96` |
| F9 | **"Unanswered" is a sort option that filters** (`sortBy === 'unanswered'` filters to `status === 'new'`), so it silently hides everything else and cannot combine with the status filter. | `SubmissionsPage.jsx:88-96` |
| F10 | **Filters are not in the URL**; the detail view is a modal with no URL — hence F2 — and the back button loses the list state. | `SubmissionsPage.jsx` |
| F11 | **`ReplyModal` logs the JWT** — `token.substring(0, 50)` and its suffix — to the browser console on every send. | `ReplyModal.jsx:56-61` |
| F12 | **Five components have zero importers:** `SpamQuarantineView.tsx`, `InboundRepliesFilter.tsx`, `ResponsiveTable.jsx`, `ResponsiveFilters.jsx`, `MobileDrawer.jsx` (1,227 lines). | `src/admin/components` |
| F13 | **Sidebar links to `/admin/settings`**; no such route. Dashboard shows "Coming soon" tiles for Analytics (which exists) and Settings. | `AdminSidebar.jsx`, `AdminDashboard.jsx` |
| F14 | **Login page has a "Demo Info" divider** with nothing under it. | `AdminLogin.jsx:171-178` |
| F15 | Bulk delete has no confirmation. | `SubmissionsPage.jsx:171-186` |

### 0.3 Functional defects — analytics

| # | Defect | Where |
|---|---|---|
| A1 | **"+12% vs last period" is a string literal.** No previous-period query exists. | `AnalyticsPage.tsx:150` |
| A2 | **"Chart visualization coming in next update"** — the chart is a placeholder; `submissionsByDate` is computed and thrown away. | `AnalyticsPage.tsx:250-255` |
| A3 | **Average response time is a mean in minutes** (`"1440m"`), skewed by any one slow reply; no humane units. | `analyticsService.ts:84-98` |
| A4 | Status/priority bars use `emerald/amber/blue/red` hues as the only signal. | `AnalyticsPage.tsx` |
| A5 | "Email Performance → Total Sent" repeats "Total Replies"; "Avg Response" appears twice. | `AnalyticsPage.tsx:205-230` |
| A6 | Inbound replies are not counted anywhere. | `analyticsService.ts` |
| A7 | CSV export dumps `select('*')` including internal `notes`; `exportToCSV` does not escape newlines. | `AnalyticsPage.tsx`, `analyticsService.ts:200-238` |
| A8 | `analytics_events` RLS is `USING (true) WITH CHECK (true)` — readable and writable by the anon key. Out of scope here; recorded for `docs/AUDIT.md` in Task 14. | `supabase/schema.sql:319` |

### 0.4 What is sound and stays

- `ProtectedAdminRoute` + role resolution from `app_metadata` (`App.jsx:168-178`) — matches RLS. Keep.
- `send-reply` (JWT verified, admin role enforced, 20/day rate limit, `reply_to: reply+{id}@`, `Message-ID` threading). Keep; the composer keeps calling it.
- `_shared/inbound.ts` (pure, 25 Vitest tests) and `_shared/mail.ts`. Extend, do not fork.
- `emailSanitizer.ts`, `emailValidation.ts`, `replyTemplates.ts`, `validationSchemas.ts` — reused as-is.
- `AttachmentPreview.tsx` logic (signed URLs, download logging) — restyled, not rewritten.
- The `inbound_replies` migration, its RLS, and the `mark_inbound_reply_read(p_reply_id, p_user_id)` RPC.

---

## 1. Design contract — the admin sheet

The admin is the public site's own cloth in **Operate** mode. It is not a second brand and not a dark "tool". These rules extend `DESIGN.md`; where they conflict, these win on `/admin` only.

**Ground and ink.** Page ground `cloth-100`; raised surfaces (top bar, inputs, the composer, the bulk bar) `cloth-50`; recessed (table hover, held items, quoted original) `cloth-200`. Rules: hairline `cloth-300`, heavy `cloth-400`, hard edge `mark-900`. Indigo is spent on: the top-bar seam, the current nav item (`pindo-wash` ground + `pindo` text), links, the primary action, focus, and state marks. `warn` = held/quarantined; `alarm` = bounced/failed/destructive.

**The admin seam.** The top bar carries the sheet's single 2px indigo rule (`.adm-topbar`). Page heads (`.adm-head`) are a 1px `mark-900` rule with the title and its meta on one baseline — title first, count beside it, never a kicker above.

**Type.** Archivo throughout; `font-display` only on `.adm-title` (1.5rem/700) and `.adm-figure` (1.75rem/700, tabular). Body 0.875rem in tables and forms, 1rem in the thread. Labels: `text-label` uppercase +0.09em `mark-500`, only inside tables, chips and figure captions.

**Shape.** Square. The only round thing is a state dot.

**State vocabulary (`.mark-state[data-state]`).**

| state | mark | word |
|---|---|---|
| `new` | filled indigo square | New |
| `in_progress` | hollow indigo square | In progress |
| `responded` | indigo dot | Responded |
| `closed` | `cloth-400` square, `mark-500` text | Closed |
| `waiting` | filled indigo square | Awaiting you |
| `pending` / `sent` | hollow / filled indigo square | Queued / Sent |
| `delivered` / `opened` | indigo dot | Delivered / Opened |
| `bounced` / `failed` | alarm hollow diamond, alarm text | Bounced / Failed |
| `held` | ochre hollow diamond, ochre text | Held |

**Layout.** Top bar (sticky, 3.5rem). Below `lg`: nav is a disclosure panel under the bar. At `lg`+: a 14rem side column with a `cloth-300` right rule; content column `min-w-0 flex-1`, padded `px-4 py-6 sm:px-6 lg:px-8`, all inside `max-w-sheet`. Tables render as stacked rows below `md`.

**Motion.** Colour transitions only, 250 ms `ease-press`. Skeletons pulse (`animate-pulse`), which the global `prefers-reduced-motion` rule already disables. No entrance animation, no scale on press.

**Copy.** Plain, measured, specific. "Awaiting you" not "Pending". "No submissions match these filters" with a "Clear filters" action, not "Nothing here". Errors say what failed and what to do next.

---

## 2. File structure

**Create**
- `src/admin/components/StateMark.jsx` — `<StateMark state>`; the only way state is rendered.
- `src/admin/components/Skeleton.jsx` — `Skeleton`, `TableSkeleton`, `ThreadSkeleton`.
- `src/admin/components/PageHead.jsx` — title + meta + actions on one rule.
- `src/admin/components/Icon.jsx` — the inline SVG glyphs the admin uses.
- `src/admin/components/AdminNav.jsx` — top bar, mobile disclosure, `NavLinks`.
- `src/admin/components/ConversationThread.jsx` — one chronological thread.
- `src/admin/components/ReplyComposer.jsx` — inline composer (replaces the modal).
- `src/admin/components/DailyChart.jsx` — inline SVG bars.
- `src/admin/pages/SubmissionDetailPage.jsx` — `/admin/submissions/:id`.
- `src/admin/pages/SettingsPage.jsx` — `/admin/settings`.
- `src/admin/data/thread.ts` (+ test) — `buildThread`, `threadSummary`.
- `src/admin/data/submissionsQuery.ts` (+ test) — URL filters, `applyFilters`, `decorateRow`.
- `src/admin/data/format.ts` (+ test) — `formatRelative`, `formatDateTime`.
- `src/utils/analyticsMath.ts` (+ test) — pure analytics.
- `src/test/mockSupabase.js` — chainable client mock for page tests.
- `supabase/migrations/20260917000000_admin_realtime.sql` — realtime publication.

**Modify**
- `tailwind.config.js` — delete the `ink`/`signal` ramp and its paragraph.
- `src/index.css` — add the `.adm-*` primitives and the state variants.
- `src/App.jsx` — layout route with `<Outlet>`, two new routes.
- `src/admin/layout/AdminLayout.jsx`, `pages/AdminLogin.jsx`, `pages/AdminDashboard.jsx`, `pages/SubmissionsPage.jsx`, `pages/AnalyticsPage.tsx`, `components/BulkActionsBar.tsx` → `.jsx`, `components/LabelsManager.tsx` → `.jsx` (inline, on Settings), `components/AttachmentPreview.tsx` (restyle), `src/hooks/useInboundEmails.ts` (drop the hook, keep the helpers), `src/utils/analyticsService.ts`.
- `supabase/functions/send-notification/index.ts`, `supabase/functions/handle-inbound-email/index.ts`, `supabase/functions/_shared/inbound.ts` (+ test).
- `DESIGN.md` (admin section; drop the Legacy Boundary Rule), `docs/CHANGELOG.md`, `docs/AUDIT.md` (A8).

**Delete**
- `AdminSidebar.jsx`, `AdminNavbar.jsx`, `MobileDrawer.jsx`, `ResponsiveTable.jsx`, `ResponsiveFilters.jsx`, `SpamQuarantineView.tsx`, `InboundRepliesFilter.tsx`, `ConversationTimeline.jsx`, `InboundEmailCard.tsx`, `ReplyModal.jsx`, `SubmissionDetailPanel.jsx`, `ResponsiveModal.jsx`.

---

## 3. Tasks

### Task 1: Foundations — tokens, primitives, StateMark, Skeleton, PageHead, Icon

**Files:**
- Modify: `tailwind.config.js` (the `ink` and `signal` blocks, lines ~95–115, and the paragraph in the header comment beginning "The `ink` / `signal` ramp below is NOT part of this world")
- Modify: `src/index.css` (append inside the existing `@layer components { … }` block, after `.field-label`)
- Create: `src/admin/components/StateMark.jsx`, `src/admin/components/Skeleton.jsx`, `src/admin/components/PageHead.jsx`, `src/admin/components/Icon.jsx`
- Test: `src/admin/components/StateMark.test.jsx`

**Interfaces:**
- Produces: `StateMark({ state: string, children?: ReactNode, className?: string })` — renders `<span class="mark-state" data-state=…>`; `'clicked'` is normalised to `'opened'`.
- Produces: `Skeleton({ className })`, `TableSkeleton({ rows = 6, cols = 5 })`, `ThreadSkeleton()`.
- Produces: `PageHead({ title: string, meta?: ReactNode, actions?: ReactNode })`.
- Produces: `Icon({ name: 'overview'|'inbox'|'chart'|'settings'|'menu'|'close'|'signout'|'back'|'send'|'paperclip'|'search'|'check'|'trash'|'archive'|'tag'|'refresh', className? })`.
- Produces CSS classes: `.adm-topbar .adm-nav-link .adm-head .adm-title .adm-figure .adm-table .adm-chip .adm-skel .adm-card .field-sm .btn-alarm` and `.mark-state[data-state=…]` variants listed in §1.

- [ ] **Step 1: Write the failing test**

`src/admin/components/StateMark.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StateMark from './StateMark';

describe('StateMark', () => {
  it('renders the word for a submission state as a printed mark', () => {
    render(<StateMark state="in_progress" />);
    const el = screen.getByText('In progress');
    expect(el).toHaveClass('mark-state');
    expect(el).toHaveAttribute('data-state', 'in_progress');
  });

  it('normalises clicked to opened', () => {
    render(<StateMark state="clicked" />);
    expect(screen.getByText('Opened')).toHaveAttribute('data-state', 'opened');
  });

  it('falls back to the raw state when it has no word', () => {
    render(<StateMark state="weird" />);
    expect(screen.getByText('weird')).toBeInTheDocument();
  });

  it('accepts custom children', () => {
    render(<StateMark state="waiting">3 awaiting you</StateMark>);
    expect(screen.getByText('3 awaiting you')).toHaveAttribute('data-state', 'waiting');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/admin/components/StateMark.test.jsx`
Expected: FAIL — `Failed to resolve import "./StateMark"`.

- [ ] **Step 3: Create the four components**

`src/admin/components/StateMark.jsx`:
```jsx
import React from 'react';

/**
 * State is a printed mark plus its own word, never a hue (DESIGN.md → The Printed
 * Mark Rule). The shape of the mark comes from index.css `.mark-state[data-state]`.
 */
const WORDS = {
  new: 'New',
  in_progress: 'In progress',
  responded: 'Responded',
  closed: 'Closed',
  waiting: 'Awaiting you',
  pending: 'Queued',
  sent: 'Sent',
  delivered: 'Delivered',
  opened: 'Opened',
  bounced: 'Bounced',
  failed: 'Failed',
  held: 'Held',
};

export default function StateMark({ state, children, className = '' }) {
  const s = state === 'clicked' ? 'opened' : state;
  return (
    <span className={`mark-state ${className}`} data-state={s}>
      {children ?? WORDS[s] ?? s}
    </span>
  );
}
```

`src/admin/components/Skeleton.jsx`:
```jsx
import React from 'react';

/** Loading is a placeholder in the shape of the content, never a spinner in it. */
export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`adm-skel ${className}`} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div role="status" aria-live="polite" className="space-y-px border-t border-cloth-300">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3 border-b border-cloth-300 px-3 py-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-3/4' : 'w-1/2'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ThreadSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Loading conversation…</span>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-16 w-5/6" />
      <Skeleton className="h-16 w-4/6" />
    </div>
  );
}
```

`src/admin/components/PageHead.jsx`:
```jsx
import React from 'react';

/**
 * The page's one rule. Title first, its count or meta beside it on the same baseline,
 * actions on the right — never a kicker above (DESIGN.md → The Label Is Interior Rule).
 */
export default function PageHead({ title, meta, actions }) {
  return (
    <header className="adm-head">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="adm-title">{title}</h1>
        {meta ? <p className="tabular text-sm text-mark-500">{meta}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
```

`src/admin/components/Icon.jsx`:
```jsx
import React from 'react';

/** Every admin glyph, inline, stroked in currentColor. No emoji, no icon font. */
const PATHS = {
  overview: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  inbox: 'M4 13V6a1 1 0 011-1h14a1 1 0 011 1v7M4 13h4l2 3h4l2-3h4M4 13v5a1 1 0 001 1h14a1 1 0 001-1v-5',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 01-.1 1.2l2 1.5-2 3.4-2.3-.9a7 7 0 01-2 1.2l-.4 2.5H9.8l-.4-2.5a7 7 0 01-2-1.2l-2.3.9-2-3.4 2-1.5A7 7 0 015 12a7 7 0 01.1-1.2l-2-1.5 2-3.4 2.3.9a7 7 0 012-1.2l.4-2.5h4.4l.4 2.5a7 7 0 012 1.2l2.3-.9 2 3.4-2 1.5A7 7 0 0119 12z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  signout: 'M15 17l5-5-5-5M20 12H9M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4',
  back: 'M11 19l-7-7 7-7M4 12h16',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  paperclip: 'M21 11.5l-9 9a5.5 5.5 0 01-7.8-7.8l9-9a3.5 3.5 0 015 5l-9 9a1.5 1.5 0 01-2.1-2.1l8.3-8.3',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4.3-4.3',
  check: 'M5 12l5 5L20 7',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  archive: 'M4 4h16v4H4zM6 8v12h12V8M10 12h4',
  tag: 'M20 12l-8 8-9-9V3h8l9 9zM7 7h.01',
  refresh: 'M20 12a8 8 0 01-14.5 4.6M4 12a8 8 0 0114.5-4.6M4 4v5h5M20 20v-5h-5',
};

export default function Icon({ name, className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/admin/components/StateMark.test.jsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Delete the legacy ramp from `tailwind.config.js`**

Remove the `ink: { … }` and `signal: { … }` objects (and the `/* ---- Legacy dark ramp: /admin only … */` comment above them). Replace the header-comment paragraph that begins "The `ink` / `signal` ramp below is NOT part of this world" with:
```
 * The private /admin area runs on the same tokens in Operate mode — denser, fixed
 * rem type, one family, no entrance orchestration. See DESIGN.md → "The admin sheet".
```
Then confirm nothing referenced it: `grep -rn "ink-\|signal" src --include=*.jsx --include=*.tsx --include=*.js --include=*.ts --include=*.css | grep -v "text-ink\b" ` — Expected: no matches (the only pre-existing hits are the words "link"/"thinking"; verify each hit is not a class name).

- [ ] **Step 6: Add the admin primitives to `src/index.css`**

Append inside `@layer components`, directly after the `.link { … }` rule:
```css
  /* ---- Admin: the same cloth in Operate mode --------------------------------
     Denser, fixed-rem type, one family, no entrance orchestration. The admin is
     its own sheet: its one seam is the top bar's 2px indigo rule, so page heads
     inside it draw a 1px ink rule instead. */

  .adm-topbar {
    @apply sticky top-0 z-30 border-b-2 border-pindo bg-cloth-50;
  }

  .adm-nav-link {
    @apply flex items-center gap-3 px-3 py-2 text-sm font-medium text-mark-700
           transition-colors duration-250 ease-press hover:text-pindo;
  }

  .adm-nav-link[aria-current='page'] {
    @apply bg-pindo-wash text-pindo;
  }

  .adm-head {
    @apply mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2
           border-b border-mark-900 pb-3;
  }

  .adm-title {
    @apply font-display text-2xl font-bold tracking-[-0.02em] text-mark-900;
  }

  .adm-figure {
    @apply tabular font-display text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-mark-900;
  }

  .adm-card {
    @apply border border-cloth-300 bg-cloth-50;
  }

  .adm-table {
    @apply w-full border-collapse text-sm;
  }

  .adm-table th {
    @apply border-b border-cloth-300 px-3 py-2 text-left text-label font-normal uppercase
           tracking-[0.09em] text-mark-500;
  }

  .adm-table td {
    @apply border-b border-cloth-300 px-3 py-3 align-top;
  }

  .adm-table tbody tr:hover td {
    @apply bg-cloth-200;
  }

  .adm-chip {
    @apply inline-flex items-center gap-1.5 border border-cloth-400 px-2 py-0.5 text-xs text-mark-700;
  }

  .adm-skel {
    @apply animate-pulse bg-cloth-200;
  }

  .field-sm {
    @apply w-full border border-cloth-400 bg-cloth-50 px-3 py-2 text-sm text-mark-900
           transition-colors duration-250 ease-press
           focus:border-pindo focus:outline-none focus:ring-2 focus:ring-pindo/25;
  }

  .field-sm[aria-invalid='true'] {
    @apply border-alarm;
  }

  .btn-alarm {
    @apply inline-flex items-center justify-center gap-2 border border-alarm px-4 py-2 text-sm
           font-medium text-alarm transition-colors duration-250 ease-press
           hover:bg-alarm hover:text-cloth-50;
  }

  /* Submission and delivery states, as marks with their own word. */
  .mark-state[data-state='in_progress']::before,
  .mark-state[data-state='pending']::before {
    background: none;
    border: 1.5px solid #243d8f;
  }

  .mark-state[data-state='responded']::before,
  .mark-state[data-state='delivered']::before,
  .mark-state[data-state='opened']::before {
    border-radius: 9999px;
  }

  .mark-state[data-state='closed'] {
    @apply text-mark-500;
  }

  .mark-state[data-state='closed']::before {
    background: #c6beab;
  }

  .mark-state[data-state='held']::before,
  .mark-state[data-state='bounced']::before,
  .mark-state[data-state='failed']::before {
    background: none;
    border: 1.5px solid currentColor;
    transform: rotate(45deg);
  }

  .mark-state[data-state='held'] {
    @apply text-warn;
  }

  .mark-state[data-state='bounced'],
  .mark-state[data-state='failed'] {
    @apply text-alarm;
  }
```

- [ ] **Step 7: Build to prove the CSS compiles**

Run: `npm run build 2>&1 | tail -5`
Expected: `✓ built in …` with no `@apply` errors. (`text-label` resolves to the `label` fontSize token; `ease-press` and `duration-250` exist in the config.)

- [ ] **Step 8: Run the whole suite and commit**

Run: `npx vitest run 2>&1 | tail -4` — Expected: 13 files, 224 passed, 3 skipped.
```bash
git add tailwind.config.js src/index.css src/admin/components/StateMark.jsx src/admin/components/StateMark.test.jsx src/admin/components/Skeleton.jsx src/admin/components/PageHead.jsx src/admin/components/Icon.jsx
git commit -m "feat(admin): Operate-mode primitives on the Kanga tokens; retire the legacy dark ramp"
```

---

### Task 2: Shell — AdminNav, AdminLayout with Toaster, layout route

Fixes F1, F12 (three of five), and the routing shape F2/F10 depend on.

**Files:**
- Create: `src/admin/components/AdminNav.jsx`
- Modify: `src/admin/layout/AdminLayout.jsx` (rewrite)
- Modify: `src/App.jsx:37-41` (lazy imports) and `:343-393` (admin routes)
- Delete: `src/admin/components/AdminSidebar.jsx`, `AdminNavbar.jsx`, `MobileDrawer.jsx`, `ResponsiveTable.jsx`, `ResponsiveFilters.jsx`
- Test: `src/admin/layout/AdminLayout.test.jsx`

**Interfaces:**
- Consumes: `Icon` (Task 1).
- Produces: `AdminLayout({ user, onLogout })` renders `<Outlet />` — pages no longer receive `children`; they receive their `client` prop from the route element in `App.jsx`.
- Produces: `NAV_ITEMS` exported from `AdminNav.jsx`: `[{ to, label, icon, end? }]`. Task 10 appends the Settings item.
- Produces: `NavLinks({ onNavigate })` export.

- [ ] **Step 1: Write the failing test**

`src/admin/layout/AdminLayout.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const renderAt = (path, onLogout = vi.fn()) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin" element={<AdminLayout user={{ email: 'karisa@example.com' }} onLogout={onLogout} />}>
          <Route index element={<p>overview page</p>} />
          <Route path="submissions" element={<p>submissions page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('AdminLayout', () => {
  it('renders the routed page through its outlet', () => {
    renderAt('/admin/submissions');
    expect(screen.getByText('submissions page')).toBeInTheDocument();
  });

  it('marks the current section in the navigation', () => {
    renderAt('/admin/submissions');
    const current = screen.getAllByRole('link', { name: /submissions/i }).find((l) => l.getAttribute('aria-current') === 'page');
    expect(current).toBeTruthy();
    const overview = screen.getAllByRole('link', { name: /overview/i })[0];
    expect(overview).not.toHaveAttribute('aria-current');
  });

  it('mounts a toaster region so admin toasts are visible', () => {
    renderAt('/admin');
    expect(document.querySelector('[data-sonner-toaster]')).toBeTruthy();
  });

  it('signs out from the top bar', async () => {
    const onLogout = vi.fn();
    renderAt('/admin', onLogout);
    await userEvent.click(screen.getAllByRole('button', { name: /sign out/i })[0]);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/admin/layout/AdminLayout.test.jsx`
Expected: FAIL — `AdminLayout` renders `children` (undefined) and its nav has no `aria-current`; the Toaster query returns `null`.

- [ ] **Step 3: Create `AdminNav.jsx`**

```jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import Icon from './Icon';

export const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: 'overview', end: true },
  { to: '/admin/submissions', label: 'Submissions', icon: 'inbox' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'chart' },
];

export function NavLinks({ onNavigate }) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink to={item.to} end={item.end} onClick={onNavigate} className="adm-nav-link">
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

/**
 * The admin's top bar: the sheet's one seam. Below lg the section links live in a
 * disclosure panel under it; at lg+ AdminLayout renders NavLinks in a side column.
 */
export default function AdminNav({ user, onLogout, open, onToggle, onNavigate }) {
  return (
    <div className="adm-topbar">
      <div className="mx-auto flex h-14 max-w-sheet items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onToggle} aria-expanded={open} aria-controls="admin-nav-panel" aria-label={open ? 'Close navigation' : 'Open navigation'} className="btn-quiet px-2 lg:hidden">
            <Icon name={open ? 'close' : 'menu'} />
          </button>
          <Link to="/admin" className="font-display text-[1.0625rem] font-bold text-mark-900">
            Voyani <span className="font-sans text-sm font-medium text-mark-500">admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden truncate text-sm text-mark-700 sm:inline" title={user?.email}>{user?.email}</span>
          <button type="button" onClick={onLogout} className="btn-quiet">
            <Icon name="signout" className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
            <span className="sr-only sm:hidden">Sign out</span>
          </button>
        </div>
      </div>
      <nav id="admin-nav-panel" aria-label="Admin sections" className={`${open ? 'block' : 'hidden'} border-t border-cloth-300 bg-cloth-50 px-4 py-3 lg:hidden`}>
        <NavLinks onNavigate={onNavigate} />
      </nav>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite `AdminLayout.jsx`**

```jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminNav, { NavLinks } from '../components/AdminNav';

// Mirrors the public Toaster in App.jsx so a toast looks the same on either surface.
const TOAST_OPTIONS = {
  style: {
    background: '#FAF8F3',
    color: '#14171C',
    border: '1px solid #14171C',
    borderRadius: '0px',
    fontFamily: 'Archivo, system-ui, sans-serif',
  },
  success: { iconTheme: { primary: '#243D8F', secondary: '#FAF8F3' } },
  error: { iconTheme: { primary: '#A32014', secondary: '#FAF8F3' } },
};

const AdminLayout = ({ user, onLogout }) => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cloth-100 text-mark-900">
      <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
      <a href="#admin-main" className="skip-link">Skip to content</a>
      <AdminNav
        user={user}
        onLogout={onLogout}
        open={navOpen}
        onToggle={() => setNavOpen((o) => !o)}
        onNavigate={() => setNavOpen(false)}
      />
      <div className="mx-auto flex w-full max-w-sheet">
        <aside aria-label="Admin sections" className="hidden w-56 shrink-0 border-r border-cloth-300 px-3 py-6 lg:block">
          <NavLinks />
        </aside>
        <main id="admin-main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
```

- [ ] **Step 5: Restructure the admin routes in `App.jsx`**

Add `Outlet` is not needed here; add nothing to imports except keeping the lazy imports. Replace the three `<Route path="/admin…">` blocks (`/admin`, `/admin/submissions`, `/admin/analytics`) with one layout route:
```jsx
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute isAuthenticated={isAuthenticated} isAdmin={isAdmin} isLoading={isLoading} isConfigured={isSupabaseConfigured}>
            <Suspense fallback={<SectionLoader />}>
              <AdminLayout user={user} onLogout={handleLogout} />
            </Suspense>
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Suspense fallback={<SectionLoader />}><AdminDashboard client={supabaseRef.current} /></Suspense>} />
        <Route path="submissions" element={<Suspense fallback={<SectionLoader />}><SubmissionsPage client={supabaseRef.current} /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<SectionLoader />}><AnalyticsPage client={supabaseRef.current} /></Suspense>} />
      </Route>
```
`AdminDashboard` currently takes `supabaseClient`; change its prop name to `client` in `AdminDashboard.jsx` line 5 (`const AdminDashboard = ({ client }) =>`) and replace every `supabaseClient` inside it with `client`. (Task 7 rewrites the file anyway.)

- [ ] **Step 6: Delete the dead shell components**

```bash
git rm src/admin/components/AdminSidebar.jsx src/admin/components/AdminNavbar.jsx src/admin/components/MobileDrawer.jsx src/admin/components/ResponsiveTable.jsx src/admin/components/ResponsiveFilters.jsx
grep -rn "AdminSidebar\|AdminNavbar\|MobileDrawer\|ResponsiveTable\|ResponsiveFilters" src
```
Expected: no matches.

- [ ] **Step 7: Run the test, then lint and build**

Run: `npx vitest run src/admin/layout/AdminLayout.test.jsx` — Expected: PASS (4).
Run: `npm run lint && npm run build 2>&1 | tail -3` — Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add -A src/admin src/App.jsx
git commit -m "feat(admin): one shell — top-bar seam, side nav, layout route, and a Toaster the admin never had"
```

---

### Task 3: Login page on the cloth

Fixes F14; the first thing Karisa sees must already be the system.

**Files:**
- Modify: `src/admin/pages/AdminLogin.jsx` (rewrite)
- Test: `src/admin/pages/AdminLogin.test.jsx`

**Interfaces:**
- Consumes: `supabase` from `src/lib/supabase.js` (may be `null`).

- [ ] **Step 1: Write the failing test**

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const signInWithPassword = vi.fn();
vi.mock('../../lib/supabase', () => ({ supabase: { auth: { signInWithPassword: (...a) => signInWithPassword(...a) } } }));
const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));

import AdminLogin from './AdminLogin';

describe('AdminLogin', () => {
  beforeEach(() => { signInWithPassword.mockReset(); navigate.mockReset(); });

  it('has no leftover demo copy', () => {
    render(<MemoryRouter><AdminLogin /></MemoryRouter>);
    expect(screen.queryByText(/demo/i)).toBeNull();
  });

  it('validates before calling Supabase and announces the error', async () => {
    render(<MemoryRouter><AdminLogin /></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it('signs in and navigates to /admin', async () => {
    signInWithPassword.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null });
    render(<MemoryRouter><AdminLogin /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/email/i), 'k@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/admin'));
  });

  it('shows the auth error inline', async () => {
    signInWithPassword.mockResolvedValue({ data: null, error: new Error('Invalid login credentials') });
    render(<MemoryRouter><AdminLogin /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/email/i), 'k@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid login credentials/i);
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/admin/pages/AdminLogin.test.jsx` — Expected: "has no leftover demo copy" FAILS (`Demo Info` present); the validation test fails on `aria-invalid`.

- [ ] **Step 3: Rewrite `AdminLogin.jsx`**

```jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!email) next.email = 'Enter your email address.';
    else if (!EMAIL_RE.test(email)) next.email = 'That does not look like an email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!supabase) {
      setErrors({ submit: 'The admin is not configured on this deployment.' });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data?.session?.user) navigate('/admin');
    } catch (error) {
      setErrors({ submit: error?.message || 'Sign-in failed. Try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloth-100 px-4 py-12 text-mark-900">
      <div className="w-full max-w-sm">
        <div className="hem">
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Sign in</h1>
          <p className="mt-2 text-sm text-mark-600">The private side of voyani.tech.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="field-label">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="field"
            />
            {errors.email && <p id="email-error" className="mt-2 text-sm text-alarm">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="field"
            />
            {errors.password && <p id="password-error" className="mt-2 text-sm text-alarm">{errors.password}</p>}
          </div>

          {errors.submit && (
            <p role="alert" className="border border-alarm px-4 py-3 text-sm text-alarm">{errors.submit}</p>
          )}

          <button type="submit" disabled={isLoading} className="btn-pindo w-full disabled:cursor-not-allowed disabled:bg-cloth-400">
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-sm">
          <Link to="/" className="link">Back to the site</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/admin/pages/AdminLogin.test.jsx` — Expected: PASS (4).

- [ ] **Step 5: Commit**

```bash
git add src/admin/pages/AdminLogin.jsx src/admin/pages/AdminLogin.test.jsx
git commit -m "feat(admin): sign-in on the cloth — inline errors, no demo copy, no motion"
```

---

### Task 4: Data layer — formatting, list filters, the unified thread, and a client mock

Pure modules with no Supabase import; everything later pages render is shaped here and tested here. Fixes F5, F7 (data side), F9.

**Files:**
- Create: `src/admin/data/format.ts`, `src/admin/data/submissionsQuery.ts`, `src/admin/data/thread.ts`
- Create: `src/test/mockSupabase.js`
- Test: `src/admin/data/format.test.ts`, `src/admin/data/submissionsQuery.test.ts`, `src/admin/data/thread.test.ts`

**Interfaces:**
- Produces `format.ts`: `formatRelative(iso: string, now?: Date): string`; `formatDateTime(iso: string): string`.
- Produces `submissionsQuery.ts`:
  - `type ListFilters = { status: 'all'|'new'|'in_progress'|'responded'|'closed'; box: 'active'|'archived'|'all'; q: string; sort: 'newest'|'oldest'; waiting: boolean }`
  - `DEFAULT_FILTERS`, `parseFilters(params: URLSearchParams): ListFilters`, `serializeFilters(f: ListFilters): URLSearchParams` (omits defaults), `decorateRow(row): SubmissionRow`, `applyFilters(rows: SubmissionRow[], f: ListFilters): SubmissionRow[]` (returns a new array).
  - `SubmissionRow` = the DB row + `replyCount: number`, `inboundUnread: number`, `lastInboundAt: string|null`, `awaiting: boolean`, `labelIds: string[]`.
  - `SUBMISSIONS_SELECT` — the PostgREST select string every list query uses.
- Produces `thread.ts`: `ThreadItem` union, `buildThread(submission, replies, inbound): ThreadItem[]`, `threadSummary(items): { unreadInbound: number; awaitingReply: boolean; lastAt: string|null }`.
- Produces `mockSupabase.js`: `createMockClient({ tables, rpc, auth })` — see Step 7.

- [ ] **Step 1: Write the failing tests**

`src/admin/data/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { formatRelative, formatDateTime } from './format';

const now = new Date('2026-09-17T12:00:00Z');

describe('formatRelative', () => {
  it('reads recent times as minutes and hours', () => {
    expect(formatRelative('2026-09-17T11:59:40Z', now)).toBe('just now');
    expect(formatRelative('2026-09-17T11:48:00Z', now)).toBe('12 min ago');
    expect(formatRelative('2026-09-17T09:00:00Z', now)).toBe('3 h ago');
  });
  it('names yesterday, then falls back to a date', () => {
    expect(formatRelative('2026-09-16T12:00:00Z', now)).toBe('Yesterday');
    expect(formatRelative('2026-09-02T12:00:00Z', now)).toBe('2 Sep');
    expect(formatRelative('2025-09-02T12:00:00Z', now)).toBe('2 Sep 2025');
  });
});

describe('formatDateTime', () => {
  it('prints a full, unambiguous timestamp', () => {
    expect(formatDateTime('2026-09-02T09:05:00Z')).toMatch(/2 Sep 2026/);
  });
});
```

`src/admin/data/submissionsQuery.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseFilters, serializeFilters, applyFilters, decorateRow, DEFAULT_FILTERS } from './submissionsQuery';

const raw = (over: Record<string, unknown>) => ({
  id: 'a', name: 'Amina', email: 'amina@example.com', subject: 'Website', status: 'new',
  priority: 'normal', archived: false, created_at: '2026-09-10T10:00:00Z',
  submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [],
  ...over,
});

describe('parseFilters / serializeFilters', () => {
  it('round-trips non-default filters and drops defaults', () => {
    const f = { ...DEFAULT_FILTERS, status: 'closed' as const, q: 'amina', waiting: true };
    const s = serializeFilters(f).toString();
    expect(s).toBe('status=closed&q=amina&waiting=1');
    expect(parseFilters(new URLSearchParams(s))).toEqual(f);
  });
  it('ignores garbage values', () => {
    expect(parseFilters(new URLSearchParams('status=nope&sort=sideways&box=x'))).toEqual(DEFAULT_FILTERS);
  });
});

describe('decorateRow', () => {
  it('derives counts and the awaiting flag', () => {
    const row = decorateRow(raw({
      status: 'responded',
      submission_replies: [{ count: 2 }],
      inbound_replies: [
        { id: 'i1', is_read: false, received_at: '2026-09-12T08:00:00Z', status: 'processed' },
        { id: 'i2', is_read: true, received_at: '2026-09-11T08:00:00Z', status: 'processed' },
        { id: 'i3', is_read: false, received_at: '2026-09-13T08:00:00Z', status: 'spam' },
      ],
      submission_labels: [{ label_id: 'l1' }],
    }));
    expect(row.replyCount).toBe(2);
    expect(row.inboundUnread).toBe(1);          // spam does not count
    expect(row.lastInboundAt).toBe('2026-09-12T08:00:00Z');
    expect(row.awaiting).toBe(true);
    expect(row.labelIds).toEqual(['l1']);
  });
  it('a new submission with no traffic is awaiting; a closed one never is', () => {
    expect(decorateRow(raw({})).awaiting).toBe(true);
    expect(decorateRow(raw({ status: 'closed', inbound_replies: [{ id: 'i', is_read: false, received_at: 'x', status: 'processed' }] })).awaiting).toBe(false);
  });
});

describe('applyFilters', () => {
  const rows = [
    decorateRow(raw({ id: '1', created_at: '2026-09-10T10:00:00Z' })),
    decorateRow(raw({ id: '2', status: 'responded', created_at: '2026-09-11T10:00:00Z' })),
    decorateRow(raw({ id: '3', status: 'closed', archived: true, name: 'Brian', created_at: '2026-09-12T10:00:00Z' })),
  ];
  it('hides archived by default and sorts newest first', () => {
    expect(applyFilters(rows, DEFAULT_FILTERS).map((r) => r.id)).toEqual(['2', '1']);
  });
  it('combines status, waiting and search without mutating input', () => {
    const before = rows.map((r) => r.id);
    expect(applyFilters(rows, { ...DEFAULT_FILTERS, waiting: true }).map((r) => r.id)).toEqual(['1']);
    expect(applyFilters(rows, { ...DEFAULT_FILTERS, box: 'all', q: 'brian' }).map((r) => r.id)).toEqual(['3']);
    expect(applyFilters(rows, { ...DEFAULT_FILTERS, sort: 'oldest' }).map((r) => r.id)).toEqual(['1', '2']);
    expect(rows.map((r) => r.id)).toEqual(before);
  });
});
```

`src/admin/data/thread.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildThread, threadSummary } from './thread';

const submission = { id: 's1', name: 'Amina', email: 'amina@example.com', message: 'Hello', created_at: '2026-09-10T10:00:00Z' };
const replies = [
  { id: 'r1', submission_id: 's1', reply_message: 'Thanks', reply_type: 'manual', email_status: 'delivered', resend_email_id: 're1', email_metadata: null, created_at: '2026-09-10T12:00:00Z' },
  { id: 'r2', submission_id: 's1', reply_message: 'From my phone', reply_type: 'manual', email_status: 'sent', resend_email_id: 're2', email_metadata: { source: 'email_relay' }, created_at: '2026-09-12T12:00:00Z' },
];
const inbound = [
  { id: 'i1', submission_id: 's1', from_email: 'amina@example.com', from_name: 'Amina', subject: 'Re: Thanks', body_text: 'Great', body_html: null, received_at: '2026-09-11T09:00:00Z', is_read: false, is_important: false, status: 'processed', spam_score: 0.5, spam_reasons: null, sender_verified: true, inbound_attachments: [] },
  { id: 'i2', submission_id: 's1', from_email: 'x@spam.io', from_name: null, subject: 'WIN', body_text: 'lottery', body_html: null, received_at: '2026-09-11T10:00:00Z', is_read: false, is_important: false, status: 'spam', spam_score: 8, spam_reasons: ['keywords'], sender_verified: false, inbound_attachments: [] },
];

describe('buildThread', () => {
  it('interleaves original, outbound and inbound in time order', () => {
    const t = buildThread(submission, replies, inbound);
    expect(t.map((i) => `${i.kind}:${i.id}`)).toEqual(['original:s1', 'outbound:r1', 'inbound:i1', 'inbound:i2', 'outbound:r2']);
  });
  it('carries delivery state and relay source on outbound items', () => {
    const t = buildThread(submission, replies, inbound);
    const r2 = t.find((i) => i.id === 'r2');
    expect(r2).toMatchObject({ kind: 'outbound', emailStatus: 'sent', source: 'email_relay' });
  });
  it('marks spam and quarantined inbound as held with a reason', () => {
    const t = buildThread(submission, replies, inbound);
    expect(t.find((i) => i.id === 'i2')).toMatchObject({ kind: 'inbound', held: true, heldReason: 'keywords' });
    expect(t.find((i) => i.id === 'i1')).toMatchObject({ kind: 'inbound', held: false });
  });
});

describe('threadSummary', () => {
  it('counts unread non-held inbound and knows when the visitor spoke last', () => {
    const t = buildThread(submission, replies, inbound);
    expect(threadSummary(t)).toEqual({ unreadInbound: 1, awaitingReply: false, lastAt: '2026-09-12T12:00:00Z' });
    expect(threadSummary(buildThread(submission, [replies[0]], inbound))).toMatchObject({ awaitingReply: true });
    expect(threadSummary(buildThread(submission, [], []))).toMatchObject({ awaitingReply: true, lastAt: submission.created_at });
  });
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `npx vitest run src/admin/data` — Expected: three files FAIL to resolve imports.

- [ ] **Step 3: Create `format.ts`**

```ts
/** Humane timestamps for the admin. All relative words are computed against `now` so tests are stable. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function sameUtcDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
}

export function formatRelative(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24 && sameUtcDay(then, now)) return `${h} h ago`;
  const yesterday = new Date(now.getTime() - 86400000);
  if (sameUtcDay(then, yesterday)) return 'Yesterday';
  const d = `${then.getUTCDate()} ${MONTHS[then.getUTCMonth()]}`;
  return then.getUTCFullYear() === now.getUTCFullYear() ? d : `${d} ${then.getUTCFullYear()}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}
```

- [ ] **Step 4: Create `submissionsQuery.ts`**

```ts
export type Status = 'new' | 'in_progress' | 'responded' | 'closed';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface ListFilters {
  status: 'all' | Status;
  box: 'active' | 'archived' | 'all';
  q: string;
  sort: 'newest' | 'oldest';
  waiting: boolean;
}

export const DEFAULT_FILTERS: ListFilters = { status: 'all', box: 'active', q: '', sort: 'newest', waiting: false };

const STATUSES = new Set(['all', 'new', 'in_progress', 'responded', 'closed']);
const BOXES = new Set(['active', 'archived', 'all']);
const SORTS = new Set(['newest', 'oldest']);

export function parseFilters(params: URLSearchParams): ListFilters {
  const status = params.get('status') ?? '';
  const box = params.get('box') ?? '';
  const sort = params.get('sort') ?? '';
  return {
    status: (STATUSES.has(status) ? status : 'all') as ListFilters['status'],
    box: (BOXES.has(box) ? box : 'active') as ListFilters['box'],
    q: params.get('q') ?? '',
    sort: (SORTS.has(sort) ? sort : 'newest') as ListFilters['sort'],
    waiting: params.get('waiting') === '1',
  };
}

export function serializeFilters(f: ListFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.status !== 'all') p.set('status', f.status);
  if (f.box !== 'active') p.set('box', f.box);
  if (f.q) p.set('q', f.q);
  if (f.sort !== 'newest') p.set('sort', f.sort);
  if (f.waiting) p.set('waiting', '1');
  return p;
}

/** One select string for every list query, so the row shape is the same everywhere. */
export const SUBMISSIONS_SELECT =
  'id, name, email, phone, subject, message, status, priority, notes, archived, archived_at, responded_at, created_at, updated_at, ' +
  'submission_replies(count), inbound_replies(id, is_read, received_at, status), submission_labels(label_id)';

export interface RawSubmissionRow {
  id: string; name: string; email: string; phone?: string | null; subject: string; message?: string;
  status: Status; priority: Priority | null; notes?: string | null; archived: boolean | null;
  archived_at?: string | null; responded_at?: string | null; created_at: string; updated_at?: string;
  submission_replies?: Array<{ count: number }>;
  inbound_replies?: Array<{ id: string; is_read: boolean; received_at: string; status: string }>;
  submission_labels?: Array<{ label_id: string }>;
}

export interface SubmissionRow extends RawSubmissionRow {
  replyCount: number;
  inboundUnread: number;
  lastInboundAt: string | null;
  awaiting: boolean;
  labelIds: string[];
}

const LIVE_INBOUND = new Set(['received', 'processing', 'processed']);

export function decorateRow(row: RawSubmissionRow): SubmissionRow {
  const live = (row.inbound_replies ?? []).filter((r) => LIVE_INBOUND.has(r.status));
  const inboundUnread = live.filter((r) => !r.is_read).length;
  const lastInboundAt = live.reduce<string | null>((m, r) => (m === null || r.received_at > m ? r.received_at : m), null);
  const awaiting = row.status !== 'closed' && (row.status === 'new' || inboundUnread > 0);
  return {
    ...row,
    replyCount: row.submission_replies?.[0]?.count ?? 0,
    inboundUnread,
    lastInboundAt,
    awaiting,
    labelIds: (row.submission_labels ?? []).map((l) => l.label_id),
  };
}

export function applyFilters(rows: SubmissionRow[], f: ListFilters): SubmissionRow[] {
  const q = f.q.trim().toLowerCase();
  const out = rows.filter((r) => {
    if (f.box === 'active' && r.archived) return false;
    if (f.box === 'archived' && !r.archived) return false;
    if (f.status !== 'all' && r.status !== f.status) return false;
    if (f.waiting && !r.awaiting) return false;
    if (q && !(r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q))) return false;
    return true;
  });
  return out.sort((a, b) => (f.sort === 'newest' ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at)));
}
```

- [ ] **Step 5: Create `thread.ts`**

```ts
import type { InboundAttachment } from '@/utils/emailValidation';

export interface OriginalItem { kind: 'original'; id: string; at: string; body: string; name: string; email: string }
export interface OutboundItem {
  kind: 'outbound'; id: string; at: string; body: string; replyType: string;
  emailStatus: string; resendId: string | null; source: 'dashboard' | 'email_relay';
}
export interface InboundItem {
  kind: 'inbound'; id: string; at: string; subject: string; bodyText: string | null; bodyHtml: string | null;
  fromName: string | null; fromEmail: string; isRead: boolean; isImportant: boolean;
  held: boolean; heldReason: string | null; senderVerified: boolean; spamScore: number | null;
  attachments: InboundAttachment[];
}
export type ThreadItem = OriginalItem | OutboundItem | InboundItem;

type SubmissionLike = { id: string; name: string; email: string; message: string; created_at: string };
type ReplyLike = { id: string; reply_message: string; reply_type: string; email_status: string | null; resend_email_id: string | null; email_metadata: { source?: string } | null; created_at: string };
type InboundLike = {
  id: string; from_email: string; from_name: string | null; subject: string; body_text: string | null; body_html: string | null;
  received_at: string; is_read: boolean; is_important: boolean; status: string; spam_score: number | null;
  spam_reasons: string[] | null; sender_verified?: boolean | null; inbound_attachments?: InboundAttachment[];
};

const HELD = new Set(['spam', 'quarantined', 'failed']);

export function buildThread(submission: SubmissionLike, replies: ReplyLike[], inbound: InboundLike[]): ThreadItem[] {
  const items: ThreadItem[] = [
    { kind: 'original', id: submission.id, at: submission.created_at, body: submission.message, name: submission.name, email: submission.email },
    ...replies.map<OutboundItem>((r) => ({
      kind: 'outbound', id: r.id, at: r.created_at, body: r.reply_message, replyType: r.reply_type,
      emailStatus: r.email_status ?? 'pending', resendId: r.resend_email_id,
      source: r.email_metadata?.source === 'email_relay' ? 'email_relay' : 'dashboard',
    })),
    ...inbound.map<InboundItem>((i) => {
      const held = HELD.has(i.status);
      const heldReason = held ? (i.spam_reasons?.[0] ?? (i.status === 'quarantined' ? 'quarantined for review' : i.status)) : null;
      return {
        kind: 'inbound', id: i.id, at: i.received_at, subject: i.subject, bodyText: i.body_text, bodyHtml: i.body_html,
        fromName: i.from_name, fromEmail: i.from_email, isRead: i.is_read, isImportant: i.is_important,
        held, heldReason, senderVerified: i.sender_verified !== false, spamScore: i.spam_score,
        attachments: i.inbound_attachments ?? [],
      };
    }),
  ];
  // The original always leads; everything else in time order.
  const [original, ...rest] = items;
  rest.sort((a, b) => a.at.localeCompare(b.at));
  return [original, ...rest];
}

export function threadSummary(items: ThreadItem[]): { unreadInbound: number; awaitingReply: boolean; lastAt: string | null } {
  const live = items.filter((i) => i.kind !== 'inbound' || !i.held);
  const last = live[live.length - 1] ?? null;
  return {
    unreadInbound: items.filter((i) => i.kind === 'inbound' && !i.held && !i.isRead).length,
    awaitingReply: last === null || last.kind !== 'outbound',
    lastAt: last?.at ?? null,
  };
}
```

- [ ] **Step 6: Run the data tests**

Run: `npx vitest run src/admin/data` — Expected: PASS (all three files).

- [ ] **Step 7: Create the client mock for page tests**

`src/test/mockSupabase.js`:
```js
import { vi } from 'vitest';

/**
 * A thenable query builder: every method returns itself, `await` resolves to the
 * result registered for that table. Pages under test never see a real client.
 *
 *   const client = createMockClient({ tables: { submissions: { data: [...], error: null } } });
 *   client.from('submissions').select().eq('id', 1)  →  resolves to that result
 */
const METHODS = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'is', 'gte', 'lte', 'gt', 'lt', 'ilike', 'or', 'order', 'limit', 'range', 'single', 'maybeSingle'];

function builder(result) {
  const b = {};
  for (const m of METHODS) b[m] = vi.fn(() => b);
  b.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return b;
}

export function createMockClient({ tables = {}, rpc = {}, auth = {}, storage = {} } = {}) {
  const channel = {
    on: vi.fn(() => channel),
    subscribe: vi.fn(() => channel),
    unsubscribe: vi.fn(),
  };
  const client = {
    from: vi.fn((table) => builder(tables[table] ?? { data: [], error: null, count: 0 })),
    rpc: vi.fn((name) => Promise.resolve(rpc[name] ?? { data: null, error: null })),
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: auth.user ?? { id: 'user-1', email: 'karisa@example.com' } }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: auth.session ?? { access_token: 'token', user: { id: 'user-1' } } }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    storage: { from: vi.fn(() => ({ createSignedUrl: vi.fn(() => Promise.resolve(storage.signed ?? { data: { signedUrl: 'https://signed.example/x' }, error: null })) })) },
    _channel: channel,
  };
  return client;
}
```

- [ ] **Step 8: Commit**

```bash
git add src/admin/data src/test/mockSupabase.js
git commit -m "feat(admin): pure data layer — URL filters, decorated rows, one chronological thread"
```

---

### Task 5: Submissions list — URL-driven filters, live updates, stacked rows, bulk bar

Fixes F8, F9, F10 (list half), F15. The "Manage labels" button leaves this page; it returns on Settings in Task 10 (labels are still applied from the detail page in Task 6).

**Files:**
- Modify: `src/admin/pages/SubmissionsPage.jsx` (rewrite)
- Modify: `src/admin/components/BulkActionsBar.tsx` → rename to `BulkActionsBar.jsx` (rewrite)
- Test: `src/admin/pages/SubmissionsPage.test.jsx`

**Interfaces:**
- Consumes: `PageHead`, `StateMark`, `TableSkeleton`, `Icon` (Task 1); `parseFilters`, `serializeFilters`, `applyFilters`, `decorateRow`, `SUBMISSIONS_SELECT`, `DEFAULT_FILTERS` (Task 4); `formatRelative`.
- Produces: `BulkActionsBar({ count, labels, onStatus(status), onArchive(), onDelete(), onLabel(labelId), onClear() })`.
- Produces: rows link to `/admin/submissions/${id}` (Task 6 registers the route).

- [ ] **Step 1: Write the failing test**

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import SubmissionsPage from './SubmissionsPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const rows = [
  { id: '1', name: 'Amina Yusuf', email: 'amina@example.com', subject: 'Website for a clinic', status: 'new', priority: 'normal', archived: false, created_at: '2026-09-15T10:00:00Z', submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [] },
  { id: '2', name: 'Brian Otieno', email: 'brian@example.com', subject: 'Property listings', status: 'responded', priority: 'high', archived: false, created_at: '2026-09-14T10:00:00Z', submission_replies: [{ count: 1 }], inbound_replies: [{ id: 'i1', is_read: false, received_at: '2026-09-16T10:00:00Z', status: 'processed' }], submission_labels: [] },
  { id: '3', name: 'Closed One', email: 'c@example.com', subject: 'Old', status: 'closed', priority: 'low', archived: true, created_at: '2026-09-01T10:00:00Z', submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [] },
];

const renderPage = (search = '') => {
  const client = createMockClient({ tables: { submissions: { data: rows, error: null }, labels: { data: [], error: null } } });
  render(
    <MemoryRouter initialEntries={[`/admin/submissions${search}`]}>
      <Routes><Route path="/admin/submissions" element={<SubmissionsPage client={client} />} /></Routes>
    </MemoryRouter>
  );
  return client;
};

describe('SubmissionsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists active submissions newest first with state marks and links', async () => {
    renderPage();
    const table = await screen.findByRole('table');
    const links = within(table).getAllByRole('link', { name: /amina|brian/i });
    expect(links[0]).toHaveAttribute('href', '/admin/submissions/1');
    expect(within(table).queryByText('Closed One')).toBeNull();
    expect(within(table).getAllByText('Awaiting you').length).toBe(2);
  });

  it('reads filters from the URL', async () => {
    renderPage('?status=responded');
    const table = await screen.findByRole('table');
    expect(within(table).queryByText('Amina Yusuf')).toBeNull();
    expect(within(table).getByText('Brian Otieno')).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toHaveValue('responded');
  });

  it('offers to clear filters when nothing matches', async () => {
    renderPage('?q=zzz');
    expect(await screen.findByText(/no submissions match/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(await screen.findByText('Amina Yusuf')).toBeInTheDocument();
  });

  it('subscribes to live changes and polls as a fallback', async () => {
    const client = renderPage();
    await screen.findByRole('table');
    expect(client.channel).toHaveBeenCalledWith('admin-submissions');
    expect(client._channel.subscribe).toHaveBeenCalled();
  });

  it('asks before a bulk delete', async () => {
    const client = renderPage();
    const table = await screen.findByRole('table');
    await userEvent.click(within(table).getAllByRole('checkbox', { name: /select/i })[0]);
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(client.from).not.toHaveBeenCalledWith('submissions_deleted_sentinel');
    expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/admin/pages/SubmissionsPage.test.jsx` — Expected: FAIL (the old page renders "View" buttons, no links; `createMockClient` channel is never called).

- [ ] **Step 3: Rewrite `BulkActionsBar.jsx`** (delete the `.tsx`)

```jsx
import React, { useState } from 'react';
import Icon from './Icon';

/** Fixed to the bottom while a selection exists. Destructive actions confirm inline. */
export default function BulkActionsBar({ count, labels = [], onStatus, onArchive, onDelete, onLabel, onClear }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div role="region" aria-label="Bulk actions" className="fixed inset-x-0 bottom-0 z-20 border-t border-mark-900 bg-cloth-50">
      <div className="mx-auto flex max-w-sheet flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <p className="tabular mr-auto text-sm font-medium">{count} selected</p>

        <label className="sr-only" htmlFor="bulk-status">Set status</label>
        <select id="bulk-status" defaultValue="" onChange={(e) => { if (e.target.value) { onStatus(e.target.value); e.target.value = ''; } }} className="field-sm w-auto">
          <option value="" disabled>Set status…</option>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
        </select>

        {labels.length > 0 && (
          <>
            <label className="sr-only" htmlFor="bulk-label">Add label</label>
            <select id="bulk-label" defaultValue="" onChange={(e) => { if (e.target.value) { onLabel(e.target.value); e.target.value = ''; } }} className="field-sm w-auto">
              <option value="" disabled>Add label…</option>
              {labels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </>
        )}

        <button type="button" onClick={onArchive} className="btn-quiet"><Icon name="archive" className="h-4 w-4" />Archive</button>

        {confirming ? (
          <>
            <button type="button" onClick={() => { setConfirming(false); onDelete(); }} className="btn-alarm">Confirm delete {count}</button>
            <button type="button" onClick={() => setConfirming(false)} className="btn-quiet">Keep</button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="btn-alarm"><Icon name="trash" className="h-4 w-4" />Delete</button>
        )}

        <button type="button" onClick={onClear} className="btn-quiet" aria-label="Clear selection"><Icon name="close" className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rewrite `SubmissionsPage.jsx`**

```jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageHead from '../components/PageHead';
import StateMark from '../components/StateMark';
import Icon from '../components/Icon';
import { TableSkeleton } from '../components/Skeleton';
import BulkActionsBar from '../components/BulkActionsBar';
import { parseFilters, serializeFilters, applyFilters, decorateRow, SUBMISSIONS_SELECT, DEFAULT_FILTERS } from '../data/submissionsQuery';
import { formatRelative } from '../data/format';

const POLL_MS = 60000;

export const SubmissionsPage = ({ client }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [rows, setRows] = useState(null);           // null = loading
  const [labels, setLabels] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [loadError, setLoadError] = useState(null);

  const setFilters = (next) => setSearchParams(serializeFilters({ ...filters, ...next }), { replace: true });

  const fetchRows = useCallback(async () => {
    if (!client) return;
    const { data, error } = await client.from('submissions').select(SUBMISSIONS_SELECT).order('created_at', { ascending: false });
    if (error) { setLoadError(error.message); return; }
    setLoadError(null);
    setRows((data ?? []).map(decorateRow));
  }, [client]);

  useEffect(() => {
    if (!client) return undefined;
    fetchRows();
    client.from('labels').select('id, name, color').order('name').then(({ data }) => setLabels(data ?? []));
    const channel = client
      .channel('admin-submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, fetchRows)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_replies' }, fetchRows)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submission_replies' }, fetchRows)
      .subscribe();
    const poll = setInterval(fetchRows, POLL_MS);
    return () => { clearInterval(poll); client.removeChannel(channel); };
  }, [client, fetchRows]);

  const visible = useMemo(() => (rows ? applyFilters(rows, filters) : []), [rows, filters]);
  const awaitingCount = useMemo(() => (rows ?? []).filter((r) => !r.archived && r.awaiting).length, [rows]);
  const isFiltered = serializeFilters(filters).toString() !== '';

  const toggle = (id, on) => setSelected((prev) => { const n = new Set(prev); on ? n.add(id) : n.delete(id); return n; });
  const toggleAll = (on) => setSelected(on ? new Set(visible.map((r) => r.id)) : new Set());

  const bulk = async (label, fn) => {
    const ids = Array.from(selected);
    const { error } = await fn(ids);
    if (error) { toast.error(`${label} failed: ${error.message}`); return; }
    toast.success(`${label} ${ids.length} submission${ids.length === 1 ? '' : 's'}`);
    setSelected(new Set());
    fetchRows();
  };

  const bulkActions = {
    onStatus: (status) => bulk('Updated', (ids) => client.from('submissions').update({ status }).in('id', ids)),
    onArchive: () => bulk('Archived', (ids) => client.from('submissions').update({ archived: true, archived_at: new Date().toISOString() }).in('id', ids)),
    onDelete: () => bulk('Deleted', (ids) => client.from('submissions').delete().in('id', ids)),
    onLabel: (labelId) => bulk('Labelled', (ids) => client.from('submission_labels').upsert(ids.map((id) => ({ submission_id: id, label_id: labelId })), { onConflict: 'submission_id,label_id' })),
    onClear: () => setSelected(new Set()),
  };

  const labelById = useMemo(() => Object.fromEntries(labels.map((l) => [l.id, l])), [labels]);

  return (
    <div className="pb-24">
      <PageHead
        title="Submissions"
        meta={rows ? `${visible.length} shown · ${awaitingCount} awaiting you` : null}
        actions={<button type="button" onClick={fetchRows} className="btn-quiet"><Icon name="refresh" className="h-4 w-4" />Refresh</button>}
      />

      <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="q" className="field-label">Search</label>
          <input id="q" type="search" value={filters.q} onChange={(e) => setFilters({ q: e.target.value })} placeholder="Name, email or subject" className="field-sm" />
        </div>
        <div>
          <label htmlFor="status" className="field-label">Status</label>
          <select id="status" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })} className="field-sm">
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label htmlFor="box" className="field-label">Box</label>
          <select id="box" value={filters.box} onChange={(e) => setFilters({ box: e.target.value })} className="field-sm">
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="field-label">Order</label>
          <select id="sort" value={filters.sort} onChange={(e) => setFilters({ sort: e.target.value })} className="field-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm text-mark-700">
          <input type="checkbox" checked={filters.waiting} onChange={(e) => setFilters({ waiting: e.target.checked })} className="h-4 w-4 accent-pindo" />
          Awaiting me only
        </label>
      </form>

      {loadError && <p role="alert" className="mb-4 border border-alarm px-4 py-3 text-sm text-alarm">Could not load submissions: {loadError}. <button type="button" onClick={fetchRows} className="link">Try again</button></p>}

      {rows === null ? (
        <TableSkeleton rows={6} cols={5} />
      ) : visible.length === 0 ? (
        <div className="adm-card px-6 py-12 text-center">
          <p className="text-mark-700">{isFiltered ? 'No submissions match these filters.' : 'No submissions yet. The contact form on the site lands here.'}</p>
          {isFiltered && <button type="button" onClick={() => setSearchParams(serializeFilters(DEFAULT_FILTERS), { replace: true })} className="btn-quiet mt-4">Clear filters</button>}
        </div>
      ) : (
        <>
          {/* Stacked rows below md — tabular content is never a horizontal scroller. */}
          <ul className="divide-y divide-cloth-300 border-t border-cloth-300 md:hidden">
            {visible.map((r) => (
              <li key={r.id} className="flex gap-3 py-3">
                <input type="checkbox" aria-label={`Select ${r.name}`} checked={selected.has(r.id)} onChange={(e) => toggle(r.id, e.target.checked)} className="mt-1 h-4 w-4 accent-pindo" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link to={`/admin/submissions/${r.id}`} className="truncate font-medium text-mark-900 hover:text-pindo">{r.name}</Link>
                    <time dateTime={r.created_at} className="shrink-0 text-xs text-mark-500">{formatRelative(r.created_at)}</time>
                  </div>
                  <p className="truncate text-sm text-mark-700">{r.subject}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <StateMark state={r.status} />
                    {r.awaiting && <StateMark state="waiting" />}
                    {r.inboundUnread > 0 && <span className="tabular text-xs text-mark-600">{r.inboundUnread} unread</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <table className="adm-table">
              <caption className="sr-only">Contact submissions</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-8"><input type="checkbox" aria-label="Select all shown" checked={selected.size > 0 && selected.size === visible.length} onChange={(e) => toggleAll(e.target.checked)} className="h-4 w-4 accent-pindo" /></th>
                  <th scope="col">From</th>
                  <th scope="col">Subject</th>
                  <th scope="col">State</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Labels</th>
                  <th scope="col" className="text-right">Replies</th>
                  <th scope="col">Received</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr key={r.id}>
                    <td><input type="checkbox" aria-label={`Select ${r.name}`} checked={selected.has(r.id)} onChange={(e) => toggle(r.id, e.target.checked)} className="h-4 w-4 accent-pindo" /></td>
                    <td>
                      <Link to={`/admin/submissions/${r.id}`} className="font-medium text-mark-900 hover:text-pindo">{r.name}</Link>
                      <p className="text-xs text-mark-500">{r.email}</p>
                    </td>
                    <td className="max-w-xs"><p className="truncate" title={r.subject}>{r.subject}</p></td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <StateMark state={r.status} />
                        {r.awaiting && <StateMark state="waiting" />}
                      </div>
                    </td>
                    <td className="capitalize text-mark-700">{r.priority || 'normal'}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {r.labelIds.slice(0, 2).map((id) => labelById[id] && (
                          <span key={id} className="adm-chip"><span className="h-2 w-2" style={{ background: labelById[id].color }} aria-hidden="true" />{labelById[id].name}</span>
                        ))}
                        {r.labelIds.length > 2 && <span className="text-xs text-mark-500">+{r.labelIds.length - 2}</span>}
                      </div>
                    </td>
                    <td className="text-right">
                      {r.replyCount}
                      {r.inboundUnread > 0 && <span className="ml-2 text-xs text-pindo">{r.inboundUnread} unread</span>}
                    </td>
                    <td><time dateTime={r.created_at} className="text-mark-700">{formatRelative(r.created_at)}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selected.size > 0 && <BulkActionsBar count={selected.size} labels={labels} {...bulkActions} />}
    </div>
  );
};

export default SubmissionsPage;
```
Note: the label chip's inline `style={{ background: label.color }}` is user data from the `labels` table, not a design token, and is the one permitted inline colour.

- [ ] **Step 5: Run the test, lint, build**

Run: `npx vitest run src/admin/pages/SubmissionsPage.test.jsx` — Expected: PASS (5).
Run: `npm run lint && npm run build 2>&1 | tail -3` — Expected: clean.

- [ ] **Step 6: Commit**

```bash
git rm src/admin/components/BulkActionsBar.tsx
git add src/admin/pages/SubmissionsPage.jsx src/admin/pages/SubmissionsPage.test.jsx src/admin/components/BulkActionsBar.jsx
git commit -m "feat(admin): submissions list — filters in the URL, live updates, stacked rows, confirmed bulk delete"
```

---

### Task 6: Submission detail route — one thread, inline composer, delivery state, read-marking

Fixes F2 (client side), F4, F5, F6, F7 (render side), F10, F11. Replaces the modal stack with a page at `/admin/submissions/:id`.

**Files:**
- Create: `src/admin/pages/SubmissionDetailPage.jsx`, `src/admin/components/ConversationThread.jsx`, `src/admin/components/ReplyComposer.jsx`
- Modify: `src/App.jsx` (add the `:id` route inside the layout route), `src/admin/components/AttachmentPreview.tsx` (restyle only), `src/hooks/useInboundEmails.ts` (delete the `useInboundEmails` function; keep the exported helpers)
- Delete: `SubmissionDetailPanel.jsx`, `ConversationTimeline.jsx`, `InboundEmailCard.tsx`, `ReplyModal.jsx`, `SpamQuarantineView.tsx`, `InboundRepliesFilter.tsx`
- Test: `src/admin/components/ConversationThread.test.jsx`, `src/admin/pages/SubmissionDetailPage.test.jsx`

**Interfaces:**
- Consumes: `buildThread`, `threadSummary` (Task 4); `StateMark`, `ThreadSkeleton`, `PageHead`, `Icon`; `sanitizeEmailHTML`, `extractTextFromHTML` from `@/utils/emailSanitizer`; `markEmailAsRead`, `toggleEmailImportant` from `@/hooks/useInboundEmails`; `replyFormSchema` from `../../utils/validationSchemas`; `QUICK_REPLY_TEMPLATES`, `interpolateTemplate` from `../../utils/replyTemplates`; `AttachmentPreview` (props unchanged: `attachment, client, userId`).
- Produces: `ConversationThread({ items: ThreadItem[], client, userId })`.
- Produces: `ReplyComposer({ submission, client, onSent() })` — POSTs `{ submission_id, reply_type, reply_message }` to `${VITE_SUPABASE_URL}/functions/v1/send-reply` with the session bearer token. No token is ever logged.

- [ ] **Step 1: Write the failing tests**

`src/admin/components/ConversationThread.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMockClient } from '../../test/mockSupabase';
import ConversationThread from './ConversationThread';

const items = [
  { kind: 'original', id: 's1', at: '2026-09-10T10:00:00Z', body: 'Hello there', name: 'Amina', email: 'amina@example.com' },
  { kind: 'outbound', id: 'r1', at: '2026-09-10T12:00:00Z', body: 'Thanks Amina', replyType: 'manual', emailStatus: 'delivered', resendId: 're1', source: 'dashboard' },
  { kind: 'inbound', id: 'i1', at: '2026-09-11T09:00:00Z', subject: 'Re: Thanks', bodyText: 'Great, when can we start?', bodyHtml: null, fromName: 'Amina', fromEmail: 'amina@example.com', isRead: false, isImportant: false, held: false, heldReason: null, senderVerified: true, spamScore: 0.2, attachments: [] },
  { kind: 'inbound', id: 'i2', at: '2026-09-11T10:00:00Z', subject: 'WIN', bodyText: 'lottery', bodyHtml: '<p>lottery <script>x()</script></p>', fromName: null, fromEmail: 'x@spam.io', isRead: false, isImportant: false, held: true, heldReason: 'keywords', senderVerified: false, spamScore: 8, attachments: [] },
  { kind: 'outbound', id: 'r2', at: '2026-09-12T12:00:00Z', body: 'From my phone', replyType: 'manual', emailStatus: 'bounced', resendId: 're2', source: 'email_relay' },
];

describe('ConversationThread', () => {
  it('renders every item in order with who said it and its delivery state', () => {
    render(<ConversationThread items={items} client={createMockClient()} userId="u1" />);
    const entries = screen.getAllByRole('article');
    expect(entries).toHaveLength(5);
    expect(entries[0]).toHaveTextContent('Amina');
    expect(entries[1]).toHaveTextContent('You');
    expect(entries[1]).toHaveTextContent('Delivered');
    expect(entries[4]).toHaveTextContent('via Gmail');
    expect(entries[4]).toHaveTextContent('Bounced');
  });

  it('collapses held mail behind its reason and never injects script', () => {
    render(<ConversationThread items={items} client={createMockClient()} userId="u1" />);
    const held = screen.getAllByRole('article')[3];
    expect(held).toHaveTextContent(/held/i);
    expect(held).toHaveTextContent(/keywords/i);
    expect(held.querySelector('script')).toBeNull();
    expect(screen.queryByText('lottery')).toBeNull();   // collapsed until opened
  });
});
```

`src/admin/pages/SubmissionDetailPage.test.jsx`:
```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import SubmissionDetailPage from './SubmissionDetailPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const submission = { id: 's1', name: 'Amina', email: 'amina@example.com', phone: null, subject: 'Clinic site', message: 'Hello there', status: 'new', priority: 'normal', notes: '', archived: false, responded_at: null, created_at: '2026-09-10T10:00:00Z' };
const inbound = [{ id: 'i1', submission_id: 's1', from_email: 'amina@example.com', from_name: 'Amina', subject: 'Re', body_text: 'Great', body_html: null, received_at: '2026-09-11T09:00:00Z', is_read: false, is_important: false, status: 'processed', spam_score: 0, spam_reasons: null, sender_verified: true, inbound_attachments: [] }];

const renderPage = (tables = {}) => {
  const client = createMockClient({
    tables: {
      submissions: { data: submission, error: null },
      submission_replies: { data: [], error: null },
      inbound_replies: { data: inbound, error: null },
      labels: { data: [], error: null },
      submission_labels: { data: [], error: null },
      ...tables,
    },
  });
  render(
    <MemoryRouter initialEntries={['/admin/submissions/s1']}>
      <Routes><Route path="/admin/submissions/:id" element={<SubmissionDetailPage client={client} />} /></Routes>
    </MemoryRouter>
  );
  return client;
};

describe('SubmissionDetailPage', () => {
  beforeEach(() => { vi.clearAllMocks(); global.fetch = vi.fn(); });

  it('loads the thread by route id and marks unread inbound as read', async () => {
    const client = renderPage();
    expect(await screen.findByRole('heading', { name: 'Clinic site' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
    await waitFor(() => expect(client.rpc).toHaveBeenCalledWith('mark_inbound_reply_read', { p_reply_id: 'i1', p_user_id: 'user-1' }));
  });

  it('sends a reply through send-reply with the session token, never logging it', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    renderPage();
    await screen.findByRole('heading', { name: 'Clinic site' });
    await userEvent.type(screen.getByLabelText(/your reply/i), 'Happy to help — can we talk on Thursday?');
    await userEvent.click(screen.getByRole('button', { name: /send reply/i }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toMatch(/\/functions\/v1\/send-reply$/);
    expect(init.headers.Authorization).toBe('Bearer token');
    expect(JSON.parse(init.body)).toMatchObject({ submission_id: 's1', reply_type: 'manual' });
    expect(log.mock.calls.flat().join(' ')).not.toMatch(/token/i);
    log.mockRestore();
  });

  it('shows a not-found state for an unknown id', async () => {
    renderPage({ submissions: { data: null, error: { message: 'Row not found', code: 'PGRST116' } } });
    expect(await screen.findByText(/no submission with that id/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to submissions/i })).toHaveAttribute('href', '/admin/submissions');
  });
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `npx vitest run src/admin/components/ConversationThread.test.jsx src/admin/pages/SubmissionDetailPage.test.jsx` — Expected: both FAIL to resolve imports.

- [ ] **Step 3: Create `ConversationThread.jsx`**

```jsx
import React, { useState } from 'react';
import StateMark from './StateMark';
import Icon from './Icon';
import AttachmentPreview from './AttachmentPreview';
import { formatDateTime } from '../data/format';
import { sanitizeEmailHTML } from '@/utils/emailSanitizer';
import { toggleEmailImportant } from '@/hooks/useInboundEmails';

function Entry({ who, at, mark, children, tone = 'field' }) {
  const ground = tone === 'raised' ? 'bg-cloth-50' : tone === 'recessed' ? 'bg-cloth-200' : 'bg-cloth-100';
  return (
    <article className={`border border-cloth-300 ${ground}`}>
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-cloth-300 px-4 py-2">
        <p className="text-sm font-semibold text-mark-900">{who}</p>
        <div className="flex flex-wrap items-center gap-3">
          {mark}
          <time dateTime={at} className="text-xs text-mark-500">{formatDateTime(at)}</time>
        </div>
      </header>
      <div className="px-4 py-3 text-[0.9375rem] leading-relaxed text-mark-900">{children}</div>
    </article>
  );
}

function InboundEntry({ item, client }) {
  const [open, setOpen] = useState(!item.held);
  const [important, setImportant] = useState(item.isImportant);
  const who = item.fromName ? `${item.fromName} <${item.fromEmail}>` : item.fromEmail;

  const flag = async () => {
    const next = !important;
    setImportant(next);
    const res = await toggleEmailImportant(item.id, next, client);
    if (!res.success) setImportant(!next);
  };

  return (
    <Entry
      who={who}
      at={item.at}
      tone={item.held ? 'recessed' : 'field'}
      mark={
        <>
          {item.held && <StateMark state="held">Held · {item.heldReason}</StateMark>}
          {!item.senderVerified && !item.held && <StateMark state="held">Sender differs</StateMark>}
          {!item.isRead && !item.held && <span className="text-xs font-medium text-pindo">Unread</span>}
          <button type="button" onClick={flag} aria-pressed={important} className="btn-quiet px-2 py-1 text-xs">{important ? 'Flagged' : 'Flag'}</button>
        </>
      }
    >
      {item.held && !open ? (
        <button type="button" onClick={() => setOpen(true)} className="link text-sm">Show held message</button>
      ) : (
        <>
          {item.subject && <p className="mb-2 text-sm text-mark-600">{item.subject}</p>}
          {item.bodyHtml ? (
            <div className="prose-email" dangerouslySetInnerHTML={{ __html: sanitizeEmailHTML(item.bodyHtml) }} />
          ) : (
            <p className="whitespace-pre-wrap">{item.bodyText}</p>
          )}
          {item.attachments.length > 0 && (
            <ul className="mt-3 space-y-2 border-t border-cloth-300 pt-3">
              {item.attachments.map((a) => <li key={a.id}><AttachmentPreview attachment={a} client={client} /></li>)}
            </ul>
          )}
        </>
      )}
    </Entry>
  );
}

/** One conversation, in time order: the original, everything Karisa sent, everything that came back. */
export default function ConversationThread({ items, client }) {
  return (
    <ol className="space-y-3" aria-label="Conversation">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`}>
          {item.kind === 'original' && (
            <Entry who={`${item.name} <${item.email}>`} at={item.at} mark={<span className="text-xs text-mark-500">Original enquiry</span>}>
              <p className="whitespace-pre-wrap">{item.body}</p>
            </Entry>
          )}
          {item.kind === 'outbound' && (
            <Entry who="You" at={item.at} tone="raised" mark={
              <>
                {item.source === 'email_relay' && <span className="text-xs text-mark-500">via Gmail</span>}
                <StateMark state={item.emailStatus} />
              </>
            }>
              <p className="whitespace-pre-wrap">{item.body}</p>
            </Entry>
          )}
          {item.kind === 'inbound' && <InboundEntry item={item} client={client} />}
        </li>
      ))}
    </ol>
  );
}
```
Add to `src/index.css` inside `@layer components` (email HTML arrives with its own inline styles; this only sets the type it inherits):
```css
  .prose-email { @apply text-[0.9375rem] leading-relaxed text-mark-900; }
  .prose-email a { @apply link; }
  .prose-email blockquote { @apply my-2 border-l-2 border-cloth-400 pl-3 text-mark-600; }
  .prose-email img { @apply max-w-full; }
```

- [ ] **Step 4: Create `ReplyComposer.jsx`**

```jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Icon from './Icon';
import { replyFormSchema } from '../../utils/validationSchemas';
import { QUICK_REPLY_TEMPLATES, interpolateTemplate } from '../../utils/replyTemplates';

const MAX = 5000;

/** Inline under the thread. Calls the send-reply edge function; the session token is used and never printed. */
export default function ReplyComposer({ submission, client, onSent }) {
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(replyFormSchema),
    defaultValues: { submission_id: submission.id, reply_type: 'manual', reply_message: '' },
  });
  const message = watch('reply_message', '');

  const applyTemplate = (e) => {
    const id = e.target.value;
    if (!id) return;
    const template = Object.values(QUICK_REPLY_TEMPLATES).flat().find((t) => t.id === id);
    if (!template) return;
    setValue('reply_message', interpolateTemplate(template.content, { name: submission.name, subject: submission.subject }), { shouldValidate: true });
    setValue('reply_type', 'quick_reply');
    e.target.value = '';
  };

  const onSubmit = async (data) => {
    setSending(true);
    try {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (sessionError || !token) throw new Error('Your session has expired. Sign in again.');
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Send failed (HTTP ${res.status})`);
      }
      toast.success(`Reply sent to ${submission.email}`);
      reset({ submission_id: submission.id, reply_type: 'manual', reply_message: '' });
      onSent();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reply failed. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="adm-card p-4" aria-label="Reply">
      <input type="hidden" {...register('submission_id')} />
      <input type="hidden" {...register('reply_type')} />
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <label htmlFor="reply_message" className="field-label mb-0">Your reply</label>
        <div className="flex items-center gap-3">
          <label htmlFor="template" className="sr-only">Start from a template</label>
          <select id="template" defaultValue="" onChange={applyTemplate} className="field-sm w-auto">
            <option value="">Start from a template…</option>
            {Object.entries(QUICK_REPLY_TEMPLATES).map(([category, list]) => (
              <optgroup key={category} label={category}>
                {list.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </optgroup>
            ))}
          </select>
          <span className={`tabular text-xs ${message.length > MAX - 100 ? 'text-alarm' : 'text-mark-500'}`}>{message.length}/{MAX}</span>
        </div>
      </div>
      <textarea
        id="reply_message"
        rows={6}
        {...register('reply_message')}
        aria-invalid={errors.reply_message ? 'true' : undefined}
        aria-describedby={errors.reply_message ? 'reply-error' : undefined}
        className="field text-[0.9375rem]"
        placeholder={`Reply to ${submission.name}…`}
      />
      {errors.reply_message && <p id="reply-error" className="mt-2 text-sm text-alarm">{errors.reply_message.message}</p>}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-mark-500">Sent from karisa@voyani.tech. Their reply lands back in this thread.</p>
        <button type="submit" disabled={sending} className="btn-pindo px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:bg-cloth-400">
          <Icon name="send" className="h-4 w-4" />{sending ? 'Sending…' : 'Send reply'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 5: Create `SubmissionDetailPage.jsx`**

```jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageHead from '../components/PageHead';
import StateMark from '../components/StateMark';
import Icon from '../components/Icon';
import { ThreadSkeleton } from '../components/Skeleton';
import ConversationThread from '../components/ConversationThread';
import ReplyComposer from '../components/ReplyComposer';
import { buildThread, threadSummary } from '../data/thread';
import { formatDateTime } from '../data/format';
import { markEmailAsRead } from '@/hooks/useInboundEmails';

const STATUSES = [['new', 'New'], ['in_progress', 'In progress'], ['responded', 'Responded'], ['closed', 'Closed']];
const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export default function SubmissionDetailPage({ client }) {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [replies, setReplies] = useState([]);
  const [inbound, setInbound] = useState([]);
  const [labels, setLabels] = useState([]);
  const [labelIds, setLabelIds] = useState([]);
  const [userId, setUserId] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | missing | error
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    if (!client || !id) return;
    const [s, r, i, l, sl] = await Promise.all([
      client.from('submissions').select('*').eq('id', id).single(),
      client.from('submission_replies').select('*').eq('submission_id', id).order('created_at'),
      client.from('inbound_replies').select('*, inbound_attachments(*)').eq('submission_id', id).order('received_at'),
      client.from('labels').select('id, name, color').order('name'),
      client.from('submission_labels').select('label_id').eq('submission_id', id),
    ]);
    if (s.error || !s.data) { setState(s.error?.code === 'PGRST116' || !s.data ? 'missing' : 'error'); return; }
    setSubmission(s.data);
    setNotes(s.data.notes ?? '');
    setReplies(r.data ?? []);
    setInbound(i.data ?? []);
    setLabels(l.data ?? []);
    setLabelIds((sl.data ?? []).map((x) => x.label_id));
    setState('ready');
  }, [client, id]);

  useEffect(() => {
    if (!client) return undefined;
    client.auth.getUser().then(({ data }) => setUserId(data?.user?.id ?? null));
    load();
    const channel = client
      .channel(`admin-submission-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submission_replies', filter: `submission_id=eq.${id}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_replies', filter: `submission_id=eq.${id}` }, load)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'submissions', filter: `id=eq.${id}` }, load)
      .subscribe();
    return () => client.removeChannel(channel);
  }, [client, id, load]);

  // Opening the thread is reading it.
  useEffect(() => {
    if (!userId || state !== 'ready') return;
    inbound.filter((m) => !m.is_read && !['spam', 'quarantined', 'failed'].includes(m.status))
      .forEach((m) => markEmailAsRead(m.id, userId, client));
  }, [inbound, userId, state, client]);

  const items = useMemo(() => (submission ? buildThread(submission, replies, inbound) : []), [submission, replies, inbound]);
  const summary = useMemo(() => threadSummary(items), [items]);

  const patch = async (fields, okMessage) => {
    const { error } = await client.from('submissions').update(fields).eq('id', id);
    if (error) { toast.error(`Could not save: ${error.message}`); return; }
    setSubmission((s) => ({ ...s, ...fields }));
    if (okMessage) toast.success(okMessage);
  };

  const toggleLabel = async (labelId) => {
    const has = labelIds.includes(labelId);
    const q = has
      ? client.from('submission_labels').delete().eq('submission_id', id).eq('label_id', labelId)
      : client.from('submission_labels').insert({ submission_id: id, label_id: labelId });
    const { error } = await q;
    if (error) { toast.error(`Could not update label: ${error.message}`); return; }
    setLabelIds((ids) => (has ? ids.filter((x) => x !== labelId) : [...ids, labelId]));
  };

  if (state === 'missing') {
    return (
      <div>
        <PageHead title="Not found" />
        <p className="text-mark-700">There is no submission with that id. It may have been deleted.</p>
        <Link to="/admin/submissions" className="btn-quiet mt-4"><Icon name="back" className="h-4 w-4" />Back to submissions</Link>
      </div>
    );
  }
  if (state === 'error') {
    return <p role="alert" className="border border-alarm px-4 py-3 text-sm text-alarm">Could not load this submission. <button type="button" onClick={load} className="link">Try again</button></p>;
  }
  if (state === 'loading') {
    return <div className="space-y-6"><div className="adm-skel h-9 w-1/2" /><ThreadSkeleton /></div>;
  }

  return (
    <div>
      <p className="mb-3"><Link to="/admin/submissions" className="link inline-flex items-center gap-1.5 text-sm"><Icon name="back" className="h-4 w-4" />Submissions</Link></p>
      <PageHead
        title={submission.subject}
        meta={<>{submission.name} · <a href={`mailto:${submission.email}`} className="link">{submission.email}</a>{submission.phone ? ` · ${submission.phone}` : ''}</>}
        actions={<>
          <StateMark state={submission.status} />
          {summary.awaitingReply && submission.status !== 'closed' && <StateMark state="waiting" />}
        </>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-label="Conversation" className="min-w-0 space-y-4">
          <ConversationThread items={items} client={client} userId={userId} />
          <ReplyComposer submission={submission} client={client} onSent={load} />
        </section>

        <aside className="space-y-6">
          <div>
            <label htmlFor="status" className="field-label">Status</label>
            <select id="status" value={submission.status} onChange={(e) => patch({ status: e.target.value }, 'Status updated')} className="field-sm">
              {STATUSES.map(([v, w]) => <option key={v} value={v}>{w}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="field-label">Priority</label>
            <select id="priority" value={submission.priority || 'normal'} onChange={(e) => patch({ priority: e.target.value }, 'Priority updated')} className="field-sm capitalize">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {labels.length > 0 && (
            <fieldset>
              <legend className="field-label">Labels</legend>
              <div className="flex flex-wrap gap-2">
                {labels.map((l) => (
                  <button key={l.id} type="button" aria-pressed={labelIds.includes(l.id)} onClick={() => toggleLabel(l.id)} className={`adm-chip ${labelIds.includes(l.id) ? 'border-pindo bg-pindo-wash text-pindo' : ''}`}>
                    <span className="h-2 w-2" style={{ background: l.color }} aria-hidden="true" />{l.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div>
            <label htmlFor="notes" className="field-label">Internal notes</label>
            <textarea id="notes" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (submission.notes ?? '') && patch({ notes }, 'Notes saved')} className="field-sm" placeholder="Only you see these." />
          </div>
          <dl className="space-y-1 border-t border-cloth-300 pt-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-mark-500">Received</dt><dd className="tabular text-right">{formatDateTime(submission.created_at)}</dd></div>
            {submission.responded_at && <div className="flex justify-between gap-3"><dt className="text-mark-500">First reply</dt><dd className="tabular text-right">{formatDateTime(submission.responded_at)}</dd></div>}
            <div className="flex justify-between gap-3"><dt className="text-mark-500">Messages</dt><dd className="tabular">{items.length}</dd></div>
          </dl>
          <div className="border-t border-cloth-300 pt-3">
            {submission.archived
              ? <button type="button" onClick={() => patch({ archived: false, archived_at: null }, 'Restored')} className="btn-quiet w-full">Restore from archive</button>
              : <button type="button" onClick={() => patch({ archived: true, archived_at: new Date().toISOString() }, 'Archived')} className="btn-quiet w-full"><Icon name="archive" className="h-4 w-4" />Archive</button>}
          </div>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Register the route and remove the modal stack**

In `App.jsx`, add after the lazy imports: `const SubmissionDetailPage = lazy(() => import('./admin/pages/SubmissionDetailPage'));` and inside the `/admin` layout route, after the `submissions` route:
```jsx
        <Route path="submissions/:id" element={<Suspense fallback={<SectionLoader />}><SubmissionDetailPage client={supabaseRef.current} /></Suspense>} />
```
In `src/hooks/useInboundEmails.ts` delete the `useInboundEmails` function and its `useEffect`/`useState` imports; keep `markEmailAsRead`, `updateEmailNotes`, `toggleEmailImportant`, `getAttachmentDownloadUrl`, `logAttachmentDownload`.
```bash
git rm src/admin/components/SubmissionDetailPanel.jsx src/admin/components/ConversationTimeline.jsx src/admin/components/InboundEmailCard.tsx src/admin/components/ReplyModal.jsx src/admin/components/SpamQuarantineView.tsx src/admin/components/InboundRepliesFilter.tsx
grep -rn "useInboundEmails(" src   # Expected: no matches
```

- [ ] **Step 7: Restyle `AttachmentPreview.tsx`**

Keep every function; replace class strings only. Rules: container `border border-cloth-300 bg-cloth-50 p-3`; filename `text-sm font-medium text-mark-900`; meta `text-xs text-mark-500`; download button `btn-quiet px-3 py-1 text-xs`; risk/virus warnings `border border-alarm text-alarm` (dangerous) or `text-warn` (caution); remove every `dark:`, `gray-*`, `blue-*`, `red-*`, `rounded-*`, `shadow-*`. Verify: `grep -n "dark:\|gray-\|blue-\|red-\|rounded\|shadow" src/admin/components/AttachmentPreview.tsx` → no matches.

- [ ] **Step 8: Run the tests, lint, build**

Run: `npx vitest run src/admin` — Expected: all admin files PASS.
Run: `npm run lint && npm run build 2>&1 | tail -3` — Expected: clean.

- [ ] **Step 9: Commit**

```bash
git add -A src/admin src/App.jsx src/hooks/useInboundEmails.ts src/index.css
git commit -m "feat(admin): one thread per submission at its own URL — delivery state, held mail, inline composer, read on open"
```

---

### Task 7: Overview (dashboard) — honest figures and an activity feed

Fixes F13 (tiles), and gives Karisa the one screen that answers "what needs me?".

**Files:**
- Create: `src/admin/data/overview.ts`
- Modify: `src/admin/pages/AdminDashboard.jsx` (rewrite)
- Test: `src/admin/data/overview.test.ts`, `src/admin/pages/AdminDashboard.test.jsx`

**Interfaces:**
- Consumes: `decorateRow`, `SUBMISSIONS_SELECT` (Task 4); `StateMark`, `PageHead`, `Skeleton`, `Icon`; `formatRelative`.
- Produces `overview.ts`:
  - `computeOverview(rows: SubmissionRow[], now?: Date): { awaiting: number; unreadInbound: number; newThisWeek: number; respondedThisWeek: number }`
  - `buildActivity(rows: SubmissionRow[], replies: {id, submission_id, created_at, email_status}[], inbound: {id, submission_id, received_at, from_name, from_email, status}[], limit = 10): ActivityItem[]` where `ActivityItem = { id: string; at: string; submissionId: string; who: string; what: 'submitted' | 'replied' | 'you replied'; state?: string }`.

- [ ] **Step 1: Write the failing tests**

`src/admin/data/overview.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { computeOverview, buildActivity } from './overview';
import { decorateRow } from './submissionsQuery';

const now = new Date('2026-09-17T12:00:00Z');
const row = (o: Record<string, unknown>) => decorateRow({ id: 'x', name: 'N', email: 'n@e.com', subject: 's', status: 'new', priority: 'normal', archived: false, created_at: '2026-09-16T10:00:00Z', submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [], ...o } as any);

describe('computeOverview', () => {
  it('counts what needs Karisa and what happened this week', () => {
    const rows = [
      row({ id: '1' }),
      row({ id: '2', status: 'responded', responded_at: '2026-09-15T10:00:00Z', inbound_replies: [{ id: 'i', is_read: false, received_at: '2026-09-16T11:00:00Z', status: 'processed' }] }),
      row({ id: '3', status: 'closed', created_at: '2026-08-01T10:00:00Z' }),
      row({ id: '4', archived: true }),
    ];
    expect(computeOverview(rows, now)).toEqual({ awaiting: 2, unreadInbound: 1, newThisWeek: 2, respondedThisWeek: 1 });
  });
});

describe('buildActivity', () => {
  it('merges submissions, inbound and outbound newest first', () => {
    const rows = [row({ id: '1', name: 'Amina', created_at: '2026-09-10T10:00:00Z' })];
    const replies = [{ id: 'r1', submission_id: '1', created_at: '2026-09-11T10:00:00Z', email_status: 'delivered' }];
    const inbound = [{ id: 'i1', submission_id: '1', received_at: '2026-09-12T10:00:00Z', from_name: 'Amina', from_email: 'a@e.com', status: 'processed' }];
    const feed = buildActivity(rows, replies, inbound, 10);
    expect(feed.map((f) => f.what)).toEqual(['replied', 'you replied', 'submitted']);
    expect(feed[1]).toMatchObject({ state: 'delivered', submissionId: '1' });
  });
});
```

`src/admin/pages/AdminDashboard.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import AdminDashboard from './AdminDashboard';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('AdminDashboard', () => {
  it('shows real figures with no placeholders and links each activity to its thread', async () => {
    const client = createMockClient({ tables: {
      submissions: { data: [{ id: '1', name: 'Amina', email: 'a@e.com', subject: 'Clinic', status: 'new', priority: 'normal', archived: false, created_at: new Date().toISOString(), submission_replies: [{ count: 0 }], inbound_replies: [], submission_labels: [] }], error: null },
      submission_replies: { data: [], error: null },
      inbound_replies: { data: [], error: null },
    } });
    render(<MemoryRouter><AdminDashboard client={client} /></MemoryRouter>);
    expect(await screen.findByText('Awaiting you')).toBeInTheDocument();
    expect(screen.queryByText(/coming soon/i)).toBeNull();
    expect(screen.getByRole('link', { name: /amina/i })).toHaveAttribute('href', '/admin/submissions/1');
  });
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `npx vitest run src/admin/data/overview.test.ts src/admin/pages/AdminDashboard.test.jsx` — Expected: FAIL (module missing; "Coming soon" present).

- [ ] **Step 3: Create `overview.ts`**

```ts
import type { SubmissionRow } from './submissionsQuery';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeOverview(rows: SubmissionRow[], now: Date = new Date()) {
  const weekAgo = new Date(now.getTime() - WEEK_MS).toISOString();
  const active = rows.filter((r) => !r.archived);
  return {
    awaiting: active.filter((r) => r.awaiting).length,
    unreadInbound: active.reduce((n, r) => n + r.inboundUnread, 0),
    newThisWeek: active.filter((r) => r.created_at >= weekAgo).length,
    respondedThisWeek: active.filter((r) => r.responded_at && r.responded_at >= weekAgo).length,
  };
}

export interface ActivityItem { id: string; at: string; submissionId: string; who: string; what: 'submitted' | 'replied' | 'you replied'; state?: string }

export function buildActivity(
  rows: SubmissionRow[],
  replies: Array<{ id: string; submission_id: string; created_at: string; email_status: string | null }>,
  inbound: Array<{ id: string; submission_id: string; received_at: string; from_name: string | null; from_email: string; status: string }>,
  limit = 10
): ActivityItem[] {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const name = (id: string) => byId.get(id)?.name ?? 'Unknown';
  const items: ActivityItem[] = [
    ...rows.map<ActivityItem>((r) => ({ id: `s-${r.id}`, at: r.created_at, submissionId: r.id, who: r.name, what: 'submitted', state: r.status })),
    ...replies.map<ActivityItem>((r) => ({ id: `r-${r.id}`, at: r.created_at, submissionId: r.submission_id, who: name(r.submission_id), what: 'you replied', state: r.email_status ?? 'pending' })),
    ...inbound.filter((i) => !['spam', 'quarantined', 'failed'].includes(i.status))
      .map<ActivityItem>((i) => ({ id: `i-${i.id}`, at: i.received_at, submissionId: i.submission_id, who: i.from_name ?? name(i.submission_id), what: 'replied' })),
  ];
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
```

- [ ] **Step 4: Rewrite `AdminDashboard.jsx`**

```jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHead from '../components/PageHead';
import StateMark from '../components/StateMark';
import { Skeleton } from '../components/Skeleton';
import { decorateRow, SUBMISSIONS_SELECT } from '../data/submissionsQuery';
import { computeOverview, buildActivity } from '../data/overview';
import { formatRelative } from '../data/format';

const Figure = ({ value, label, to }) => {
  const inner = (
    <>
      <p className="adm-figure">{value}</p>
      <p className="mt-2 text-label uppercase tracking-[0.09em] text-mark-500">{label}</p>
    </>
  );
  return to
    ? <Link to={to} className="block bg-cloth-100 px-4 py-4 transition-colors duration-250 ease-press hover:bg-cloth-200 hover:text-pindo">{inner}</Link>
    : <div className="bg-cloth-100 px-4 py-4">{inner}</div>;
};

export default function AdminDashboard({ client }) {
  const [rows, setRows] = useState(null);
  const [replies, setReplies] = useState([]);
  const [inbound, setInbound] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!client) return;
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [s, r, i] = await Promise.all([
      client.from('submissions').select(SUBMISSIONS_SELECT).order('created_at', { ascending: false }),
      client.from('submission_replies').select('id, submission_id, created_at, email_status').gte('created_at', since).order('created_at', { ascending: false }).limit(50),
      client.from('inbound_replies').select('id, submission_id, received_at, from_name, from_email, status').gte('received_at', since).order('received_at', { ascending: false }).limit(50),
    ]);
    if (s.error) { setError(s.error.message); return; }
    setError(null);
    setRows((s.data ?? []).map(decorateRow));
    setReplies(r.data ?? []);
    setInbound(i.data ?? []);
  }, [client]);

  useEffect(() => {
    if (!client) return undefined;
    load();
    const channel = client.channel('admin-overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inbound_replies' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submission_replies' }, load)
      .subscribe();
    return () => client.removeChannel(channel);
  }, [client, load]);

  const overview = useMemo(() => (rows ? computeOverview(rows) : null), [rows]);
  const feed = useMemo(() => (rows ? buildActivity(rows, replies, inbound, 10) : []), [rows, replies, inbound]);

  return (
    <div>
      <PageHead title="Overview" meta={rows ? `${rows.filter((r) => !r.archived).length} active submissions` : null} />

      {error && <p role="alert" className="mb-4 border border-alarm px-4 py-3 text-sm text-alarm">Could not load the overview: {error}. <button type="button" onClick={load} className="link">Try again</button></p>}

      {/* The band: measured facts in one shape, separated by printed rules. */}
      <div className="grid gap-px border-y border-cloth-300 bg-cloth-300 sm:grid-cols-2 lg:grid-cols-4">
        {overview ? (
          <>
            <Figure value={overview.awaiting} label="Awaiting you" to="/admin/submissions?waiting=1" />
            <Figure value={overview.unreadInbound} label="Unread replies" to="/admin/submissions?waiting=1" />
            <Figure value={overview.newThisWeek} label="New this week" to="/admin/submissions" />
            <Figure value={overview.respondedThisWeek} label="Answered this week" to="/admin/submissions?status=responded" />
          </>
        ) : Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-cloth-100 px-4 py-4"><Skeleton className="h-8 w-12" /><Skeleton className="mt-3 h-3 w-24" /></div>)}
      </div>

      <section aria-labelledby="activity-h" className="mt-8">
        <h2 id="activity-h" className="mb-3 text-lg font-semibold">Last 30 days</h2>
        {rows === null ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : feed.length === 0 ? (
          <p className="adm-card px-4 py-8 text-center text-mark-700">Nothing has happened in the last 30 days. New enquiries from the site will appear here.</p>
        ) : (
          <ol className="divide-y divide-cloth-300 border-y border-cloth-300">
            {feed.map((f) => (
              <li key={f.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-sm">
                <time dateTime={f.at} className="tabular w-20 shrink-0 text-xs text-mark-500">{formatRelative(f.at)}</time>
                <Link to={`/admin/submissions/${f.submissionId}`} className="font-medium text-mark-900 hover:text-pindo">{f.who}</Link>
                <span className="text-mark-700">{f.what}</span>
                {f.state && <StateMark state={f.state} className="ml-auto" />}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Run tests, lint, build; commit**

Run: `npx vitest run src/admin` — Expected: PASS. `npm run lint && npm run build 2>&1 | tail -3` — clean.
```bash
git add src/admin/data/overview.ts src/admin/data/overview.test.ts src/admin/pages/AdminDashboard.jsx src/admin/pages/AdminDashboard.test.jsx
git commit -m "feat(admin): overview answers 'what needs me' — sourced figures and a real activity feed"
```

---

### Task 8: Analytics math — previous-period deltas, dense daily buckets, median response, delivery funnel

Fixes A1, A3, A6, A7 at the data layer.

**Files:**
- Create: `src/utils/analyticsMath.ts`
- Modify: `src/utils/analyticsService.ts` (rewrite)
- Test: `src/utils/__tests__/analyticsMath.test.ts`

**Interfaces:**
- Produces `analyticsMath.ts`:
  - `type Range = '7d' | '30d' | '90d' | 'all'`
  - `rangeWindow(range: Range, now?: Date): { start: Date; end: Date; prevStart: Date; prevEnd: Date }` — for `'all'`, `start = new Date(0)` and `prevStart = prevEnd = start`.
  - `countBetween(rows: { created_at: string }[], start: Date, end: Date, key?: string): number`
  - `deltaPct(current: number, previous: number): number | null` — `null` when `previous === 0`.
  - `bucketByDay(rows, start, end, key = 'created_at'): { date: string; count: number }[]` — one entry per UTC day, zero-filled, `date` = `YYYY-MM-DD`; at most 90 buckets (for `'all'`, the last 90 days).
  - `medianResponseMinutes(subs: { created_at: string; responded_at: string | null }[]): number | null`
  - `formatDuration(minutes: number | null): string` — `'—'`, `'42 min'`, `'3.5 h'`, `'2.1 d'`.
  - `deliveryFunnel(replies: { email_status: string | null }[]): { total: number; sent: number; delivered: number; opened: number; bounced: number; failed: number; pending: number }` — `delivered` counts `delivered|opened|clicked`; `opened` counts `opened|clicked`; `sent` counts `sent` + everything delivered.
  - `countBy(rows, key, order: string[]): { key: string; count: number }[]`
  - `toCsv(rows: Record<string, unknown>[], columns: string[]): string` — RFC 4180: quotes any field containing `"`, `,`, `\n` or `\r`; doubles embedded quotes; `\r\n` line endings; UTF-8 BOM prefix.
- Produces `analyticsService.ts`: `interface AnalyticsMetrics { range; window; submissions: { current; previous; delta; byDay; byStatus; byPriority }; inbound: { current; previous; delta }; replies: { current; previous; delta; funnel }; responseMinutes: number | null }` and `class AnalyticsService { constructor(client); getMetrics(range: Range): Promise<AnalyticsMetrics>; exportSubmissionsCsv(range: Range): Promise<string> }`.

- [ ] **Step 1: Write the failing test**

`src/utils/__tests__/analyticsMath.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { rangeWindow, countBetween, deltaPct, bucketByDay, medianResponseMinutes, formatDuration, deliveryFunnel, countBy, toCsv } from '../analyticsMath';

const now = new Date('2026-09-17T12:00:00Z');

describe('rangeWindow', () => {
  it('gives a current window and the equal-length one before it', () => {
    const w = rangeWindow('7d', now);
    expect(w.end).toEqual(now);
    expect(w.start.toISOString()).toBe('2026-09-10T12:00:00.000Z');
    expect(w.prevEnd).toEqual(w.start);
    expect(w.prevStart.toISOString()).toBe('2026-09-03T12:00:00.000Z');
  });
  it('all-time has no previous period', () => {
    const w = rangeWindow('all', now);
    expect(w.start.getTime()).toBe(0);
    expect(w.prevStart).toEqual(w.prevEnd);
  });
});

describe('deltaPct', () => {
  it('is null with no baseline and rounded otherwise', () => {
    expect(deltaPct(5, 0)).toBeNull();
    expect(deltaPct(6, 4)).toBe(50);
    expect(deltaPct(3, 4)).toBe(-25);
  });
});

describe('bucketByDay', () => {
  it('zero-fills every day in the window', () => {
    const rows = [{ created_at: '2026-09-15T01:00:00Z' }, { created_at: '2026-09-15T23:00:00Z' }, { created_at: '2026-09-17T01:00:00Z' }];
    const b = bucketByDay(rows, new Date('2026-09-14T12:00:00Z'), now);
    expect(b).toEqual([
      { date: '2026-09-14', count: 0 }, { date: '2026-09-15', count: 2 }, { date: '2026-09-16', count: 0 }, { date: '2026-09-17', count: 1 },
    ]);
  });
  it('caps all-time at the last 90 days', () => {
    expect(bucketByDay([], new Date(0), now)).toHaveLength(90);
  });
});

describe('medianResponseMinutes / formatDuration', () => {
  it('ignores unanswered rows and resists outliers', () => {
    const subs = [
      { created_at: '2026-09-10T10:00:00Z', responded_at: '2026-09-10T10:30:00Z' },
      { created_at: '2026-09-10T10:00:00Z', responded_at: '2026-09-10T11:00:00Z' },
      { created_at: '2026-09-10T10:00:00Z', responded_at: '2026-09-20T10:00:00Z' },
      { created_at: '2026-09-10T10:00:00Z', responded_at: null },
    ];
    expect(medianResponseMinutes(subs)).toBe(60);
    expect(medianResponseMinutes([])).toBeNull();
    expect(formatDuration(null)).toBe('—');
    expect(formatDuration(42)).toBe('42 min');
    expect(formatDuration(210)).toBe('3.5 h');
    expect(formatDuration(3024)).toBe('2.1 d');
  });
});

describe('deliveryFunnel', () => {
  it('counts each stage cumulatively', () => {
    const f = deliveryFunnel([{ email_status: 'sent' }, { email_status: 'delivered' }, { email_status: 'opened' }, { email_status: 'clicked' }, { email_status: 'bounced' }, { email_status: null }]);
    expect(f).toEqual({ total: 6, sent: 4, delivered: 3, opened: 2, bounced: 1, failed: 0, pending: 1 });
  });
});

describe('countBy', () => {
  it('keeps the given order and includes zeros', () => {
    expect(countBy([{ status: 'new' }, { status: 'new' }, { status: 'closed' }], 'status', ['new', 'in_progress', 'closed']))
      .toEqual([{ key: 'new', count: 2 }, { key: 'in_progress', count: 0 }, { key: 'closed', count: 1 }]);
  });
});

describe('toCsv', () => {
  it('escapes quotes, commas and newlines and starts with a BOM', () => {
    const csv = toCsv([{ name: 'A, "B"', subject: 'line1\nline2', n: 3 }], ['name', 'subject', 'n']);
    expect(csv).toBe('﻿name,subject,n\r\n"A, ""B""","line1\nline2",3');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/utils/__tests__/analyticsMath.test.ts` — Expected: FAIL to resolve `../analyticsMath`.

- [ ] **Step 3: Create `analyticsMath.ts`**

```ts
export type Range = '7d' | '30d' | '90d' | 'all';

const DAY_MS = 86400000;
const DAYS: Record<Exclude<Range, 'all'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

export function rangeWindow(range: Range, now: Date = new Date()) {
  if (range === 'all') {
    const start = new Date(0);
    return { start, end: now, prevStart: start, prevEnd: start };
  }
  const span = DAYS[range] * DAY_MS;
  const start = new Date(now.getTime() - span);
  return { start, end: now, prevStart: new Date(start.getTime() - span), prevEnd: start };
}

export function countBetween<T extends Record<string, unknown>>(rows: T[], start: Date, end: Date, key = 'created_at'): number {
  const s = start.toISOString(); const e = end.toISOString();
  return rows.filter((r) => { const v = r[key] as string; return v >= s && v < e; }).length;
}

export function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function utcDay(d: Date): string { return d.toISOString().slice(0, 10); }

export function bucketByDay<T extends Record<string, unknown>>(rows: T[], start: Date, end: Date, key = 'created_at'): Array<{ date: string; count: number }> {
  const days = Math.min(90, Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY_MS)));
  const first = new Date(end.getTime() - (days - 1) * DAY_MS);
  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) counts.set(utcDay(new Date(first.getTime() + i * DAY_MS)), 0);
  for (const r of rows) {
    const day = String(r[key]).slice(0, 10);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return Array.from(counts, ([date, count]) => ({ date, count }));
}

export function medianResponseMinutes(subs: Array<{ created_at: string; responded_at: string | null }>): number | null {
  const mins = subs.filter((s) => s.responded_at).map((s) => (new Date(s.responded_at as string).getTime() - new Date(s.created_at).getTime()) / 60000).sort((a, b) => a - b);
  if (mins.length === 0) return null;
  const mid = Math.floor(mins.length / 2);
  return mins.length % 2 ? Math.round(mins[mid]) : Math.round((mins[mid - 1] + mins[mid]) / 2);
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 24 * 60) return `${(minutes / 60).toFixed(1).replace(/\.0$/, '')} h`;
  return `${(minutes / (24 * 60)).toFixed(1).replace(/\.0$/, '')} d`;
}

export function deliveryFunnel(replies: Array<{ email_status: string | null }>) {
  const n = (...s: string[]) => replies.filter((r) => s.includes(r.email_status ?? 'pending')).length;
  return {
    total: replies.length,
    sent: n('sent', 'delivered', 'opened', 'clicked'),
    delivered: n('delivered', 'opened', 'clicked'),
    opened: n('opened', 'clicked'),
    bounced: n('bounced'),
    failed: n('failed'),
    pending: n('pending'),
  };
}

export function countBy<T extends Record<string, unknown>>(rows: T[], key: string, order: string[]): Array<{ key: string; count: number }> {
  return order.map((k) => ({ key: k, count: rows.filter((r) => (r[key] ?? 'normal') === k).length }));
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '﻿' + [columns.join(','), ...rows.map((r) => columns.map((c) => cell(r[c])).join(','))].join('\r\n');
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/utils/__tests__/analyticsMath.test.ts` — Expected: PASS.

- [ ] **Step 5: Rewrite `analyticsService.ts`**

```ts
import { type Range, rangeWindow, countBetween, deltaPct, bucketByDay, medianResponseMinutes, deliveryFunnel, countBy, toCsv } from './analyticsMath';

export interface Series { current: number; previous: number; delta: number | null }
export interface AnalyticsMetrics {
  range: Range;
  window: ReturnType<typeof rangeWindow>;
  submissions: Series & { byDay: Array<{ date: string; count: number }>; byStatus: Array<{ key: string; count: number }>; byPriority: Array<{ key: string; count: number }> };
  inbound: Series;
  replies: Series & { funnel: ReturnType<typeof deliveryFunnel> };
  responseMinutes: number | null;
}

const STATUS_ORDER = ['new', 'in_progress', 'responded', 'closed'];
const PRIORITY_ORDER = ['low', 'normal', 'high', 'urgent'];
const CSV_COLUMNS = ['id', 'created_at', 'name', 'email', 'phone', 'subject', 'status', 'priority', 'responded_at', 'archived'];

function series(rows: Record<string, unknown>[], w: ReturnType<typeof rangeWindow>, key: string): Series {
  const current = countBetween(rows, w.start, w.end, key);
  const previous = countBetween(rows, w.prevStart, w.prevEnd, key);
  return { current, previous, delta: deltaPct(current, previous) };
}

export class AnalyticsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private client: any) {}

  async getMetrics(range: Range, now: Date = new Date()): Promise<AnalyticsMetrics> {
    const w = rangeWindow(range, now);
    const since = w.prevStart.toISOString();
    const [s, r, i] = await Promise.all([
      this.client.from('submissions').select('id, status, priority, created_at, responded_at').gte('created_at', since),
      this.client.from('submission_replies').select('id, created_at, email_status').gte('created_at', since),
      this.client.from('inbound_replies').select('id, received_at, status').gte('received_at', since).in('status', ['received', 'processing', 'processed']),
    ]);
    for (const q of [s, r, i]) if (q.error) throw new Error(q.error.message);
    const subs = s.data ?? []; const reps = r.data ?? []; const inb = i.data ?? [];
    const inWindow = subs.filter((x: { created_at: string }) => x.created_at >= w.start.toISOString());
    const repsInWindow = reps.filter((x: { created_at: string }) => x.created_at >= w.start.toISOString());
    return {
      range,
      window: w,
      submissions: { ...series(subs, w, 'created_at'), byDay: bucketByDay(inWindow, w.start, w.end), byStatus: countBy(inWindow, 'status', STATUS_ORDER), byPriority: countBy(inWindow, 'priority', PRIORITY_ORDER) },
      inbound: series(inb, w, 'received_at'),
      replies: { ...series(reps, w, 'created_at'), funnel: deliveryFunnel(repsInWindow) },
      responseMinutes: medianResponseMinutes(inWindow),
    };
  }

  /** Exported columns are deliberate: internal notes and message bodies stay in the CRM. */
  async exportSubmissionsCsv(range: Range, now: Date = new Date()): Promise<string> {
    const w = rangeWindow(range, now);
    const { data, error } = await this.client.from('submissions').select(CSV_COLUMNS.join(', ')).gte('created_at', w.start.toISOString()).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return toCsv(data ?? [], CSV_COLUMNS);
  }
}

export function downloadText(text: string, filename: string, type = 'text/csv;charset=utf-8;'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display = 'none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```
`exportToCSV` and the old `AnalyticsMetrics` shape are gone; `AnalyticsPage.tsx` is the only importer and is rewritten in Task 9. The build will fail between Task 8 and Task 9 — do them back to back, or commit both together.

- [ ] **Step 6: Commit (with Task 9 if the build is red)**

```bash
git add src/utils/analyticsMath.ts src/utils/__tests__/analyticsMath.test.ts src/utils/analyticsService.ts
git commit -m "feat(analytics): real previous-period deltas, zero-filled daily buckets, median response, delivery funnel, RFC-4180 CSV"
```

---

### Task 9: Analytics page — sourced figures, one chart, printed breakdowns

Fixes A1, A2, A4, A5. Load the `dataviz` skill before writing `DailyChart.jsx` (it governs chart form and colour; the palette here is the site's: bars in `pindo`, axis in `cloth-400`, labels in `mark-500`).

**Files:**
- Create: `src/admin/components/DailyChart.jsx`
- Modify: `src/admin/pages/AnalyticsPage.tsx` (rewrite)
- Test: `src/admin/components/DailyChart.test.jsx`, `src/admin/pages/AnalyticsPage.test.tsx`

**Interfaces:**
- Consumes: `AnalyticsService`, `downloadText` (Task 8); `formatDuration`, `Range` from `analyticsMath`; `PageHead`, `Skeleton`, `Icon`, `StateMark`.
- Produces: `DailyChart({ data: { date: string; count: number }[], label: string })` — inline SVG, `role="img"` with an `aria-label` summary, a `<title>`, and a visually hidden `<table>` of the same data.

- [ ] **Step 1: Write the failing tests**

`src/admin/components/DailyChart.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DailyChart from './DailyChart';

describe('DailyChart', () => {
  it('draws one bar per day and describes itself', () => {
    const data = [{ date: '2026-09-15', count: 2 }, { date: '2026-09-16', count: 0 }, { date: '2026-09-17', count: 1 }];
    render(<DailyChart data={data} label="Submissions per day" />);
    const img = screen.getByRole('img', { name: /submissions per day.*3 total.*peak 2 on 15 sep/i });
    expect(img.querySelectorAll('rect[data-bar]')).toHaveLength(3);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  it('says so when there is nothing to draw', () => {
    render(<DailyChart data={[{ date: '2026-09-17', count: 0 }]} label="Submissions per day" />);
    expect(screen.getByText(/no submissions in this period/i)).toBeInTheDocument();
  });
});
```

`src/admin/pages/AnalyticsPage.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import AnalyticsPage from './AnalyticsPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('AnalyticsPage', () => {
  it('shows computed deltas and never a placeholder', async () => {
    const now = new Date();
    const d = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
    const client = createMockClient({ tables: {
      submissions: { data: [{ id: '1', status: 'new', priority: 'normal', created_at: d(2), responded_at: null }, { id: '2', status: 'responded', priority: 'high', created_at: d(3), responded_at: d(2) }, { id: '3', status: 'closed', priority: 'normal', created_at: d(40), responded_at: null }], error: null },
      submission_replies: { data: [{ id: 'r', created_at: d(2), email_status: 'delivered' }], error: null },
      inbound_replies: { data: [], error: null },
    } });
    render(<MemoryRouter><AnalyticsPage client={client} /></MemoryRouter>);
    expect(await screen.findByText(/\+100% vs previous 30 days/i)).toBeInTheDocument();
    expect(screen.queryByText(/coming/i)).toBeNull();
    expect(screen.queryByText(/\+12%/)).toBeNull();
    expect(screen.getByRole('img', { name: /submissions per day/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `npx vitest run src/admin/components/DailyChart.test.jsx src/admin/pages/AnalyticsPage.test.tsx` — Expected: FAIL.

- [ ] **Step 3: Create `DailyChart.jsx`**

```jsx
import React from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

/**
 * One bar per day. Ink on cloth: bars in indigo, the baseline in the heavy rule,
 * labels in caption ink. The same numbers are in a hidden table for screen readers.
 */
export default function DailyChart({ data, label }) {
  const total = data.reduce((n, d) => n + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 0);
  const peak = data.find((d) => d.count === max);
  const W = 720, H = 180, PAD_L = 28, PAD_B = 22, PAD_T = 8;
  const innerW = W - PAD_L - 8, innerH = H - PAD_B - PAD_T;
  const slot = innerW / data.length;
  const barW = Math.max(2, slot * 0.7);
  const y = (c) => PAD_T + innerH - (max ? (c / max) * innerH : 0);
  const tickEvery = data.length > 45 ? 14 : data.length > 14 ? 7 : 1;
  const summary = `${label}: ${total} total${max ? `, peak ${max} on ${day(peak.date)}` : ''}`;

  if (total === 0) {
    return <p className="border border-cloth-300 px-4 py-10 text-center text-sm text-mark-700">No submissions in this period.</p>;
  }

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className="h-auto w-full">
        <title>{summary}</title>
        <line x1={PAD_L} x2={W - 8} y1={PAD_T + innerH} y2={PAD_T + innerH} stroke="#C6BEAB" strokeWidth="1" />
        <text x={PAD_L - 6} y={PAD_T + 4} textAnchor="end" fontSize="10" fill="#5B5F67" fontFamily="Archivo, system-ui, sans-serif">{max}</text>
        <text x={PAD_L - 6} y={PAD_T + innerH} textAnchor="end" fontSize="10" fill="#5B5F67" fontFamily="Archivo, system-ui, sans-serif">0</text>
        {data.map((d, i) => {
          const x = PAD_L + i * slot + (slot - barW) / 2;
          return (
            <g key={d.date}>
              <rect data-bar x={x} y={y(d.count)} width={barW} height={PAD_T + innerH - y(d.count)} fill="#243D8F">
                <title>{`${day(d.date)}: ${d.count}`}</title>
              </rect>
              {i % tickEvery === 0 && (
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#5B5F67" fontFamily="Archivo, system-ui, sans-serif">{day(d.date)}</text>
              )}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead><tr><th scope="col">Day</th><th scope="col">Count</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.date}><td>{d.date}</td><td>{d.count}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
```
The hex values inside the SVG are the design tokens (`pindo`, `cloth-400`, `mark-500`); SVG attributes cannot take Tailwind classes for `fill` without a class on every node, and inline attributes keep the chart self-contained. This is the one place raw hex is allowed in admin JSX besides the Toaster.

- [ ] **Step 4: Rewrite `AnalyticsPage.tsx`**

```tsx
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import PageHead from '../components/PageHead';
import { Skeleton } from '../components/Skeleton';
import Icon from '../components/Icon';
import DailyChart from '../components/DailyChart';
import { AnalyticsService, downloadText, type AnalyticsMetrics } from '../../utils/analyticsService';
import { formatDuration, type Range } from '../../utils/analyticsMath';

const RANGES: Array<[Range, string]> = [['7d', '7 days'], ['30d', '30 days'], ['90d', '90 days'], ['all', 'All time']];
const WORDS: Record<string, string> = { new: 'New', in_progress: 'In progress', responded: 'Responded', closed: 'Closed', low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' };

function Delta({ delta, range }: { delta: number | null; range: Range }) {
  if (range === 'all') return <span className="text-xs text-mark-500">all time</span>;
  const period = RANGES.find((r) => r[0] === range)?.[1];
  if (delta === null) return <span className="text-xs text-mark-500">no previous {period}</span>;
  return <span className="tabular text-xs text-mark-600">{delta > 0 ? '+' : ''}{delta}% vs previous {period}</span>;
}

function Figure({ value, label, children }: { value: React.ReactNode; label: string; children?: React.ReactNode }) {
  return (
    <div className="bg-cloth-100 px-4 py-4">
      <p className="adm-figure">{value}</p>
      <p className="mt-2 text-label uppercase tracking-[0.09em] text-mark-500">{label}</p>
      {children && <p className="mt-1">{children}</p>}
    </div>
  );
}

function Breakdown({ title, rows, total }: { title: string; rows: Array<{ key: string; count: number }>; total: number }) {
  return (
    <div className="adm-card p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <table className="w-full text-sm">
        <caption className="sr-only">{title}</caption>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-cloth-300">
              <th scope="row" className="py-2 pr-3 text-left font-normal text-mark-700">{WORDS[r.key] ?? r.key}</th>
              <td className="w-full py-2"><div className="h-2 bg-cloth-200"><div className="h-2 bg-pindo" style={{ width: total ? `${(r.count / total) * 100}%` : 0 }} /></div></td>
              <td className="tabular py-2 pl-3 text-right">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AnalyticsPage({ client }: { client: any }) {
  const [range, setRange] = useState<Range>('30d');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setMetrics(null);
    try { setMetrics(await new AnalyticsService(client).getMetrics(range)); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unknown error'); }
  }, [client, range]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    try {
      const csv = await new AnalyticsService(client).exportSubmissionsCsv(range);
      downloadText(csv, `submissions-${range}-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('CSV downloaded');
    } catch (e) { toast.error(`Export failed: ${e instanceof Error ? e.message : 'unknown error'}`); }
  };

  const m = metrics;
  const f = m?.replies.funnel;
  const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '—');

  return (
    <div>
      <PageHead title="Analytics" actions={<button type="button" onClick={exportCsv} className="btn-quiet"><Icon name="paperclip" className="h-4 w-4" />Export CSV</button>} />

      <div role="group" aria-label="Period" className="mb-6 flex flex-wrap gap-2">
        {RANGES.map(([value, word]) => (
          <button key={value} type="button" aria-pressed={range === value} onClick={() => setRange(value)} className={`btn-quiet ${range === value ? 'border-pindo bg-pindo-wash text-pindo' : ''}`}>{word}</button>
        ))}
      </div>

      {error && <p role="alert" className="mb-4 border border-alarm px-4 py-3 text-sm text-alarm">Could not load analytics: {error}. <button type="button" onClick={load} className="link">Try again</button></p>}

      <div className="grid gap-px border-y border-cloth-300 bg-cloth-300 sm:grid-cols-2 lg:grid-cols-4">
        {m ? (
          <>
            <Figure value={m.submissions.current} label="Submissions"><Delta delta={m.submissions.delta} range={range} /></Figure>
            <Figure value={m.inbound.current} label="Replies received"><Delta delta={m.inbound.delta} range={range} /></Figure>
            <Figure value={m.replies.current} label="Replies sent"><Delta delta={m.replies.delta} range={range} /></Figure>
            <Figure value={formatDuration(m.responseMinutes)} label="Median first reply"><span className="text-xs text-mark-500">from enquiry to your first reply</span></Figure>
          </>
        ) : Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-cloth-100 px-4 py-4"><Skeleton className="h-8 w-14" /><Skeleton className="mt-3 h-3 w-24" /></div>)}
      </div>

      <section aria-labelledby="chart-h" className="mt-8">
        <h2 id="chart-h" className="mb-3 text-lg font-semibold">Submissions per day</h2>
        {m ? <DailyChart data={m.submissions.byDay} label="Submissions per day" /> : <Skeleton className="h-44 w-full" />}
      </section>

      {m && (
        <>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Breakdown title="By status" rows={m.submissions.byStatus} total={m.submissions.current} />
            <Breakdown title="By priority" rows={m.submissions.byPriority} total={m.submissions.current} />
          </div>

          <section aria-labelledby="delivery-h" className="mt-8">
            <h2 id="delivery-h" className="mb-3 text-lg font-semibold">Delivery of replies you sent</h2>
            {f && f.total === 0 ? (
              <p className="border border-cloth-300 px-4 py-8 text-center text-sm text-mark-700">No replies sent in this period.</p>
            ) : f && (
              <div className="grid gap-px border-y border-cloth-300 bg-cloth-300 sm:grid-cols-3 lg:grid-cols-5">
                <Figure value={f.sent} label="Sent"><span className="tabular text-xs text-mark-500">{pct(f.sent, f.total)} of {f.total}</span></Figure>
                <Figure value={f.delivered} label="Delivered"><span className="tabular text-xs text-mark-500">{pct(f.delivered, f.sent)} of sent</span></Figure>
                <Figure value={f.opened} label="Opened"><span className="tabular text-xs text-mark-500">{pct(f.opened, f.delivered)} of delivered</span></Figure>
                <Figure value={f.bounced + f.failed} label="Bounced or failed"><span className="text-xs text-mark-500">check the address</span></Figure>
                <Figure value={f.pending} label="Queued"><span className="text-xs text-mark-500">awaiting Resend</span></Figure>
              </div>
            )}
            <p className="mt-2 text-xs text-mark-500">Delivery and open events arrive through the Resend status webhook; "Opened" undercounts clients that block tracking pixels.</p>
          </section>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run tests, lint, build; commit**

Run: `npx vitest run src/admin src/utils` — PASS. `npm run lint && npm run build 2>&1 | tail -3` — clean.
```bash
git add src/admin/components/DailyChart.jsx src/admin/components/DailyChart.test.jsx src/admin/pages/AnalyticsPage.tsx src/admin/pages/AnalyticsPage.test.tsx
git commit -m "feat(analytics): sourced figures with real deltas, a daily chart, and a delivery funnel"
```

---

### Task 10: Settings — notifications, labels, account

Fixes F13 (route). Gives `notification_settings` (which exists with a `user_id` unique row and never had a UI) a home, and brings label management back.

**Files:**
- Create: `src/admin/pages/SettingsPage.jsx`
- Modify: `src/admin/components/LabelsManager.tsx` → rename `LabelsManager.jsx` (rewrite as an inline panel), `src/admin/components/AdminNav.jsx` (append the Settings item), `src/App.jsx` (route)
- Delete: `src/admin/components/ResponsiveModal.jsx`
- Test: `src/admin/pages/SettingsPage.test.jsx`

**Interfaces:**
- Consumes: `PageHead`, `Icon`, `StateMark`.
- Produces: `LabelsManager({ client })` — inline; lists, creates, renames, recolours, deletes labels.
- Produces: `SettingsPage({ client, user })`.

- [ ] **Step 1: Check the RLS the page depends on**

Run: `grep -n "CREATE POLICY" supabase/schema.sql | grep -i "labels\|notification_settings"`.
Verified 2026-09-17: `labels` has `_read_admin`, `_insert_admin`, `_update_admin` but **no DELETE policy**; `notification_settings` has `_self` (SELECT) and `_self_update` but **no INSERT policy**. Both are added by the Task 11 migration (`labels_delete_admin`, `notification_settings_self_insert`). Until that migration is applied in production, "Delete label" and the first save of preferences will be refused by RLS and surface as a toast error — the UI is correct, the database is behind.

- [ ] **Step 2: Write the failing test**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { createMockClient } from '../../test/mockSupabase';
import SettingsPage from './SettingsPage';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const user = { id: 'user-1', email: 'karisa@example.com', app_metadata: { role: 'admin' } };

describe('SettingsPage', () => {
  it('loads notification preferences and saves a change', async () => {
    const client = createMockClient({ tables: {
      notification_settings: { data: { user_id: 'user-1', notify_new_submission: true, notify_reply_pending: false, email_digest: false, digest_frequency: 'daily' }, error: null },
      labels: { data: [{ id: 'l1', name: 'Client', color: '#243D8F', description: null }], error: null },
    } });
    render(<MemoryRouter><SettingsPage client={client} user={user} /></MemoryRouter>);
    const box = await screen.findByLabelText(/email me when a visitor replies/i);
    expect(box).not.toBeChecked();
    await userEvent.click(box);
    await waitFor(() => expect(client.from).toHaveBeenCalledWith('notification_settings'));
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('karisa@example.com')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `npx vitest run src/admin/pages/SettingsPage.test.jsx` — Expected: FAIL to resolve.

- [ ] **Step 4: Rewrite `LabelsManager.jsx`** (delete the `.tsx`)

```jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Icon from './Icon';

const SWATCHES = ['#243D8F', '#8A5A08', '#A32014', '#3B3E45', '#1A2C68', '#5B5F67'];

/** Labels are user data; their colour is theirs to choose. Everything else is the system's. */
export default function LabelsManager({ client }) {
  const [labels, setLabels] = useState(null);
  const [draft, setDraft] = useState({ name: '', color: SWATCHES[0] });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data, error } = await client.from('labels').select('id, name, color, description').order('name');
    if (error) { toast.error(`Could not load labels: ${error.message}`); return; }
    setLabels(data ?? []);
  };
  useEffect(() => { load(); }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const { error } = await client.from('labels').insert({ name: draft.name.trim(), color: draft.color });
    if (error) { toast.error(`Could not create label: ${error.message}`); return; }
    setDraft({ name: '', color: SWATCHES[0] });
    toast.success('Label created');
    load();
  };

  const save = async (label) => {
    const { error } = await client.from('labels').update({ name: label.name.trim(), color: label.color }).eq('id', label.id);
    if (error) { toast.error(`Could not save: ${error.message}`); return; }
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    const { error } = await client.from('labels').delete().eq('id', id);
    if (error) { toast.error(`Could not delete: ${error.message}`); return; }
    toast.success('Label deleted');
    load();
  };

  return (
    <div className="adm-card p-4">
      <ul className="divide-y divide-cloth-300">
        {(labels ?? []).map((l) => (
          <li key={l.id} className="flex flex-wrap items-center gap-3 py-2">
            {editing?.id === l.id ? (
              <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="flex flex-1 flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`name-${l.id}`}>Name</label>
                <input id={`name-${l.id}`} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="field-sm w-48" />
                <label className="sr-only" htmlFor={`color-${l.id}`}>Colour</label>
                <input id={`color-${l.id}`} type="color" value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="h-8 w-10 border border-cloth-400 bg-cloth-50 p-0" />
                <button type="submit" className="btn-quiet"><Icon name="check" className="h-4 w-4" />Save</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-quiet">Cancel</button>
              </form>
            ) : (
              <>
                <span className="adm-chip"><span className="h-2 w-2" style={{ background: l.color }} aria-hidden="true" />{l.name}</span>
                <span className="ml-auto flex gap-2">
                  <button type="button" onClick={() => setEditing(l)} className="btn-quiet px-2 py-1 text-xs">Edit</button>
                  <button type="button" onClick={() => remove(l.id)} className="btn-alarm px-2 py-1 text-xs" aria-label={`Delete label ${l.name}`}><Icon name="trash" className="h-3.5 w-3.5" /></button>
                </span>
              </>
            )}
          </li>
        ))}
        {labels && labels.length === 0 && <li className="py-3 text-sm text-mark-700">No labels yet.</li>}
      </ul>
      <form onSubmit={create} className="mt-4 flex flex-wrap items-end gap-2 border-t border-cloth-300 pt-4">
        <div>
          <label htmlFor="new-label" className="field-label">New label</label>
          <input id="new-label" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="field-sm w-48" placeholder="e.g. Client" />
        </div>
        <div>
          <label htmlFor="new-color" className="field-label">Colour</label>
          <input id="new-color" type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} className="h-9 w-12 border border-cloth-400 bg-cloth-50 p-0" />
        </div>
        <button type="submit" className="btn-pindo px-4 py-2 text-sm"><Icon name="tag" className="h-4 w-4" />Add</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Create `SettingsPage.jsx`**

```jsx
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PageHead from '../components/PageHead';
import LabelsManager from '../components/LabelsManager';

const DEFAULTS = { notify_new_submission: true, notify_reply_pending: true, email_digest: false, digest_frequency: 'daily', notify_via_email: true };

const PREFS = [
  ['notify_new_submission', 'Email me when a new enquiry arrives'],
  ['notify_reply_pending', 'Email me when a visitor replies to a thread'],
  ['email_digest', 'Send a digest instead of individual emails'],
];

export default function SettingsPage({ client, user }) {
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    if (!client || !user?.id) return;
    client.from('notification_settings').select('*').eq('user_id', user.id).maybeSingle().then(({ data, error }) => {
      if (error) { toast.error(`Could not load preferences: ${error.message}`); return; }
      setPrefs({ ...DEFAULTS, ...(data ?? {}) });
    });
  }, [client, user?.id]);

  const update = async (fields) => {
    const next = { ...prefs, ...fields };
    setPrefs(next);
    const { error } = await client.from('notification_settings').upsert({ user_id: user.id, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) { toast.error(`Could not save: ${error.message}`); setPrefs(prefs); return; }
    toast.success('Saved');
  };

  const role = user?.app_metadata?.role || user?.user_metadata?.role || 'admin';

  return (
    <div className="space-y-10">
      <PageHead title="Settings" />

      <section aria-labelledby="notif-h">
        <h2 id="notif-h" className="mb-3 text-lg font-semibold">Notifications</h2>
        <p className="mb-4 max-w-prose text-sm text-mark-700">Alerts go to the address the edge functions are configured with (<code className="font-sans">ADMIN_EMAIL</code>). Replying to any alert from your mail app sends your answer to the visitor and records it in the thread.</p>
        <div className="adm-card divide-y divide-cloth-300">
          {PREFS.map(([key, word]) => (
            <label key={key} className="flex items-center gap-3 px-4 py-3 text-sm">
              <input type="checkbox" checked={Boolean(prefs?.[key])} disabled={!prefs} onChange={(e) => update({ [key]: e.target.checked })} className="h-4 w-4 accent-pindo" />
              {word}
            </label>
          ))}
          <div className="flex items-center gap-3 px-4 py-3 text-sm">
            <label htmlFor="digest" className="text-mark-700">Digest frequency</label>
            <select id="digest" value={prefs?.digest_frequency ?? 'daily'} disabled={!prefs?.email_digest} onChange={(e) => update({ digest_frequency: e.target.value })} className="field-sm w-auto">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </section>

      <section aria-labelledby="labels-h">
        <h2 id="labels-h" className="mb-3 text-lg font-semibold">Labels</h2>
        <LabelsManager client={client} />
      </section>

      <section aria-labelledby="account-h">
        <h2 id="account-h" className="mb-3 text-lg font-semibold">Account</h2>
        <dl className="adm-card grid gap-y-2 px-4 py-3 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-mark-500">Signed in as</dt><dd>{user?.email}</dd>
          <dt className="text-mark-500">Role</dt><dd className="capitalize">{role.replace('_', ' ')}</dd>
        </dl>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Wire the route and nav; delete `ResponsiveModal`**

`AdminNav.jsx` — append to `NAV_ITEMS`: `{ to: '/admin/settings', label: 'Settings', icon: 'settings' },`.
`App.jsx` — add `const SettingsPage = lazy(() => import('./admin/pages/SettingsPage'));` and inside the layout route:
```jsx
        <Route path="settings" element={<Suspense fallback={<SectionLoader />}><SettingsPage client={supabaseRef.current} user={user} /></Suspense>} />
```
```bash
git rm src/admin/components/ResponsiveModal.jsx src/admin/components/LabelsManager.tsx
grep -rn "ResponsiveModal\|safe-area" src   # Expected: only tailwind.config.js's comment; delete the `.safe-area` component from tailwind.config.js if nothing else uses it.
```

- [ ] **Step 7: Run tests, lint, build; commit**

Run: `npx vitest run src/admin` — PASS. `npm run lint && npm run build 2>&1 | tail -3` — clean.
```bash
git add -A src/admin src/App.jsx tailwind.config.js
git commit -m "feat(admin): settings — notification preferences, labels, account; the sidebar's dead link now lands"
```

---

### Task 11: Realtime publication migration

Tasks 5–7 subscribe to `postgres_changes` on three tables. Supabase only broadcasts tables in the `supabase_realtime` publication; if they are not in it, the admin silently falls back to the 60 s poll. This migration makes the subscriptions real.

**Files:**
- Create: `supabase/migrations/20260917000000_admin_realtime.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Admin live updates. The /admin pages subscribe to postgres_changes on these three
-- tables; a table outside the supabase_realtime publication never emits an event.
-- Idempotent: safe to re-run.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['submissions', 'submission_replies', 'inbound_replies'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- Realtime filters (submission_id=eq.…) need the full row identity on UPDATE.
ALTER TABLE public.submission_replies REPLICA IDENTITY FULL;
ALTER TABLE public.inbound_replies REPLICA IDENTITY FULL;

-- Task 10 depends on these two. schema.sql (verified 2026-09-17) has read/insert/update
-- for labels but no DELETE, and select/update for notification_settings but no INSERT —
-- so LabelsManager's delete and SettingsPage's upsert would both be refused by RLS.
DROP POLICY IF EXISTS "labels_delete_admin" ON public.labels;
CREATE POLICY "labels_delete_admin" ON public.labels
  FOR DELETE USING (public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin']));

DROP POLICY IF EXISTS "notification_settings_self_insert" ON public.notification_settings;
CREATE POLICY "notification_settings_self_insert" ON public.notification_settings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );
```

- [ ] **Step 2: Verify the SQL parses**

Run: `grep -c "ALTER PUBLICATION" supabase/migrations/20260917000000_admin_realtime.sql` — Expected: `1`. (No local Postgres in this environment; the user applies it via the Supabase SQL editor or `supabase db push` — see Task 14's checklist.)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260917000000_admin_realtime.sql
git commit -m "feat(db): put submissions, replies and inbound mail on the realtime publication"
```

---

### Task 12: `send-notification` — deep link to the thread, `reply_to` on both mails, flat email chrome

Fixes F2 (server side) and half of F3: the alert Karisa gets now links to the exact thread, and replying to it from Gmail goes to `reply+{id}@voyani.tech` — which Task 13 teaches the inbound handler to recognise as *her* reply.

**Files:**
- Modify: `supabase/functions/send-notification/index.ts` — the env block (~line 20–24), `submissionEmailTemplate(...)` signature and CTA (~line 391–430), `sendEmailViaResend(...)` (~line 771–809), and the two call sites (~line 862–900).

**Interfaces:**
- Consumes: `buildReplyAddress(submissionId, domain)` from `../_shared/mail.ts` (already imported by `send-reply`; add the import here).
- Produces: admin alert email with `reply_to: reply+{id}@{MAIL_DOMAIN}` and CTA `${PORTFOLIO_URL}/admin/submissions/{id}`; visitor confirmation with the same `reply_to`, so a visitor who answers the confirmation also lands in the thread.

- [ ] **Step 1: Read the current shape**

Run: `grep -n "dashboardUrl\|mailDomain\|buildFrom\|sendEmailViaResend(\|submissionEmailTemplate(\|confirmationEmailTemplate(" supabase/functions/send-notification/index.ts`
Expected: `dashboardUrl` defined at ~24 and used once in the CTA; `mailDomain` absent; both templates called after the insert.

- [ ] **Step 2: Env and imports**

Near line 22 add:
```ts
const mailDomain = Deno.env.get('MAIL_DOMAIN') || 'voyani.tech';
```
Extend the existing `_shared/mail.ts` import to include `buildReplyAddress`:
```ts
import { buildFrom, buildReplyAddress } from '../_shared/mail.ts';
```
Delete the `dashboardUrl` constant (line ~24); the link is built per submission now.

- [ ] **Step 3: Give `sendEmailViaResend` a `replyTo`**

Replace the signature and the payload:
```ts
async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
  replyTo: string,
  retries = 3
): Promise<{ id: string }> {
```
and inside `body: JSON.stringify({ … })`:
```ts
        body: JSON.stringify({
          from: buildFrom(fromName, fromAddress),
          to,
          reply_to: replyTo,
          subject,
          html,
        }),
```

- [ ] **Step 4: Deep-link the admin template**

Change `submissionEmailTemplate(name, email, phone, subject, message)` to take a sixth argument `threadUrl: string`, and replace the CTA:
```html
        <div class="cta-container">
          <a href="${threadUrl}" class="button">Open this thread</a>
          <p style="margin:12px 0 0;font-size:13px;color:#5B5F67">Or just reply to this email — your answer goes to ${escapeHtml(senderName)} and is kept in the thread.</p>
        </div>
```
At the call site:
```ts
      const threadUrl = `${portfolioUrl}/admin/submissions/${submission.id}`;
      const replyTo = buildReplyAddress(submission.id, mailDomain);
      const adminHtml = submissionEmailTemplate(payload.name, payload.email, payload.phone, payload.subject, payload.message, threadUrl);
      …
      await sendEmailViaResend(adminEmail, `New enquiry: ${payload.subject}`, adminHtml, replyTo);
      …
      await sendEmailViaResend(payload.email, /* existing confirmation subject */, confirmationHtml, replyTo);
```
Keep the existing subjects if they differ; only the arguments change.

- [ ] **Step 5: Email chrome — superseded by Task 15**

Do not restyle the templates here. Task 15 replaces every email template in every function with one shared brand renderer. Leave the `<style>` blocks untouched in this task.

- [ ] **Step 6: Type-check the function**

Run: `deno check supabase/functions/send-notification/index.ts` if `deno` is installed (`which deno`); otherwise `npx tsc --noEmit -p supabase/functions 2>/dev/null || grep -n "sendEmailViaResend(" supabase/functions/send-notification/index.ts` and confirm every call passes four arguments.

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/send-notification/index.ts
git commit -m "fix(email): alerts deep-link to the thread and carry reply_to, so replying from Gmail stays in the loop"
```

---

### Task 13: `handle-inbound-email` — recognise the admin's reply and relay it to the visitor

The other half of F3. A mail arriving at `reply+{id}@` **from `ADMIN_EMAIL`** is Karisa answering from Gmail: record it as an outbound reply, send it to the visitor from `karisa@voyani.tech`, and update the submission — instead of storing it as an unverified inbound and forwarding it back to her. Forwards of visitor replies also switch their `reply_to` to the thread address so her answer to *those* is captured too.

**Files:**
- Modify: `supabase/functions/_shared/inbound.ts` (add `classifyInboundSender`), `supabase/functions/_shared/inbound.test.ts`
- Modify: `supabase/functions/handle-inbound-email/index.ts` — after the submission lookup (~line 497–520); `forwardToAdmin` signature (~line 328); the forward call (~line 641)

**Interfaces:**
- Produces: `classifyInboundSender(from: string, submissionEmail: string, adminEmail: string): 'visitor' | 'admin' | 'stranger'`.
- Produces: `relayAdminReply(submission, payload, submissionId): Promise<Response>` inside the handler.
- Row written to `submission_replies`: `{ submission_id, reply_message, reply_type: 'manual', sent_by: null, resend_email_id, email_status: 'sent', email_metadata: { source: 'email_relay', from, inbound_message_id } }` — the shape `buildThread` (Task 4) reads `source` from.

- [ ] **Step 1: Write the failing test**

Append to `supabase/functions/_shared/inbound.test.ts`:
```ts
import { classifyInboundSender } from './inbound';

describe('classifyInboundSender', () => {
  it('knows the visitor, the admin, and everyone else — case-insensitively, with display names', () => {
    expect(classifyInboundSender('Amina <Amina@Example.com>', 'amina@example.com', 'voyanitech@gmail.com')).toBe('visitor');
    expect(classifyInboundSender('Karisa <VoyaniTech@gmail.com>', 'amina@example.com', 'voyanitech@gmail.com')).toBe('admin');
    expect(classifyInboundSender('x@spam.io', 'amina@example.com', 'voyanitech@gmail.com')).toBe('stranger');
  });
  it('the visitor wins if the visitor is the admin (self-test submissions)', () => {
    expect(classifyInboundSender('voyanitech@gmail.com', 'voyanitech@gmail.com', 'voyanitech@gmail.com')).toBe('visitor');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run supabase/functions/_shared/inbound.test.ts` — Expected: FAIL, `classifyInboundSender` is not exported.

- [ ] **Step 3: Add the classifier to `inbound.ts`**

```ts
export type InboundSender = 'visitor' | 'admin' | 'stranger';

/**
 * Who wrote to reply+{id}@? The visitor is the normal case. The admin is Karisa
 * answering an alert from Gmail — that mail must be relayed to the visitor and
 * recorded as outbound, not stored as an unverified inbound and bounced back to her.
 * A self-test submission (visitor == admin) is treated as the visitor.
 */
export function classifyInboundSender(from: string, submissionEmail: string, adminEmail: string): InboundSender {
  const sender = parseAddress(from).email;
  if (sender === String(submissionEmail).trim().toLowerCase()) return 'visitor';
  if (sender === String(adminEmail).trim().toLowerCase()) return 'admin';
  return 'stranger';
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run supabase/functions/_shared/inbound.test.ts` — Expected: PASS (27).

- [ ] **Step 5: Branch on the admin in the handler**

Import it: extend the existing `../_shared/inbound.ts` import with `classifyInboundSender`, and the `../_shared/mail.ts` import with `buildFrom, buildReplyAddress, buildThreadMessageId` (add whichever are missing; `grep -n "_shared/mail" supabase/functions/handle-inbound-email/index.ts`). Ensure these env reads exist near the top (add any missing):
```ts
const fromName = Deno.env.get('MAIL_FROM_NAME') || 'Karisa';
const fromAddress = Deno.env.get('MAIL_FROM_ADDRESS') || `karisa@${mailDomain}`;
```
Directly after `console.log('[handler] Found submission for:', submission.email);` insert:
```ts
    // 4b. Karisa answering from Gmail: relay to the visitor, record as outbound, done.
    if (classifyInboundSender(payload.from, submission.email, adminEmail) === 'admin') {
      return await relayAdminReply(submission, payload, submissionId);
    }
```
Add the function above `serve(`:
```ts
/**
 * An admin reply that arrived by email. Sent on to the visitor from the site's own
 * address (so their reply threads back here), and stored exactly like a dashboard
 * reply with email_metadata.source = 'email_relay' so the thread can say "via Gmail".
 */
async function relayAdminReply(
  submission: { id: string; email: string; name: string; responded_at: string | null },
  payload: ResendWebhookPayload,
  submissionId: string
): Promise<Response> {
  const text = cleanEmailBody(payload.text || extractTextFromHtml(payload.html || ''));
  if (!text.trim()) {
    console.warn('[relay] Empty admin reply; nothing to send');
    return new Response(JSON.stringify({ success: true, handled: 'admin-empty' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const html = `<div style="font-family:Archivo,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;color:#14171C;white-space:pre-wrap">${
    text.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))
  }</div>`;

  let resendId: string | null = null;
  let emailStatus = 'sent';
  if (!resendApiKey) {
    console.error('[relay] RESEND_API_KEY not set — recording only');
    emailStatus = 'failed';
  } else {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: buildFrom(fromName, fromAddress),
        to: submission.email,
        reply_to: buildReplyAddress(submissionId, mailDomain),
        subject: payload.subject || `Re: your enquiry`,
        html,
        headers: { 'X-Submission-ID': submissionId, 'Message-ID': buildThreadMessageId(submissionId, mailDomain) },
      }),
    });
    if (res.ok) {
      resendId = (await res.json()).id ?? null;
    } else {
      emailStatus = 'failed';
      console.error('[relay] Resend rejected the relay:', res.status, await res.text());
    }
  }

  const { error: insertError } = await supabase.from('submission_replies').insert({
    submission_id: submissionId,
    reply_message: text,
    reply_type: 'manual',
    sent_by: null,
    resend_email_id: resendId,
    email_status: emailStatus,
    email_metadata: { source: 'email_relay', from: parseAddress(payload.from).email, inbound_message_id: payload.message_id ?? null },
  });
  if (insertError) console.error('[relay] Could not record the reply:', insertError.message);

  const update: Record<string, unknown> = { status: 'responded', updated_at: new Date().toISOString() };
  if (!submission.responded_at) update.responded_at = new Date().toISOString();
  await supabase.from('submissions').update(update).eq('id', submissionId);

  console.log('[relay] Admin reply relayed to', submission.email, 'status', emailStatus);
  return new Response(JSON.stringify({ success: true, handled: 'admin-relay', email_status: emailStatus }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
```
`cleanEmailBody` and `extractTextFromHtml` already exist in this file (they are what step 6 of the handler uses). Confirm: `grep -n "^function cleanEmailBody\|^function extractTextFromHtml" supabase/functions/handle-inbound-email/index.ts`.

- [ ] **Step 6: Thread the forward's `reply_to`**

Change `forwardToAdmin(payload, toAddress, banner)` to `forwardToAdmin(payload, toAddress, banner, replyTo: string)` and use `reply_to: replyTo` in its body. Update the two callers:
- `handleDirectMail`: `forwardToAdmin(payload, toAddress, 'Direct message to your voyani.tech address.', parseAddress(payload.from).email)` — direct mail keeps replying to the human.
- the visitor-reply forward (~line 641): pass `buildReplyAddress(submissionId, mailDomain)` and change the banner to:
```ts
          `Reply on <a href="${Deno.env.get('PORTFOLIO_URL') || 'https://www.voyani.tech'}/admin/submissions/${submissionId}">this thread</a>. Reply to this email to answer ${parseAddress(payload.from).name || 'them'} — it is sent from karisa@${mailDomain} and kept in the thread.`
```

- [ ] **Step 7: Type-check and commit**

Run: `deno check supabase/functions/handle-inbound-email/index.ts` if available; otherwise `npx vitest run supabase/functions` (PASS) and `grep -n "forwardToAdmin(" supabase/functions/handle-inbound-email/index.ts` — every call passes four arguments.
```bash
git add supabase/functions/_shared/inbound.ts supabase/functions/_shared/inbound.test.ts supabase/functions/handle-inbound-email/index.ts
git commit -m "feat(email): replies Karisa sends from Gmail are relayed to the visitor and recorded in the thread"
```

---

### Task 15: Email templates on the brand — one renderer for every send

Added 2026-09-17 at the user's request. Every email the system sends today is a navy/cyan/gold dark template with a Google-Fonts `@import` and an SVG background pattern (`send-reply/index.ts:287-600`, `send-notification/index.ts:70-560`), and the inbound forward/relay bodies are unstyled. This task replaces all of them with one shared, tested renderer on the Kanga palette. Runs after Task 13, before Task 14.

**Files:**
- Create: `supabase/functions/_shared/emailTemplate.ts`
- Test: `supabase/functions/_shared/emailTemplate.test.ts`
- Modify: `supabase/functions/send-reply/index.ts` (`replyEmailTemplate`, ~lines 287–600), `supabase/functions/send-notification/index.ts` (`submissionEmailTemplate` ~70–430, `confirmationEmailTemplate` ~434–560), `supabase/functions/handle-inbound-email/index.ts` (`forwardToAdmin` html, `relayAdminReply` html)

**Interfaces:**
- Produces: `renderEmail(opts: EmailOptions): string` and `escapeHtml(s: string): string`, where
  ```ts
  export interface EmailOptions {
    title: string;          // <title> and the printed line under the seam
    preheader?: string;     // hidden inbox preview text
    lead?: string;          // one sentence under the title, plain text
    sections: Array<{ label?: string; html: string; quoted?: boolean }>; // label = small caps; quoted = recessed ground
    cta?: { href: string; label: string; note?: string };
    footerNote?: string;    // plain text
  }
  ```
  `html` in a section is trusted (callers escape their own user data with `escapeHtml`). Everything else is escaped by the renderer.
- Email design rules (the Kanga Sheet in an inbox): table-based layout, 600px, ground `#F2EEE5`, card `#FAF8F3` with a 1px `#14171C` hard edge, a **2px `#243D8F` seam** at the top of the card with the title beneath it in bold 24px, body `#14171C` 16px/1.6 in `Archivo, Helvetica, Arial, sans-serif` (no `@import`, no web-font fetch), secondary `#5B5F67`, rules `#DCD5C5`, quoted/recessed ground `#E9E3D6`, links `#243D8F` underlined, CTA a solid `#243D8F` block with `#FAF8F3` text and `border-radius:0`. No gradients, images, shadows, emoji, pattern backgrounds or dark-mode block. Footer: "Ngowa Karisa · Voyani.tech · Nairobi" and the site link, nothing else.

- [ ] **Step 1: Write the failing test**

`supabase/functions/_shared/emailTemplate.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { renderEmail, escapeHtml } from './emailTemplate';

describe('escapeHtml', () => {
  it('escapes the five characters', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;');
  });
});

describe('renderEmail', () => {
  const html = renderEmail({
    title: 'Re: Clinic <site>',
    preheader: 'Thanks Amina',
    lead: 'A reply from Ngowa Karisa.',
    sections: [
      { html: '<p>Happy to help.</p>' },
      { label: 'You wrote', html: '<p>Hello there</p>', quoted: true },
    ],
    cta: { href: 'https://www.voyani.tech/admin/submissions/abc', label: 'Open this thread', note: 'Or just reply to this email.' },
    footerNote: 'Sent from karisa@voyani.tech',
  });

  it('escapes the title and keeps section html', () => {
    expect(html).toContain('<title>Re: Clinic &lt;site&gt;</title>');
    expect(html).toContain('Re: Clinic &lt;site&gt;');
    expect(html).toContain('<p>Happy to help.</p>');
    expect(html).toContain('You wrote');
  });

  it('is on the brand, with no legacy chrome', () => {
    expect(html).toContain('#243D8F');
    expect(html).toContain('#F2EEE5');
    expect(html).not.toMatch(/gradient|@import|#61DAFB|#005792|#0a1929|#061220|#D4A017|prefers-color-scheme/i);
    expect(html).not.toMatch(/border-radius:\s*[1-9]/);
  });

  it('renders the cta, preheader and footer', () => {
    expect(html).toContain('href="https://www.voyani.tech/admin/submissions/abc"');
    expect(html).toContain('Open this thread');
    expect(html).toContain('Or just reply to this email.');
    expect(html).toContain('Thanks Amina');
    expect(html).toContain('Sent from karisa@voyani.tech');
    expect(html).toContain('Voyani.tech');
  });

  it('omits optional parts cleanly', () => {
    const minimal = renderEmail({ title: 'Hi', sections: [{ html: '<p>x</p>' }] });
    expect(minimal).not.toContain('class="cta"');
    expect(minimal).not.toContain('preheader');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails** — skipped under the user's process override (all verification runs in Task 14).

- [ ] **Step 3: Create `emailTemplate.ts`**

```ts
/**
 * One email, one look: the Kanga Sheet in an inbox. Table layout for mail clients,
 * system fonts (no web-font fetch), flat cotton ground, indigo seam, square corners.
 * Pure — no Deno globals — so the edge functions and Vitest import the same file.
 */
const INK = '#14171C';
const INK_2 = '#5B5F67';
const CLOTH = '#F2EEE5';
const CLOTH_RAISED = '#FAF8F3';
const CLOTH_RECESSED = '#E9E3D6';
const RULE = '#DCD5C5';
const INDIGO = '#243D8F';
const FONT = "Archivo, Helvetica, Arial, sans-serif";

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface EmailSection { label?: string; html: string; quoted?: boolean }
export interface EmailCta { href: string; label: string; note?: string }
export interface EmailOptions {
  title: string;
  preheader?: string;
  lead?: string;
  sections: EmailSection[];
  cta?: EmailCta;
  footerNote?: string;
}

function section(s: EmailSection): string {
  const ground = s.quoted ? `background:${CLOTH_RECESSED};padding:16px 20px;` : '';
  const label = s.label
    ? `<p style="margin:0 0 8px;font:400 11px/1.35 ${FONT};letter-spacing:0.09em;text-transform:uppercase;color:${INK_2}">${escapeHtml(s.label)}</p>`
    : '';
  return `<tr><td style="padding:0 0 24px"><div style="${ground}font:400 16px/1.6 ${FONT};color:${INK}">${label}${s.html}</div></td></tr>`;
}

export function renderEmail(o: EmailOptions): string {
  const title = escapeHtml(o.title);
  const preheader = o.preheader
    ? `<div class="preheader" style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${CLOTH}">${escapeHtml(o.preheader)}</div>`
    : '';
  const lead = o.lead ? `<p style="margin:8px 0 0;font:400 16px/1.6 ${FONT};color:${INK_2}">${escapeHtml(o.lead)}</p>` : '';
  const cta = o.cta
    ? `<tr><td class="cta" style="padding:8px 0 24px">
        <a href="${escapeHtml(o.cta.href)}" style="display:inline-block;background:${INDIGO};color:${CLOTH_RAISED};font:600 15px/1 ${FONT};text-decoration:none;padding:14px 24px;border-radius:0">${escapeHtml(o.cta.label)}</a>
        ${o.cta.note ? `<p style="margin:12px 0 0;font:400 13px/1.5 ${FONT};color:${INK_2}">${escapeHtml(o.cta.note)}</p>` : ''}
      </td></tr>`
    : '';
  const footerNote = o.footerNote ? `<p style="margin:0 0 6px;font:400 12px/1.5 ${FONT};color:${INK_2}">${escapeHtml(o.footerNote)}</p>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${CLOTH}">
${preheader}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${CLOTH}">
  <tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:${CLOTH_RAISED};border:1px solid ${INK}">
      <tr><td style="border-top:2px solid ${INDIGO};padding:28px 32px 20px">
        <h1 style="margin:0;font:700 24px/1.15 ${FONT};letter-spacing:-0.02em;color:${INK}">${title}</h1>
        ${lead}
      </td></tr>
      <tr><td style="padding:0 32px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          ${o.sections.map(section).join('\n')}
          ${cta}
        </table>
      </td></tr>
      <tr><td style="padding:20px 32px 28px;border-top:1px solid ${RULE}">
        ${footerNote}
        <p style="margin:0;font:400 12px/1.5 ${FONT};color:${INK_2}">Ngowa Karisa · Voyani.tech · Nairobi · <a href="https://www.voyani.tech" style="color:${INDIGO};text-decoration:underline">www.voyani.tech</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** Plain text → safe paragraphs, preserving line breaks. */
export function textToHtml(text: string): string {
  return escapeHtml(text)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
```
Add `textToHtml` to the test's import and one assertion: `expect(textToHtml('a\n\nb<')).toBe('<p style="margin:0 0 12px">a</p><p style="margin:0 0 12px">b&lt;</p>');`

- [ ] **Step 4: `send-reply` — replace `replyEmailTemplate`**

Delete the whole function body (the `africanPattern` constant, the `<style>` block and markup) and replace it with:
```ts
function replyEmailTemplate(recipientName: string, replyMessage: string, originalSubject: string, originalMessage: string): string {
  return renderEmail({
    title: `Re: ${originalSubject}`,
    preheader: replyMessage.slice(0, 120),
    lead: `Hi ${recipientName}, a reply from Ngowa Karisa.`,
    sections: [
      { html: textToHtml(replyMessage) },
      { label: 'You wrote', html: textToHtml(originalMessage), quoted: true },
    ],
    footerNote: 'Reply to this email and it comes straight back to me.',
  });
}
```
Import `renderEmail, textToHtml` from `'../_shared/emailTemplate.ts'`. Delete the function's local `escapeHtml` **only if** nothing else in the file uses it (`grep -n "escapeHtml(" supabase/functions/send-reply/index.ts`); otherwise import `escapeHtml` from the shared module and delete the local copy.

- [ ] **Step 5: `send-notification` — replace both templates**

```ts
function submissionEmailTemplate(senderName: string, senderEmail: string, phone: string | undefined, subject: string, message: string, threadUrl: string): string {
  const contact = [
    `<p style="margin:0 0 4px"><strong>${escapeHtml(senderName)}</strong> · <a href="mailto:${escapeHtml(senderEmail)}" style="color:#243D8F">${escapeHtml(senderEmail)}</a></p>`,
    phone ? `<p style="margin:0 0 4px">Phone: <a href="tel:${escapeHtml(phone)}" style="color:#243D8F">${escapeHtml(phone)}</a></p>` : '',
    `<p style="margin:0">Subject: ${escapeHtml(subject)}</p>`,
  ].join('');
  return renderEmail({
    title: `New enquiry: ${subject}`,
    preheader: `${senderName}: ${message.slice(0, 100)}`,
    lead: 'From the contact form on voyani.tech.',
    sections: [
      { label: 'From', html: contact },
      { label: 'Message', html: textToHtml(message), quoted: true },
    ],
    cta: { href: threadUrl, label: 'Open this thread', note: `Or just reply to this email — your answer goes to ${senderName} and is kept in the thread.` },
  });
}

function confirmationEmailTemplate(senderName: string, subject: string): string {
  return renderEmail({
    title: 'Message received',
    preheader: `Thanks ${senderName} — I have your message about ${subject}.`,
    lead: `Hi ${senderName}, thanks for getting in touch.`,
    sections: [
      { html: `<p style="margin:0 0 12px">I have your message about <strong>${escapeHtml(subject)}</strong> and will reply personally, usually within one working day.</p><p style="margin:0">If anything changes in the meantime, reply to this email — it reaches me directly.</p>` },
    ],
    footerNote: 'This confirmation was sent automatically.',
  });
}
```
Keep the existing call sites (Task 12 already passes `threadUrl`). Import `renderEmail, textToHtml, escapeHtml` from the shared module and delete the local `escapeHtml`.

- [ ] **Step 6: `handle-inbound-email` — forward and relay bodies**

In `forwardToAdmin`, replace the hand-built `html` with:
```ts
  const html = renderEmail({
    title: payload.subject || '(No subject)',
    preheader: (payload.text || '').slice(0, 120),
    lead: banner.replace(/<[^>]+>/g, ''),
    sections: [
      { label: 'From', html: `<p style="margin:0">${escapeHtml(sender.name ? `${sender.name} ` : '')}&lt;${escapeHtml(sender.email)}&gt; → ${escapeHtml(toAddress)}</p>` },
      { html: payload.html || textToHtml(payload.text || ''), quoted: true },
    ],
    ...(bannerHref ? { cta: { href: bannerHref, label: 'Open this thread', note: 'Reply to this email to answer them — it is sent from your address and kept in the thread.' } } : {}),
  });
```
and change `forwardToAdmin`'s signature to `(payload, toAddress, banner: string, replyTo: string, bannerHref?: string)`; the visitor-reply call passes the thread URL as `bannerHref` and a plain-text banner `Reply on a submission.`; the direct-mail call passes no href. In `relayAdminReply`, replace its `html` with `renderEmail({ title: payload.subject || 'Re: your enquiry', preheader: text.slice(0, 120), sections: [{ html: textToHtml(text) }], footerNote: 'Reply to this email and it comes straight back to me.' })`. Import `renderEmail, textToHtml, escapeHtml` from the shared module.

- [ ] **Step 7: Verify nothing legacy remains** — deferred to Task 14: `grep -n "gradient\|@import\|#61DAFB\|#005792\|#0a1929\|#061220\|#D4A017\|africanPattern\|prefers-color-scheme" supabase/functions/*/index.ts` → no matches.

- [ ] **Step 8: Commit**

```bash
git add supabase/functions/_shared/emailTemplate.ts supabase/functions/_shared/emailTemplate.test.ts supabase/functions/send-reply/index.ts supabase/functions/send-notification/index.ts supabase/functions/handle-inbound-email/index.ts
git commit -m "feat(email): every email on the brand — one Kanga renderer for alerts, confirmations, replies and forwards"
```

---

### Task 14: Finish — detector, verification, docs, deploy checklist

**Files:**
- Modify: `DESIGN.md` (add "The admin sheet"; delete "The Legacy Boundary Rule"), `docs/CHANGELOG.md`, `docs/AUDIT.md` (A8), `.env.example` (no new vars; confirm `MAIL_DOMAIN`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, `PORTFOLIO_URL`, `ADMIN_EMAIL` are documented — they are), `docs/adminplan.md` (mark the status table)

- [x] **Step 1: Mechanical design detector**

Run once over the finished UI: `node /home/kkk/.claude/plugins/cache/impeccable/impeccable/4.1.2/skills/impeccable/scripts/detect.mjs --json src/admin src/index.css tailwind.config.js`
Expected: no findings in the categories *gradient*, *shadow*, *radius*, *emoji-icon*, *default-palette*. Fix anything it lists in one batch; do not loop.

- [x] **Step 2: Grep the bans**

```bash
grep -rn "framer-motion\|dark:\|bg-white/\|gray-[0-9]\|blue-[0-9]\|red-[0-9]\|emerald-\|amber-\|purple-\|rounded-\(lg\|md\|sm\)\|shadow-\|backdrop-blur\|gradient\|#61DAFB\|#005792\|#0a1929\|#061220" src/admin
```
Expected: no matches. Then `grep -rn "console.log" src/admin` — Expected: no matches.

- [x] **Step 3: Full verification**

```bash
npm run lint
npx vitest run 2>&1 | tail -4
npm run build 2>&1 | tail -3
```
Expected: lint clean; ≥ 24 test files, all passing (baseline 220 + the new files), 3 skipped; build succeeds. Record the actual numbers in the CHANGELOG entry.

- [x] **Step 4: Visual pass — one batched round**

Run: `npm run preview` in the background and use the `run` skill (or Playwright, already a devDependency) to capture `/admin/login`, `/admin`, `/admin/submissions`, `/admin/submissions/<a real id>`, `/admin/analytics`, `/admin/settings` at 390×844 and 1440×900. Requires `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` in `.env.local` and an admin sign-in; if unavailable, capture `/admin/login` only and note it. Fix every defect in one batch, confirm with at most one more round, stop.

- [x] **Step 5: Documents**

`DESIGN.md`: delete the paragraph headed **The Legacy Boundary Rule**; add under *Layout*:
```
### The admin sheet
`/admin` is the same cloth in Operate mode. Its one seam is the top bar's 2px indigo rule; page heads draw a 1px ink rule. Type is Archivo at fixed rem sizes; Bricolage appears only on the page title and on figures. Tables stack below `md`. Loading is a skeleton. State is `.mark-state[data-state]` with the admin vocabulary (new, in_progress, responded, closed, waiting, pending, sent, delivered, opened, bounced, failed, held). Indigo is spent on the seam, the current nav item, links, the primary action and state marks. The legacy `ink`/`signal` ramp is gone.
```
`docs/CHANGELOG.md`: one entry dated 2026-09-17 listing: admin on the Kanga system; Toaster on admin routes; `/admin/submissions/:id` and `/admin/settings`; unified thread with delivery state and held mail; Gmail reply relay; analytics with real deltas and a chart; realtime migration; 12 components deleted; test counts.
`docs/AUDIT.md`: append A8 (`analytics_events` RLS is `USING (true)`) as an open item.

- [x] **Step 6: Deploy checklist for the user (paste into the final report)**

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

- [x] **Step 7: Commit**

```bash
git add DESIGN.md docs/CHANGELOG.md docs/AUDIT.md docs/adminplan.md
git commit -m "docs: the admin sheet — design contract, changelog, audit item, plan status"
```

---

## 4. Self-review

**Spec coverage.** Every audit line maps to a task: theme (§0.1) → 1, 2, 3, 6, 9; F1 → 2; F2 → 6, 12; F3 → 12, 13; F4 → 4, 6; F5 → 4, 6; F6 → 6; F7 → 4, 6; F8 → 5, 11; F9 → 4, 5; F10 → 5, 6; F11 → 6; F12 → 2, 6, 10; F13 → 7, 10; F14 → 3; F15 → 5; A1 → 8, 9; A2 → 9; A3 → 8, 9; A4 → 9; A5 → 9; A6 → 8, 9; A7 → 8; A8 → 14 (recorded, not fixed — out of scope, needs an RLS decision).

**Type consistency.** `decorateRow`/`SubmissionRow` (Task 4) are consumed by Tasks 5 and 7 with the same field names (`replyCount`, `inboundUnread`, `lastInboundAt`, `awaiting`, `labelIds`). `buildThread` reads `email_metadata.source === 'email_relay'` (Task 4) and Task 13 writes exactly that. `StateMark` states used in Tasks 5–9 are all in the Task 1 `WORDS` map and CSS. `AnalyticsService.getMetrics(range)` (Task 8) matches the Task 9 call. `AdminLayout` takes `{ user, onLogout }` (Task 2) and `App.jsx` passes exactly that. `createMockClient` (Task 4) exposes `from/rpc/channel/removeChannel/auth/storage/_channel`, all of which Tasks 5–7, 9, 10 rely on.

**Known interim states.** Between Task 5 and Task 10 there is no UI to create labels (existing labels still apply from the detail page). Between Task 8 and Task 9 the build is red; commit them together if executing with a gate between tasks.

**Out of scope, deliberately.** `send-reply` and `handle-resend-webhook` are untouched. No new tables. No dark mode. No email template redesign beyond flattening the chrome.

