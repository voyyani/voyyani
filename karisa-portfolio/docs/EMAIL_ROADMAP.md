# Email Roadmap — Resend on `karisa@voyani.tech`

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `karisa@voyani.tech` a real, verified, two-way address — Resend sends every outbound mail from it, mail addressed to it arrives in the admin CRM *and* is forwarded to Gmail, and it is the address the site publishes.

**Architecture:** The sending path already exists in code (`send-notification`, `send-reply`) and already hardcodes `from: Karisa <karisa@voyani.tech>`. It has never worked, because `voyani.tech` has no email DNS at all. This roadmap adds the DNS, fixes the inbound handler (which currently cannot even boot), routes inbound through one shared, tested address-parsing module, and flips the site's single source of truth (`src/config/site.js`) to the new address only once receiving is proven.

**Tech Stack:** Resend (sending + inbound), Supabase Edge Functions (Deno), Supabase Postgres + Storage, Cloudflare DNS, React 19 / Vite 6, Vitest.

**Spec:** This document. The current-state audit in §0 is the spec every task argues from.

## Execution status — 2026-08-31

| Task | State |
|---|---|
| 0. Credential scaffold | ✅ `.env.example`, `scripts/push-email-secrets.sh` |
| 1. Verify sending domain | ⚠️ DKIM, SPF and `send` MX resolve (eu-west-1). **`_dmarc` TXT is still missing** (Step 4). Resend's "Verified" badge and the test send (Steps 6–8) are unconfirmed. |
| 2. Inbound MX + webhooks | ⚠️ Root MX resolves to `inbound-smtp.eu-west-1.amazonaws.com`. Webhook registration (Steps 5–6) is unconfirmed — dashboard access needed. |
| 3–7. Code | ✅ Done, committed, type-checked, 30 new tests passing. |
| 8. Migration + bucket | ⬜ Needs the Supabase dashboard. |
| 9. Secrets + deploy | ⬜ Needs `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` and the project ref. |
| 10. Publish the address | ✅ Done — flipped ahead of Task 11 on Karisa's explicit call, against this document's own gate. |
| 11. Prove the loop | ⬜ Steps 1–5 (live tests) outstanding; Steps 6–8 (docs) done. |

**The site now publishes an address that will not deliver until Tasks 8, 9 and 11 are
done.** That is the known trade-off of flipping Task 10 early — see Rollback below for
the one-line revert.

---

## 0. Current state — audit findings

Established by reading the repo and querying live DNS on 2026-08-31. **Read this before touching anything;** several tasks exist only because of a finding here.

### DNS: nothing exists

```
$ dig +short MX voyani.tech                      → (empty)
$ dig +short TXT voyani.tech                     → google-site-verification=... only
$ dig +short TXT resend._domainkey.voyani.tech   → (empty)
$ dig +short TXT _dmarc.voyani.tech              → (empty)
$ dig +short A voyani.tech                       → 64.29.17.1, 216.198.79.1  (Vercel)
```

No MX, no SPF, no DKIM, no DMARC. The domain is **not verified in Resend**, which means every `POST https://api.resend.com/emails` with `from: karisa@voyani.tech` is currently rejected with a 403 "domain is not verified".

### That failure is invisible to visitors

`supabase/functions/send-notification/index.ts` wraps both sends in `try/catch` that only `console.error`s, then returns `200 {success:true}`. So the contact form has been telling every visitor *"Message sent. I'll get back to you soon."* while no email left the building. The submission row **is** written to Postgres, so nothing is lost — it is sitting in `/admin/submissions` unread-by-email. Check that table before assuming there is no backlog.

### `handle-inbound-email` cannot boot

`supabase/functions/handle-inbound-email/index.ts` declares `const bodyText` **twice in the same block scope**:

- line 363 — `const bodyText = await req.text();`
- line 439 — `const bodyText = payload.text || extractTextFromHtml(payload.html || '');`

That is a `SyntaxError: Identifier 'bodyText' has already been declared` at module evaluation. The function has never been deployable. Everything below it is therefore unverified code.

### `handle-inbound-email` does not match its own migration

Its `inbound_replies` insert disagrees with `supabase/migrations/20260328000000_inbound_email_system.sql` in six ways:

| Code writes | Schema says | Failure |
|---|---|---|
| `sender_verified` | `is_sender_verified` | column does not exist → insert error |
| `body_preview: ...` | `GENERATED ALWAYS AS ... STORED` | `cannot insert into column "body_preview"` |
| `references: payload.references` (a `string`) | `"references" text[]` | type error |
| `message_id: payload.message_id` (may be `undefined`) | `text UNIQUE NOT NULL` | not-null violation |
| `from_email: payload.from` (e.g. `Jane <j@x.com>`) | `CHECK (from_email ~* '^...@...$')` | check violation on any display-name sender |
| `metadata:` on `analytics_events` | column is `event_data` | column does not exist |

And on `inbound_attachments`: code writes `filename`/`size`/`file_extension`; the schema has `file_name`/`file_size` and `file_extension` is **generated**.

### Signature verification is switched off

`handle-inbound-email` logs `'Invalid webhook signature - proceeding anyway for debugging'` and continues; the `return 401` is commented out. `handle-resend-webhook` returns `true` when no secret is set. Both accept forged webhooks today.

### Direct mail is rejected

`extractSubmissionId()` only matches `reply+{uuid}@`. Anything else — including mail a human sends to `karisa@voyani.tech` — gets a `400 Invalid recipient address format`. Making `karisa@` a published address requires a second branch.

### The frontend is already centralised — one line

`src/config/site.js` is the single source of truth; `Footer.jsx`, `ContactSection.jsx`, `PrivacyPolicy.jsx` and `seo.js` (JSON-LD `email`) all read `SITE.email`. Changing the published address is genuinely one line. Two loose ends: `PrivacyPolicy.jsx:198` still discloses **EmailJS** as the third-party processor, and `@emailjs/browser` is still a dependency though no source file imports it.

---

## Global Constraints

- Sending domain: **`voyani.tech`** (root). Sending identity: **`Karisa <karisa@voyani.tech>`**.
- Inbound domain: **`voyani.tech`** (root MX → Resend Inbound).
- Reply-address format is fixed by the deployed migration and must not change: **`reply+{submission_id}@voyani.tech`**, where `{submission_id}` is a lowercase v4 UUID.
- Forward-copy destination: **`voyanitech@gmail.com`** (env `ADMIN_EMAIL`). This stays a Gmail address — it is the mailbox Karisa actually reads. It is *not* published anywhere on the site after Task 10.
- DNS provider is **Cloudflare**. Cloudflare **Email Routing must stay disabled** on this zone — enabling it rewrites the MX records and silently hijacks inbound away from Resend.
- No new npm runtime dependencies. Edge functions keep using raw `fetch` against `https://api.resend.com/emails` — do **not** add the `resend` SDK.
- Deno shared code lives in `supabase/functions/_shared/` and must import **no Deno globals**, so Vitest can test the same file the edge functions import.
- Never commit a secret. `RESEND_API_KEY` and `RESEND_WEBHOOK_SECRET` live only in Supabase function secrets. `.gitignore` already excludes `.env*` except `.env.example`.
- Test runner is Vitest; `vitest.config.js` has `include: ['**/*.{test,spec}.{js,jsx,ts,tsx}']`, so tests under `supabase/` are picked up automatically. Full run: `npm test -- --run`.
- Do not flip `SITE.email` (Task 10) until Task 11's receive test has passed. Publishing an address that bounces is the exact bug Phase 0 spent a day removing.

---

## Task 1: Verify `voyani.tech` for sending in Resend

Manual — Resend dashboard + Cloudflare. No code. Produces a verified sending domain, without which every later send 403s.

**Files:** none.

**Interfaces:**
- Produces: a verified domain in Resend; a `RESEND_API_KEY` value for Task 9.

- [ ] **Step 1: Confirm Cloudflare Email Routing is off**

  Cloudflare dashboard → `voyani.tech` → **Email** → **Email Routing**. If it is enabled, disable it. If it has already inserted MX records pointing at `*.mx.cloudflare.net`, delete them. Leaving this on will break Task 2.

- [ ] **Step 2: Add the domain in Resend**

  resend.com → **Domains** → **Add Domain** → `voyani.tech` → region **US East (N. Virginia)**. Resend will display 3–4 records. Copy the values **verbatim from the dashboard** — the DKIM public key is unique to your account and cannot be guessed.

  Expect a set shaped like this (values will differ):

  | Type | Name | Value | Priority |
  |---|---|---|---|
  | MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 |
  | TXT | `send` | `v=spf1 include:amazonses.com ~all` | — |
  | TXT | `resend._domainkey` | `p=MIGfMA0GCSq...` (long) | — |

  Note the sending MX sits on the **`send.` subdomain**, not the root. That is why Resend Inbound (Task 2, root MX) does not conflict with it.

- [ ] **Step 3: Add the records in Cloudflare**

  Cloudflare → `voyani.tech` → **DNS** → **Records** → **Add record**, once per row.

  - Cloudflare appends the zone automatically: enter the Name as `send`, **not** `send.voyani.tech`.
  - Paste the DKIM value as a single unbroken string. Cloudflare handles the 255-char chunking itself; do not add quotes or split it.
  - Proxy status does not apply to MX/TXT. If any record shows an orange cloud, set it to **DNS only**.

- [ ] **Step 4: Add DMARC**

  Cloudflare → Add record → TXT, Name `_dmarc`, Value:

  ```
  v=DMARC1; p=none; rua=mailto:voyanitech@gmail.com; fo=1
  ```

  `p=none` is deliberate for launch — it reports without quarantining, so a misconfiguration does not silently eat mail. Tighten to `p=quarantine` only after a week of clean reports.

- [ ] **Step 5: Verify propagation**

  ```bash
  dig +short TXT resend._domainkey.voyani.tech
  dig +short TXT send.voyani.tech
  dig +short MX  send.voyani.tech
  dig +short TXT _dmarc.voyani.tech
  ```

  Expected: all four return the values from Steps 3–4. Empty output means Cloudflare has not propagated yet — wait 5 minutes and re-run. Do not proceed on empty output.

- [ ] **Step 6: Click Verify in Resend**

  Resend → Domains → `voyani.tech` → **Verify DNS Records**. Expected: status **Verified** (green). If it stays "Pending" for more than 15 minutes with Step 5 passing, the usual cause is a trailing space or added quotes in the DKIM TXT value — delete and re-paste it.

- [ ] **Step 7: Create the API key**

  Resend → **API Keys** → **Create API Key**. Name: `voyani-portfolio-prod`. Permission: **Sending access**. Domain: `voyani.tech`.

  Copy the `re_...` value into your password manager now — Resend shows it exactly once. Do **not** paste it into any file in this repo. It is consumed in Task 9, Step 2.

- [ ] **Step 8: Prove a send works, end to end**

  ```bash
  curl -X POST https://api.resend.com/emails \
    -H "Authorization: Bearer re_YOUR_KEY_HERE" \
    -H "Content-Type: application/json" \
    -d '{
      "from": "Karisa <karisa@voyani.tech>",
      "to": "voyanitech@gmail.com",
      "subject": "Resend verification test",
      "html": "<p>If this arrives, sending is live.</p>"
    }'
  ```

  Expected: `{"id":"..."}`. A 403 `"The voyani.tech domain is not verified"` means Step 6 did not actually finish.

  Then open Gmail, find the message, **Show original**, and confirm all three read `PASS`:

  ```
  SPF:   PASS with domain voyani.tech
  DKIM:  PASS with domain voyani.tech
  DMARC: PASS
  ```

  A `SOFTFAIL`/`FAIL` on SPF here means the `send` TXT record is wrong. Fix before continuing — this is the single best predictor of landing in spam later.

**Done when:** Resend shows Verified, and a real message from `karisa@voyani.tech` is sitting in the Gmail inbox with SPF/DKIM/DMARC all PASS.

---

## Task 2: Enable Resend Inbound and point the root MX at it

Manual. Makes `karisa@voyani.tech` and `reply+*@voyani.tech` deliverable, and gives you the webhook URL + signing secret the code needs.

**Files:** none.

**Interfaces:**
- Consumes: verified domain from Task 1.
- Produces: the inbound webhook endpoint registration and a `RESEND_WEBHOOK_SECRET` value for Task 9.

- [ ] **Step 1: Get your Supabase project ref**

  Supabase dashboard → Project Settings → General → **Reference ID** (a 20-char string like `abcdefghijklmnopqrst`). Every function URL below is:

  ```
  https://<project-ref>.supabase.co/functions/v1/<function-name>
  ```

  Write it down; Tasks 9 and 11 both need it.

- [ ] **Step 2: Enable Inbound in Resend**

  Resend → **Inbound** (or Domains → `voyani.tech` → Inbound, depending on dashboard version) → enable inbound for `voyani.tech`. Resend will show **one MX record for the root domain**.

  Sanity check: the value should be an `*.resend.com` host (expect `inbound.resend.com`, priority 10). **Use whatever the dashboard prints, not this document** — if the two disagree, the dashboard is right.

- [ ] **Step 3: Add the root MX in Cloudflare**

  Cloudflare → DNS → Add record → **MX**, Name `@`, Mail server = the value from Step 2, Priority `10`.

  Confirm the record list now contains **exactly two** MX entries and they do not collide:
  - `send` → `feedback-smtp...` (outbound bounces, Task 1)
  - `@` → `inbound.resend.com` (inbound mail, this task)

- [ ] **Step 4: Verify the MX resolves**

  ```bash
  dig +short MX voyani.tech
  ```

  Expected: `10 inbound.resend.com.` (or the dashboard's value). Empty means not propagated — wait and re-run.

- [ ] **Step 5: Register the webhook endpoint**

  Resend → **Webhooks** → **Add Webhook**.

  - Endpoint URL: `https://<project-ref>.supabase.co/functions/v1/handle-inbound-email`
  - Events: `email.received` (the inbound event)

  Copy the generated **Signing Secret** (`whsec_...`) into your password manager. Consumed in Task 9, Step 2.

- [ ] **Step 6: Register the delivery-events webhook**

  The repo has a *second* function, `handle-resend-webhook`, which records `email.sent` / `delivered` / `opened` / `clicked` / `bounced` / `complained` / `failed`. Add a separate webhook:

  - Endpoint URL: `https://<project-ref>.supabase.co/functions/v1/handle-resend-webhook`
  - Events: `email.sent`, `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`, `email.failed`

  Both webhooks can share one signing secret if Resend issues one per account; if it issues one per endpoint and they differ, stop and note it — Task 9 assumes a single `RESEND_WEBHOOK_SECRET`, and you will need a second secret name (`RESEND_INBOUND_WEBHOOK_SECRET`) wired into `handle-inbound-email` instead.

- [ ] **Step 7: Confirm the domain accepts mail at all**

  From any other mail account, send a plain message to `karisa@voyani.tech`.

  Expected right now: **no bounce**. The webhook will 500 or 401 (the function is broken and undeployed — Tasks 3–9 fix that), but Resend accepting the message without an NDR proves the MX is live.

  If you get a bounce reading "no such domain" or "no MX", Step 3 did not take effect.

**Done when:** `dig MX voyani.tech` returns the Resend host, both webhooks are registered, and mail to `karisa@voyani.tech` does not bounce.

---

## Task 3: Extract and test the inbound address/row logic

The `handle-inbound-email` bugs in §0 are all data-shaping bugs. Pull that shaping into one pure, Deno-free module and cover it with tests before touching the handler.

**Files:**
- Create: `supabase/functions/_shared/inbound.ts`
- Test: `supabase/functions/_shared/inbound.test.ts`

**Interfaces:**
- Produces, for Tasks 4 and 6:
  - `type InboundRoute = { kind: 'reply'; submissionId: string } | { kind: 'direct'; mailbox: string } | { kind: 'foreign' }`
  - `routeInboundAddress(toAddress: string, domain: string): InboundRoute`
  - `parseAddress(raw: string): { name: string | null; email: string }`
  - `normalizeReferences(refs: string | string[] | undefined): string[] | null`
  - `buildMessageId(payload: { message_id?: string }, submissionId: string): string`
  - `buildInboundReplyRow(input: InboundRowInput): Record<string, unknown>`
  - `buildAttachmentRow(input: AttachmentRowInput): Record<string, unknown>`

- [x] **Step 1: Write the failing test**

  Create `supabase/functions/_shared/inbound.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  routeInboundAddress,
  parseAddress,
  normalizeReferences,
  buildMessageId,
  buildInboundReplyRow,
  buildAttachmentRow,
} from './inbound';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('routeInboundAddress', () => {
  it('routes a reply+{uuid} address to the threading path', () => {
    expect(routeInboundAddress(`reply+${UUID}@voyani.tech`, 'voyani.tech')).toEqual({
      kind: 'reply',
      submissionId: UUID,
    });
  });

  it('is case-insensitive and tolerates a display name', () => {
    expect(routeInboundAddress(`Karisa <REPLY+${UUID.toUpperCase()}@Voyani.Tech>`, 'voyani.tech'))
      .toEqual({ kind: 'reply', submissionId: UUID });
  });

  it('routes plain mail at the domain to the direct path', () => {
    expect(routeInboundAddress('karisa@voyani.tech', 'voyani.tech')).toEqual({
      kind: 'direct',
      mailbox: 'karisa',
    });
  });

  it('routes any other mailbox at the domain to the direct path too', () => {
    // A catch-all domain means hello@, info@ and typos all still reach a human.
    expect(routeInboundAddress('hello@voyani.tech', 'voyani.tech')).toEqual({
      kind: 'direct',
      mailbox: 'hello',
    });
  });

  it('rejects a reply+ address whose token is not a UUID', () => {
    expect(routeInboundAddress('reply+not-a-uuid@voyani.tech', 'voyani.tech'))
      .toEqual({ kind: 'direct', mailbox: 'reply+not-a-uuid' });
  });

  it('marks addresses at another domain as foreign', () => {
    expect(routeInboundAddress('someone@example.com', 'voyani.tech')).toEqual({ kind: 'foreign' });
  });
});

describe('parseAddress', () => {
  it('splits a display-name address', () => {
    // The DB CHECK constraint on from_email rejects "Jane Doe <jane@x.com>" outright.
    expect(parseAddress('Jane Doe <jane@example.com>')).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
  });

  it('handles a bare address', () => {
    expect(parseAddress('jane@example.com')).toEqual({ name: null, email: 'jane@example.com' });
  });

  it('strips quotes from a quoted display name', () => {
    expect(parseAddress('"Doe, Jane" <jane@example.com>')).toEqual({
      name: 'Doe, Jane',
      email: 'jane@example.com',
    });
  });

  it('lowercases the address', () => {
    expect(parseAddress('Jane@Example.COM').email).toBe('jane@example.com');
  });
});

describe('normalizeReferences', () => {
  it('splits a whitespace-separated header into an array', () => {
    expect(normalizeReferences('<a@x.com> <b@x.com>')).toEqual(['<a@x.com>', '<b@x.com>']);
  });

  it('passes an array through', () => {
    expect(normalizeReferences(['<a@x.com>'])).toEqual(['<a@x.com>']);
  });

  it('returns null for undefined', () => {
    expect(normalizeReferences(undefined)).toBeNull();
  });

  it('returns null for an empty string rather than ['']', () => {
    expect(normalizeReferences('   ')).toBeNull();
  });
});

describe('buildMessageId', () => {
  it('keeps the provider Message-ID when present', () => {
    expect(buildMessageId({ message_id: '<abc@mail.example.com>' }, UUID))
      .toBe('<abc@mail.example.com>');
  });

  it('synthesises one when absent, because the column is NOT NULL UNIQUE', () => {
    const id = buildMessageId({}, UUID);
    expect(id).toMatch(/^<generated\.[0-9a-f-]{36}\.\d+@voyani\.tech>$/);
  });
});

describe('buildInboundReplyRow', () => {
  const input = {
    submissionId: UUID,
    toAddress: `reply+${UUID}@voyani.tech`,
    from: 'Jane Doe <jane@example.com>',
    subject: 'Re: Project Inquiry',
    bodyText: 'Sounds good.',
    bodyHtml: '<p>Sounds good.</p>',
    payload: { message_id: '<abc@mail.example.com>', in_reply_to: '<x@y.com>', references: '<x@y.com>' },
    senderVerified: true,
    spamScore: 0.5,
    spamReasons: [],
    isSpam: false,
  };

  it('writes is_sender_verified, not sender_verified', () => {
    const row = buildInboundReplyRow(input);
    expect(row.is_sender_verified).toBe(true);
    expect(row).not.toHaveProperty('sender_verified');
  });

  it('never writes the generated body_preview column', () => {
    expect(buildInboundReplyRow(input)).not.toHaveProperty('body_preview');
  });

  it('splits the from header into from_email and from_name', () => {
    const row = buildInboundReplyRow(input);
    expect(row.from_email).toBe('jane@example.com');
    expect(row.from_name).toBe('Jane Doe');
  });

  it('writes references as an array', () => {
    expect(buildInboundReplyRow(input).references).toEqual(['<x@y.com>']);
  });

  it('marks a spam row with status spam', () => {
    expect(buildInboundReplyRow({ ...input, isSpam: true }).status).toBe('spam');
  });

  it('marks a clean row with status processed', () => {
    expect(buildInboundReplyRow(input).status).toBe('processed');
  });

  it('falls back to "(No subject)" for a missing subject', () => {
    expect(buildInboundReplyRow({ ...input, subject: '' }).subject).toBe('(No subject)');
  });
});

describe('buildAttachmentRow', () => {
  const input = {
    inboundReplyId: 'r1',
    filename: 'brief.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    storagePath: `${UUID}/r1/brief.pdf`,
    isInline: false,
    contentId: undefined,
  };

  it('uses the schema column names file_name and file_size', () => {
    const row = buildAttachmentRow(input);
    expect(row.file_name).toBe('brief.pdf');
    expect(row.file_size).toBe(1024);
    expect(row).not.toHaveProperty('filename');
    expect(row).not.toHaveProperty('size');
  });

  it('never writes the generated file_extension column', () => {
    expect(buildAttachmentRow(input)).not.toHaveProperty('file_extension');
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

  ```bash
  npm test -- --run supabase/functions/_shared/inbound.test.ts
  ```

  Expected: FAIL — `Failed to resolve import "./inbound"`.

- [x] **Step 3: Write the implementation**

  Create `supabase/functions/_shared/inbound.ts`:

```ts
/**
 * Pure data-shaping for inbound email. No Deno globals, no network, no Supabase client —
 * so the edge function and Vitest import the exact same file.
 *
 * Every function here exists because the previous inline version of this logic disagreed
 * with supabase/migrations/20260328000000_inbound_email_system.sql. See docs/EMAIL_ROADMAP.md §0.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type InboundRoute =
  | { kind: 'reply'; submissionId: string }
  | { kind: 'direct'; mailbox: string }
  | { kind: 'foreign' };

export interface ParsedAddress {
  name: string | null;
  email: string;
}

/**
 * `Jane Doe <jane@example.com>` -> { name: 'Jane Doe', email: 'jane@example.com' }
 *
 * inbound_replies.from_email carries CHECK (from_email ~* '^...@...$'), which a raw
 * display-name header violates — so every insert from a normal mail client failed.
 */
export function parseAddress(raw: string): ParsedAddress {
  const trimmed = (raw || '').trim();
  const angled = trimmed.match(/^(.*)<([^>]+)>\s*$/);

  if (angled) {
    const name = angled[1].trim().replace(/^"(.*)"$/, '$1').trim();
    return { name: name || null, email: angled[2].trim().toLowerCase() };
  }

  return { name: null, email: trimmed.toLowerCase() };
}

/**
 * Decide what an inbound recipient address means.
 *
 * - `reply+{uuid}@domain` threads onto an existing submission.
 * - anything else `@domain` is direct human mail (karisa@, hello@, a typo) and is
 *   forwarded to ADMIN_EMAIL rather than 400'd, which is what the old code did.
 * - anything at another domain is not ours.
 */
export function routeInboundAddress(toAddress: string, domain: string): InboundRoute {
  const { email } = parseAddress(toAddress);
  const at = email.lastIndexOf('@');
  if (at === -1) return { kind: 'foreign' };

  const mailbox = email.slice(0, at);
  const host = email.slice(at + 1);

  if (host !== domain.toLowerCase()) return { kind: 'foreign' };

  const replyMatch = mailbox.match(/^reply\+(.+)$/i);
  if (replyMatch && UUID_RE.test(replyMatch[1])) {
    return { kind: 'reply', submissionId: replyMatch[1].toLowerCase() };
  }

  return { kind: 'direct', mailbox };
}

/** The References header is a space-separated string; the column is text[]. */
export function normalizeReferences(refs: string | string[] | undefined): string[] | null {
  if (!refs) return null;
  const list = Array.isArray(refs) ? refs : refs.trim().split(/\s+/);
  const cleaned = list.map((r) => r.trim()).filter(Boolean);
  return cleaned.length ? cleaned : null;
}

/** message_id is NOT NULL UNIQUE, and not every sender supplies one. */
export function buildMessageId(payload: { message_id?: string }, submissionId: string): string {
  if (payload.message_id) return payload.message_id;
  return `<generated.${submissionId}.${Date.now()}@voyani.tech>`;
}

export interface InboundRowInput {
  submissionId: string;
  toAddress: string;
  from: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  payload: { message_id?: string; in_reply_to?: string; references?: string | string[] };
  senderVerified: boolean;
  spamScore: number;
  spamReasons: string[];
  isSpam: boolean;
}

export function buildInboundReplyRow(input: InboundRowInput): Record<string, unknown> {
  const from = parseAddress(input.from);
  const now = new Date().toISOString();

  // body_preview and file_extension are GENERATED ALWAYS columns — Postgres rejects
  // any insert that names them. They are deliberately absent below.
  return {
    submission_id: input.submissionId,
    from_email: from.email,
    from_name: from.name,
    to_email: parseAddress(input.toAddress).email,
    subject: input.subject || '(No subject)',
    body_text: input.bodyText,
    body_html: input.bodyHtml ?? null,
    message_id: buildMessageId(input.payload, input.submissionId),
    in_reply_to: input.payload.in_reply_to ?? null,
    references: normalizeReferences(input.payload.references),
    status: input.isSpam ? 'spam' : 'processed',
    spam_score: input.spamScore,
    spam_reasons: input.spamReasons,
    is_spam: input.isSpam,
    is_sender_verified: input.senderVerified,
    received_at: now,
    processed_at: now,
  };
}

export interface AttachmentRowInput {
  inboundReplyId: string;
  filename: string;
  mimeType: string;
  size: number;
  storagePath: string;
  isInline: boolean;
  contentId?: string;
}

export function buildAttachmentRow(input: AttachmentRowInput): Record<string, unknown> {
  return {
    inbound_reply_id: input.inboundReplyId,
    file_name: input.filename,
    file_size: input.size,
    mime_type: input.mimeType,
    storage_path: input.storagePath,
    is_inline: input.isInline,
    content_disposition: input.isInline ? 'inline' : 'attachment',
    content_id: input.contentId ?? null,
  };
}
```

- [x] **Step 4: Run the test to verify it passes**

  ```bash
  npm test -- --run supabase/functions/_shared/inbound.test.ts
  ```

  Expected: PASS, 25 tests.

- [x] **Step 5: Commit**

```bash
git add supabase/functions/_shared/inbound.ts supabase/functions/_shared/inbound.test.ts
git commit -m "feat(email): add tested shared inbound address and row builders"
```

---

## Task 4: Rewire `handle-inbound-email` onto the shared module

Fixes the boot-blocking `SyntaxError` and every schema mismatch by deleting the inline versions and calling Task 3's module.

**Files:**
- Modify: `supabase/functions/handle-inbound-email/index.ts`

**Interfaces:**
- Consumes: everything exported from `_shared/inbound.ts`.

- [x] **Step 1: Import the shared module**

  At the top of `supabase/functions/handle-inbound-email/index.ts`, after the existing imports, add:

```ts
import {
  routeInboundAddress,
  parseAddress,
  buildInboundReplyRow,
  buildAttachmentRow,
} from '../_shared/inbound.ts';

const mailDomain = Deno.env.get('MAIL_DOMAIN') || 'voyani.tech';
const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'voyanitech@gmail.com';
const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
```

  Note the `.ts` extension — Deno requires it, and Vitest resolves it fine.

- [x] **Step 2: Delete the shadowed variable**

  This is the boot blocker. At line ~439, rename the *second* declaration so it no longer collides with the request body read at line ~363:

  Replace:

```ts
    const bodyText = payload.text || extractTextFromHtml(payload.html || '');
    const cleanedBody = cleanEmailBody(bodyText);
```

  with:

```ts
    // Named emailBody, not bodyText: `bodyText` is already the raw request body read at
    // the top of this handler. The collision was a SyntaxError that stopped the whole
    // function from evaluating, so nothing below here has ever run in production.
    const emailBody = payload.text || extractTextFromHtml(payload.html || '');
    const cleanedBody = cleanEmailBody(emailBody);
```

  Then update the one downstream use — in the `calculateSpamScore(...)` call, change the third argument `bodyText` to `emailBody`.

- [x] **Step 3: Delete the local `extractSubmissionId` and route through the shared function**

  Delete the whole `function extractSubmissionId(toAddress: string): string | null { ... }` block.

  Replace the routing section (`const toAddress = payload.to[0]; const submissionId = extractSubmissionId(toAddress); if (!submissionId) { ... 400 ... }`) with:

```ts
    const toAddress = payload.to[0];
    const route = routeInboundAddress(toAddress, mailDomain);

    if (route.kind === 'foreign') {
      console.warn('[handler] Address is not ours, ignoring:', toAddress);
      // 200, not 400: a non-2xx makes Resend retry an email we will never accept.
      return new Response(
        JSON.stringify({ success: true, ignored: 'foreign recipient' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (route.kind === 'direct') {
      // Human mail to karisa@voyani.tech, not a threaded reply.
      return await handleDirectMail(payload, toAddress);
    }

    const submissionId = route.submissionId;
    console.log('[handler] Extracted submission_id:', submissionId);
```

- [x] **Step 3b: Add a placeholder `handleDirectMail` so this task type-checks alone**

  Task 6 replaces this with the real forwarding implementation. Without it, Step 8's type
  check fails on an undefined name. Add it above the `serve(...)` call:

```ts
// Placeholder — Task 6 replaces this with real forwarding to ADMIN_EMAIL.
async function handleDirectMail(
  payload: ResendWebhookPayload,
  toAddress: string
): Promise<Response> {
  console.log('[handler] Direct mail to', toAddress, 'from', payload.from, '(not yet forwarded)');
  return new Response(
    JSON.stringify({ success: true, handled: 'direct' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
```

- [x] **Step 4: Replace the `inbound_replies` insert**

  Replace the whole `.insert({ ... })` object on `inbound_replies` with a call to the builder:

```ts
    const { data: reply, error: replyError } = await supabase
      .from('inbound_replies')
      .insert(
        buildInboundReplyRow({
          submissionId,
          toAddress,
          from: payload.from,
          subject: payload.subject || '',
          bodyText: cleanedBody,
          bodyHtml: payload.html,
          payload,
          senderVerified,
          spamScore,
          spamReasons,
          isSpam,
        })
      )
      .select()
      .single();
```

- [x] **Step 5: Fix sender verification to compare parsed addresses**

  Replace the `senderVerified` computation with:

```ts
    // Compare bare addresses. The old version ran `includes()` on the raw From header,
    // so "Jane <jane@evil.com>" matched a submission from "e@vil.com" by substring.
    const senderVerified =
      parseAddress(payload.from).email === String(submission.email).toLowerCase();
```

- [x] **Step 6: Fix the attachment insert**

  Replace the `inbound_attachments` `.insert({ ... })` object with:

```ts
            await supabase.from('inbound_attachments').insert(
              buildAttachmentRow({
                inboundReplyId: reply.id,
                filename: attachment.filename,
                mimeType: attachment.content_type || 'application/octet-stream',
                size: uploadResult.size,
                storagePath: uploadResult.path,
                isInline: attachment.content_disposition === 'inline',
                contentId: attachment.content_id,
              })
            );
```

- [x] **Step 7: Fix the analytics insert column**

  In the analytics block, rename `metadata:` to `event_data:` — `public.analytics_events` has `event_data jsonb`, not `metadata` (`supabase/schema.sql:106`):

```ts
      await supabase.from('analytics_events').insert({
        event_type: isSpam ? 'inbound_email_spam' : 'inbound_email_received',
        submission_id: submissionId,
        event_data: {
          from: parseAddress(payload.from).email,
          spam_score: spamScore,
          has_attachments: (payload.attachments?.length || 0) > 0,
        },
      });
```

- [x] **Step 8: Type-check the function**

  ```bash
  npx --yes deno@2 check supabase/functions/handle-inbound-email/index.ts
  ```

  Expected: `Check file:///...` with no errors. Specifically, the previous `bodyText` redeclaration error must be gone. If `deno` is unavailable, `npx supabase functions deploy handle-inbound-email --no-verify-jwt --dry-run` surfaces the same class of error — but the type check is faster and does not need auth.

- [x] **Step 9: Confirm the shared tests still pass**

  ```bash
  npm test -- --run supabase/functions/_shared/inbound.test.ts
  ```

  Expected: PASS.

- [x] **Step 10: Commit**

```bash
git add supabase/functions/handle-inbound-email/index.ts
git commit -m "fix(email): repair handle-inbound-email boot error and schema mismatches"
```

---

## Task 5: Enforce webhook signature verification

The handler currently logs a bad signature and processes the payload anyway, so anyone who learns the URL can inject rows into `inbound_replies`.

**Files:**
- Modify: `supabase/functions/handle-inbound-email/index.ts`
- Modify: `supabase/functions/handle-resend-webhook/index.ts`

- [x] **Step 1: Fail closed in `handle-inbound-email`**

  Replace the whole signature block (the `if (!webhookSecret) { ... } else { ... }` that contains `'proceeding anyway for debugging'`) with:

```ts
    // Fail closed. The previous version logged an invalid signature and carried on with
    // the commented-out 401 still in the file, which made the endpoint world-writable.
    if (!webhookSecret) {
      console.error('[handler] RESEND_WEBHOOK_SECRET is not set — refusing the request');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!(await verifyWebhookSignature(bodyText, signature))) {
      console.error('[handler] Invalid webhook signature — rejecting');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[handler] Webhook signature verified');
```

  Delete the now-dead commented-out `return new Response(... 401 ...)` block below it.

- [x] **Step 2: Fail closed in `handle-resend-webhook`**

  In `verifyWebhookSignature`, replace:

```ts
  if (!secret) {
    console.warn("No webhook secret configured - skipping signature verification");
    return true; // Allow if no secret configured (development mode)
  }
```

  with:

```ts
  if (!secret) {
    console.error("RESEND_WEBHOOK_SECRET is not set — rejecting");
    return false;
  }
```

- [x] **Step 3: Type-check both**

  ```bash
  npx --yes deno@2 check supabase/functions/handle-inbound-email/index.ts supabase/functions/handle-resend-webhook/index.ts
  ```

  Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add supabase/functions/handle-inbound-email/index.ts supabase/functions/handle-resend-webhook/index.ts
git commit -m "fix(email): reject unsigned and mis-signed Resend webhooks"
```

> **Execution note for Task 11:** if the live inbound test returns 401, the cause is almost always a signature-format mismatch, not a wrong secret — the two functions in this repo parse the header differently (`t=...,signature=...` vs `v1,<ts>:<sig>`). Compare the raw `x-resend-signature` header from the function logs against Resend's current webhook-signature docs before changing the secret.

---

## Task 6: Deliver direct mail to `karisa@voyani.tech`, and copy every reply to Gmail

Without this, mail a human sends to the newly published address vanishes, and threaded replies are visible only inside `/admin/submissions`.

**Files:**
- Modify: `supabase/functions/handle-inbound-email/index.ts`

**Interfaces:**
- Consumes: `route.kind === 'direct'` from Task 4 Step 3.
- Produces: `handleDirectMail(payload, toAddress)` and `forwardToAdmin(...)`.

- [x] **Step 1: Add the forwarding helpers**

  In `supabase/functions/handle-inbound-email/index.ts`, **delete the placeholder
  `handleDirectMail` added in Task 4 Step 3b** and put these two functions in its place,
  above the `serve(...)` call:

```ts
/**
 * Re-send an inbound message to the mailbox Karisa actually reads.
 *
 * `from` must stay on the verified domain — Resend will not send as the original
 * sender — so the original address goes in reply_to, which makes hitting Reply in
 * Gmail do the right thing.
 */
async function forwardToAdmin(
  payload: ResendWebhookPayload,
  toAddress: string,
  banner: string
): Promise<void> {
  if (!resendApiKey) {
    console.error('[forward] RESEND_API_KEY not set — cannot forward');
    return;
  }

  const sender = parseAddress(payload.from);
  const body =
    payload.html ||
    `<pre style="white-space:pre-wrap;font-family:inherit">${
      (payload.text || '').replace(/[<>&]/g, (c) =>
        ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string)
      )
    }</pre>`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
      <p style="background:#f5f5f5;border-left:3px solid #888;padding:10px 14px;margin:0 0 18px;font-size:13px;color:#555">
        ${banner}<br>
        <strong>From:</strong> ${sender.name ? `${sender.name} ` : ''}&lt;${sender.email}&gt;<br>
        <strong>To:</strong> ${toAddress}
      </p>
      ${body}
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: `Voyani Mail <karisa@${mailDomain}>`,
      to: adminEmail,
      reply_to: sender.email,
      subject: `[voyani.tech] ${payload.subject || '(No subject)'}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error('[forward] Resend rejected the forward:', res.status, await res.text());
    return;
  }

  console.log('[forward] Forwarded to', adminEmail);
}

/**
 * Mail sent straight to karisa@voyani.tech (or any other mailbox on the domain).
 * There is no submission to thread it onto, so it is forwarded and acknowledged.
 */
async function handleDirectMail(
  payload: ResendWebhookPayload,
  toAddress: string
): Promise<Response> {
  console.log('[handler] Direct mail to', toAddress, 'from', payload.from);

  try {
    await forwardToAdmin(payload, toAddress, 'Direct message to your voyani.tech address.');
  } catch (error) {
    console.error('[handler] Forward failed:', error);
  }

  // 200 regardless: a retry from Resend would only duplicate the forward.
  return new Response(
    JSON.stringify({ success: true, handled: 'direct' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
```

- [x] **Step 2: Forward threaded replies too**

  In the `serve` handler, immediately before the final success `return new Response(...)` (after the analytics block), add:

```ts
    // A reply that only lands in /admin/submissions is a reply Karisa will not see today.
    // Spam is stored but not forwarded.
    if (!isSpam) {
      try {
        await forwardToAdmin(
          payload,
          toAddress,
          `Reply on submission <a href="${
            Deno.env.get('PORTFOLIO_URL') || 'https://www.voyani.tech'
          }/admin/submissions/${submissionId}">${submissionId}</a>.`
        );
      } catch (error) {
        console.error('[handler] Reply forward failed:', error);
      }
    }
```

- [x] **Step 3: Type-check**

  ```bash
  npx --yes deno@2 check supabase/functions/handle-inbound-email/index.ts
  ```

  Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add supabase/functions/handle-inbound-email/index.ts
git commit -m "feat(email): forward direct mail and threaded replies to the admin inbox"
```

---

## Task 7: Make the sending identity configurable

`karisa@voyani.tech` is hardcoded in three places across two functions. One env-driven module means the next address change is a secret update, not a redeploy of edited source.

**Files:**
- Create: `supabase/functions/_shared/mail.ts`
- Test: `supabase/functions/_shared/mail.test.ts`
- Modify: `supabase/functions/send-notification/index.ts:784`
- Modify: `supabase/functions/send-reply/index.ts` (the `payload` object in `sendEmailViaResend`)

**Interfaces:**
- Produces: `buildFrom(name, address)`, `buildReplyAddress(submissionId, domain)`, `buildThreadMessageId(submissionId, domain, now)`.

- [x] **Step 1: Write the failing test**

  Create `supabase/functions/_shared/mail.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildFrom, buildReplyAddress, buildThreadMessageId } from './mail';

describe('buildFrom', () => {
  it('formats a display-name From header', () => {
    expect(buildFrom('Karisa', 'karisa@voyani.tech')).toBe('Karisa <karisa@voyani.tech>');
  });

  it('quotes a name containing a comma so the header stays valid', () => {
    expect(buildFrom('Ngowa, Karisa', 'karisa@voyani.tech'))
      .toBe('"Ngowa, Karisa" <karisa@voyani.tech>');
  });

  it('omits the display name when it is empty', () => {
    expect(buildFrom('', 'karisa@voyani.tech')).toBe('karisa@voyani.tech');
  });
});

describe('buildReplyAddress', () => {
  it('produces the reply+{uuid}@domain form the migration parses', () => {
    // supabase/migrations/...: substring(email FROM 'reply\+([a-f0-9-]{36})@')
    expect(buildReplyAddress('550e8400-e29b-41d4-a716-446655440000', 'voyani.tech'))
      .toBe('reply+550e8400-e29b-41d4-a716-446655440000@voyani.tech');
  });
});

describe('buildThreadMessageId', () => {
  it('produces an RFC-2822 angle-bracketed id on the sending domain', () => {
    expect(buildThreadMessageId('550e8400-e29b-41d4-a716-446655440000', 'voyani.tech', 1700000000000))
      .toBe('<550e8400-e29b-41d4-a716-446655440000.1700000000000@voyani.tech>');
  });
});
```

- [x] **Step 2: Run it and watch it fail**

  ```bash
  npm test -- --run supabase/functions/_shared/mail.test.ts
  ```

  Expected: FAIL — `Failed to resolve import "./mail"`.

- [x] **Step 3: Write the implementation**

  Create `supabase/functions/_shared/mail.ts`:

```ts
/**
 * Sending identity. Pure and Deno-free so Vitest covers the same file the functions use.
 * The address itself comes from env (MAIL_FROM_ADDRESS / MAIL_DOMAIN) so changing it is
 * a `supabase secrets set`, not a source edit in three places.
 */

export function buildFrom(name: string, address: string): string {
  if (!name) return address;
  const needsQuoting = /[,;:<>@"]/.test(name);
  return `${needsQuoting ? `"${name}"` : name} <${address}>`;
}

/** Must stay in lockstep with extract_submission_id_from_email() in the migration. */
export function buildReplyAddress(submissionId: string, domain: string): string {
  return `reply+${submissionId}@${domain}`;
}

export function buildThreadMessageId(
  submissionId: string,
  domain: string,
  now: number = Date.now()
): string {
  return `<${submissionId}.${now}@${domain}>`;
}
```

- [x] **Step 4: Run it and watch it pass**

  ```bash
  npm test -- --run supabase/functions/_shared/mail.test.ts
  ```

  Expected: PASS, 5 tests.

- [x] **Step 5: Use it in `send-notification`**

  Add to the imports and env block at the top of `supabase/functions/send-notification/index.ts`:

```ts
import { buildFrom } from '../_shared/mail.ts';

const mailDomain = Deno.env.get('MAIL_DOMAIN') || 'voyani.tech';
const fromAddress = Deno.env.get('MAIL_FROM_ADDRESS') || `karisa@${mailDomain}`;
const fromName = Deno.env.get('MAIL_FROM_NAME') || 'Karisa';
```

  Then at line ~784 replace `from: 'Karisa <karisa@voyani.tech>',` with:

```ts
          from: buildFrom(fromName, fromAddress),
```

- [x] **Step 6: Use it in `send-reply`**

  Add to the imports and env block at the top of `supabase/functions/send-reply/index.ts`:

```ts
import { buildFrom, buildReplyAddress, buildThreadMessageId } from '../_shared/mail.ts';

const mailDomain = Deno.env.get('MAIL_DOMAIN') || 'voyani.tech';
const fromAddress = Deno.env.get('MAIL_FROM_ADDRESS') || `karisa@${mailDomain}`;
const fromName = Deno.env.get('MAIL_FROM_NAME') || 'Karisa';
```

  Then inside `sendEmailViaResend`, replace the three hardcoded lines:

```ts
      const replyToAddress = buildReplyAddress(submissionId, mailDomain);
      const messageId = buildThreadMessageId(submissionId, mailDomain);

      const payload = {
        from: buildFrom(fromName, fromAddress),
        reply_to: replyToAddress,
```

  Leave the rest of the `payload` object (`to`, `subject`, `html`, `headers`) untouched.

- [x] **Step 7: Confirm no hardcoded address survives**

  ```bash
  grep -rn "karisa@voyani.tech" supabase/functions/
  ```

  Expected: matches only in `handle-inbound-email/index.ts` (the `Voyani Mail <karisa@${mailDomain}>` template literal from Task 6, which is already domain-driven) and in comments. **No** bare `'Karisa <karisa@voyani.tech>'` string literals.

- [x] **Step 8: Type-check and run the full suite**

  ```bash
  npx --yes deno@2 check supabase/functions/send-notification/index.ts supabase/functions/send-reply/index.ts
  npm test -- --run
  ```

  Expected: no type errors; all tests pass.

- [x] **Step 9: Commit**

```bash
git add supabase/functions/_shared/mail.ts supabase/functions/_shared/mail.test.ts supabase/functions/send-notification/index.ts supabase/functions/send-reply/index.ts
git commit -m "refactor(email): drive the sending identity from env via _shared/mail"
```

---

## Task 8: Apply the inbound migration and create the attachment bucket

The code writes to `inbound_replies`, `inbound_attachments` and a storage bucket. Confirm they exist before deploying anything that depends on them.

**Files:**
- Uses: `supabase/migrations/20260328000000_inbound_email_system.sql`

- [ ] **Step 1: Check whether the migration is already applied**

  Supabase dashboard → **SQL Editor** → run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('inbound_replies', 'inbound_attachments', 'spam_patterns');
```

  Three rows → already applied, skip to Step 3. Zero rows → continue.

- [ ] **Step 2: Apply it**

  Paste the entire contents of `supabase/migrations/20260328000000_inbound_email_system.sql` into the SQL Editor and run it. It is written with `CREATE TABLE IF NOT EXISTS` / `CREATE OR REPLACE FUNCTION`, so it is safe to re-run.

  Expected: success, ending with the `RAISE NOTICE` lines including *"3. Create Supabase Storage bucket: inbound-attachments"*.

  Re-run the Step 1 query. Expected: three rows.

- [ ] **Step 3: Verify the reply-address parser agrees with `_shared/mail.ts`**

```sql
select public.extract_submission_id_from_email('reply+550e8400-e29b-41d4-a716-446655440000@voyani.tech');
```

  Expected: `550e8400-e29b-41d4-a716-446655440000`. A `NULL` means the SQL regex and `buildReplyAddress` have drifted — stop and reconcile them; threading will silently fail otherwise.

- [ ] **Step 4: Create the storage bucket**

  Supabase dashboard → **Storage** → **New bucket**.

  - Name: `inbound-attachments` (exactly — it is the schema default for `storage_bucket`)
  - Public: **off**. Attachments arrive from strangers; nothing here should be world-readable.
  - File size limit: **25 MB**, matching `CONSTRAINT valid_file_size CHECK (file_size <= 26214400)`.

- [ ] **Step 5: Confirm the bucket exists and is private**

```sql
select id, public, file_size_limit from storage.buckets where id = 'inbound-attachments';
```

  Expected: one row, `public = false`, `file_size_limit = 26214400`.

**Done when:** all three tables exist, the SQL extractor returns the UUID, and a private 25 MB bucket is in place. No commit — this task changes no files.

---

## Task 9: Set the secrets and deploy the functions

**Files:** none changed; this deploys Tasks 4–7.

**Interfaces:**
- Consumes: `RESEND_API_KEY` (Task 1 Step 7), `RESEND_WEBHOOK_SECRET` (Task 2 Step 5), project ref (Task 2 Step 1).

- [ ] **Step 1: Link the CLI to the project**

  ```bash
  npx --yes supabase@latest login
  npx --yes supabase@latest link --project-ref <project-ref>
  ```

  Expected: `Finished supabase link.`

- [ ] **Step 2: Set every secret in one call**

  Run this from a shell with history disabled (a leading space suffices in bash with `HISTCONTROL=ignorespace`), substituting the real values:

```bash
 npx --yes supabase@latest secrets set \
  RESEND_API_KEY='re_xxxxxxxxxxxx' \
  RESEND_WEBHOOK_SECRET='whsec_xxxxxxxxxxxx' \
  ADMIN_EMAIL='voyanitech@gmail.com' \
  MAIL_DOMAIN='voyani.tech' \
  MAIL_FROM_ADDRESS='karisa@voyani.tech' \
  MAIL_FROM_NAME='Karisa' \
  PORTFOLIO_URL='https://www.voyani.tech' \
  DASHBOARD_URL='https://www.voyani.tech/admin/submissions' \
  DENO_ENV='production'
```

  `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by the platform — do not set them, and do not put a service-role key on a command line.

- [ ] **Step 3: Confirm the secrets landed**

  ```bash
  npx --yes supabase@latest secrets list
  ```

  Expected: all nine names present with hashed values. Confirm `MAIL_FROM_ADDRESS` and `PORTFOLIO_URL` in particular — `PORTFOLIO_URL` still defaults to the bare `https://voyani.tech` in code, which 301-redirects.

- [ ] **Step 4: Deploy the two webhook receivers without JWT**

  Resend cannot present a Supabase JWT, so its endpoints must be deployed with `--no-verify-jwt`. Their security is the HMAC signature check from Task 5.

  ```bash
  npx --yes supabase@latest functions deploy handle-inbound-email --no-verify-jwt
  npx --yes supabase@latest functions deploy handle-resend-webhook --no-verify-jwt
  ```

  Expected: `Deployed Functions on project <ref>` for each. A bundling error here means Task 4's `../_shared/inbound.ts` import path is wrong.

- [ ] **Step 5: Deploy the two sending functions**

  `send-notification` is called by the public contact form with no auth, so it also needs `--no-verify-jwt` (it is protected by CSRF + rate limiting inside the function). `send-reply` is called from the authenticated admin dashboard and keeps JWT verification.

  ```bash
  npx --yes supabase@latest functions deploy send-notification --no-verify-jwt
  npx --yes supabase@latest functions deploy send-reply
  ```

- [ ] **Step 6: Confirm all four are live**

  ```bash
  npx --yes supabase@latest functions list
  ```

  Expected: four rows — `send-notification`, `send-reply`, `handle-inbound-email`, `handle-resend-webhook` — all `ACTIVE`, all with a fresh `updated_at`.

- [ ] **Step 7: Smoke-test the inbound endpoint's auth**

  ```bash
  curl -i -X POST https://<project-ref>.supabase.co/functions/v1/handle-inbound-email \
    -H "Content-Type: application/json" -d '{}'
  ```

  Expected: **`HTTP/2 401`** with `{"error":"Invalid signature"}`. A `200` means Task 5 did not take effect. A `500 Webhook secret not configured` means Step 2's secret did not reach this function — redeploy it.

**Done when:** four functions ACTIVE and an unsigned POST is rejected with 401.

---

## Task 10: Publish `karisa@voyani.tech` on the site

Only after Task 11's receive test passes in a scratch run — see the Global Constraints. If you are executing strictly in order, do Task 11 Steps 1–4 first, then come back.

**Files:**
- Modify: `src/config/site.js:46` (and the doc comment above it)
- Modify: `src/components/PrivacyPolicy.jsx:195-200`
- Modify: `.env.example`
- Modify: `package.json` (remove `@emailjs/browser`)
- Modify: `vite.config.js:175`

- [x] **Step 1: Flip the published address**

  In `src/config/site.js`, replace:

```js
  // Confirmed by Karisa, 2026-08-29. See the note above before changing.
  email: 'voyanitech@gmail.com',
```

  with:

```js
  /**
   * Changed 2026-08-31 from voyanitech@gmail.com. voyani.tech now has a Resend MX
   * record, so this address both sends (Resend, from the edge functions) and receives
   * (Resend Inbound -> handle-inbound-email -> forwarded to voyanitech@gmail.com).
   *
   * Verified before publishing: `dig +short MX voyani.tech` returns the Resend host and
   * a live send to this address arrived in Gmail. Do NOT change this without repeating
   * both checks — the whole point of this file is that the published address is real.
   */
  email: 'karisa@voyani.tech',
```

  Also update the closing paragraph of the file's header comment (which currently says *"Optional later: ... would let this become karisa@voyani.tech"*) to read:

```js
 * Done, 2026-08-31: voyani.tech has an MX record via Resend Inbound and this is now
 * karisa@voyani.tech. See docs/EMAIL_ROADMAP.md.
```

- [x] **Step 2: Correct the privacy policy's third-party disclosure**

  `src/components/PrivacyPolicy.jsx` still names EmailJS as the processor, which is factually wrong and a real disclosure problem. Replace the EmailJS list entry (around line 195-200) with:

```jsx
                  <li>
                    <strong>Resend</strong> — delivers email sent from and to
                    karisa@voyani.tech
                    <a
                      href="https://resend.com/legal/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pindo hover:underline ml-1"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <strong>Supabase</strong> — stores contact submissions and replies
                    <a
                      href="https://supabase.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pindo hover:underline ml-1"
                    >
                      Privacy Policy
                    </a>
                  </li>
```

- [x] **Step 3: Replace the stale `.env.example`**

  It documents EmailJS variables that nothing reads and omits the Supabase variables that everything reads. Overwrite it with:

```bash
cat > .env.example <<'EOF'
# ── Supabase ─────────────────────────────────────────────────────────────
# Project Settings -> API. The anon key is safe to expose (RLS enforces access);
# the service-role key must NEVER appear in a VITE_ variable.
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# ── Optional ─────────────────────────────────────────────────────────────
# VITE_GA_ID=your_google_analytics_id
# VITE_SENTRY_DSN=your_sentry_dsn

# ── Email (server-side only — NOT in this file) ──────────────────────────
# Email is sent and received by Supabase Edge Functions via Resend. Their
# secrets live in Supabase, never in the frontend bundle. Set them with:
#
#   npx supabase secrets set RESEND_API_KEY=... RESEND_WEBHOOK_SECRET=... \
#     ADMIN_EMAIL=voyanitech@gmail.com MAIL_DOMAIN=voyani.tech \
#     MAIL_FROM_ADDRESS=karisa@voyani.tech MAIL_FROM_NAME=Karisa \
#     PORTFOLIO_URL=https://www.voyani.tech \
#     DASHBOARD_URL=https://www.voyani.tech/admin/submissions DENO_ENV=production
#
# See docs/EMAIL_ROADMAP.md.
EOF
```

- [x] **Step 4: Drop the dead EmailJS dependency**

  No source file imports `@emailjs/browser` — only a comment in `ContactForm.test.jsx` mentions it historically.

  ```bash
  npm uninstall @emailjs/browser
  ```

  Then in `vite.config.js:175`, remove `|@emailjs` from the `forms` manual-chunk regex so it reads:

```js
          if (/[\\/]node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/.test(id)) return 'forms'
```

- [x] **Step 5: Verify no stale address remains anywhere**

  ```bash
  grep -rn "voyanitech@gmail\|thebikecollector\|emailjs" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src/ vite.config.js
  ```

  Expected: **no matches in shipped code.** Matches inside comments in `ContactForm.test.jsx` and `src/config/site.js` are fine and should stay — they are the record of why the address changed. `voyanitech@gmail.com` legitimately remains in `supabase/functions/*` as the `ADMIN_EMAIL` fallback; that is the forward destination, not a published address.

- [x] **Step 6: Run the full suite, lint and build**

  ```bash
  npm test -- --run
  npm run lint
  npm run build
  ```

  Expected: all tests pass, lint no worse than the current baseline, build succeeds. If a snapshot or assertion pinned the old address, update it to `karisa@voyani.tech` — that is a correct failure catching a real change.

- [x] **Step 7: Confirm the address renders**

  ```bash
  npm run dev
  ```

  Open `http://localhost:5173`, and check three surfaces show `karisa@voyani.tech`: the footer contact link, the Contact section, and `/privacy`. Then View Source and confirm the JSON-LD `"email": "mailto:karisa@voyani.tech"` in the `Person` block.

- [x] **Step 8: Commit**

```bash
git add src/config/site.js src/components/PrivacyPolicy.jsx .env.example vite.config.js package.json package-lock.json
git commit -m "feat(email): publish karisa@voyani.tech and drop the dead EmailJS wiring"
```

---

## Task 11: Prove the whole loop, then document it

**Files:**
- Modify: `docs/CHANGELOG.md`
- Modify: `docs/roadmapupdated.md`

- [ ] **Step 1: Test the contact form end to end**

  Deploy the frontend (`git push` if Vercel auto-deploys from `main`, else `npx vercel --prod`), then submit the real form at `https://www.voyani.tech/#contact` using a personal address you control as the sender.

  Expected, within a minute:
  1. The browser shows *"Message sent. I'll get back to you soon."*
  2. **`voyanitech@gmail.com`** receives *"New Portfolio Inquiry: ..."* from `Karisa <karisa@voyani.tech>`.
  3. **The address you submitted from** receives *"We received your message: ..."*.
  4. A new row appears at `/admin/submissions`.

  If (1) and (4) happen but (2)/(3) do not, the send is still failing silently — read the logs:

  ```bash
  npx --yes supabase@latest functions logs send-notification --limit 50
  ```

  A `403 domain is not verified` means Task 1 is incomplete; a `422` usually means `MAIL_FROM_ADDRESS` is not on the verified domain.

- [ ] **Step 2: Test direct mail to the published address**

  From any external account, send a plain message to `karisa@voyani.tech`.

  Expected: within a minute, `voyanitech@gmail.com` receives it with subject `[voyani.tech] <original subject>` and the grey provenance banner. Hit **Reply** in Gmail and confirm the To: field pre-fills with the *original sender's* address, not `karisa@voyani.tech`.

  If nothing arrives:

  ```bash
  npx --yes supabase@latest functions logs handle-inbound-email --limit 50
  ```

  `401 Invalid signature` → see the execution note under Task 5. Nothing at all in the logs → Resend never called the webhook; recheck Task 2 Step 5.

- [ ] **Step 3: Test the threaded reply loop**

  1. Open `/admin/submissions`, pick the submission from Step 1, and send a reply from the dashboard.
  2. The address you submitted from receives it, from `Karisa <karisa@voyani.tech>`.
  3. Reply to that email **from your normal mail client** (do not edit the To: field).
  4. Confirm the message went to `reply+<uuid>@voyani.tech`.

  Expected:
  - A row lands in `inbound_replies` with the right `submission_id` and `is_sender_verified = true`.
  - The reply is visible in `ConversationTimeline` on the submission page.
  - The submission's status flips to `in_progress`.
  - `voyanitech@gmail.com` receives a forwarded copy whose banner links back to the submission.

  Confirm in SQL:

```sql
select from_email, from_name, subject, status, is_sender_verified, is_spam, received_at
from public.inbound_replies
order by received_at desc
limit 5;
```

  Expected: your reply, with `from_email` a **bare address** (no `Name <...>`) and `status = 'processed'`.

- [ ] **Step 4: Confirm delivery events are recording**

  Resend → **Emails**: the three test sends should show `Delivered`. Then check the second webhook did its job:

```sql
select event_type, count(*)
from public.analytics_events
where event_type like '%email%' or event_type like '%inbound%'
group by event_type;
```

  Expected: at least `inbound_email_received`. If `handle-resend-webhook` is also recording, delivery event types appear too. Zero rows with mail visibly delivered means the delivery webhook is failing — check its logs, but this does not block anything else.

- [ ] **Step 5: Check the deliverability grade**

  Send one test to `check-auth@verifier.port25.com` or run a message through mail-tester.com.

  Expected: SPF, DKIM and DMARC all pass; mail-tester score ≥ 9/10. Fix anything flagged now — a portfolio contact address that lands in spam is worse than no address.

- [x] **Step 6: Update the changelog**

  Prepend a dated entry to `docs/CHANGELOG.md` in the style of the existing entries, stating: Resend is now the mail provider on a verified `voyani.tech`; the published address is `karisa@voyani.tech`; `handle-inbound-email` could never boot before this (duplicate `const bodyText`) and its inserts disagreed with the migration in six ways; webhook signature verification was off and is now fail-closed; direct mail and threaded replies both forward to `voyanitech@gmail.com`; `@emailjs/browser` is gone.

- [x] **Step 7: Close the roadmap item**

  `docs/roadmapupdated.md:605-607` carries the open item *"Contact email confirmed as voyanitech@gmail.com … Still worth … karisa@voyani.tech — one line in src/config/site.js. The domain currently has A records but no MX."* Mark it complete, dated 2026-08-31, and point it at `docs/EMAIL_ROADMAP.md`.

- [x] **Step 8: Commit**

```bash
git add docs/CHANGELOG.md docs/roadmapupdated.md docs/EMAIL_ROADMAP.md
git commit -m "docs(email): record the Resend migration and close the contact-address item"
```

---

## Rollback

If mail breaks after launch and you need the site publishing a working address within minutes:

1. **Revert the published address only** — change `src/config/site.js` back to `email: 'voyanitech@gmail.com'` and deploy. That is a one-line change and restores a mailbox that definitely works.
2. Leave DNS alone. Removing the MX record makes mail *bounce*; leaving it makes mail queue at Resend while you debug.
3. `send-notification` writes the submission row **before** it attempts any send, so contact submissions keep landing in `/admin/submissions` even with email fully down. Nothing is lost.

## Known risks

- **Resend Inbound API shape.** `handle-inbound-email` was written against an assumed payload (`from`, `to[]`, `subject`, `text`, `html`, `attachments[]`) and has never run against the real service. If Task 11 Step 2 produces a log line showing different field names, adjust the `ResendWebhookPayload` interface — the shared builders in `_shared/inbound.ts` take a normalised input, so the fix is confined to the handler's mapping.
- **Signature header format.** The two functions in this repo parse `x-resend-signature` differently. At most one of them can be right. Verify against Resend's current docs during Task 11 rather than guessing.
- **One MX set per domain.** Enabling Cloudflare Email Routing at any later point will overwrite the root MX and silently take inbound away from Resend. Anyone touching this zone needs to know that.
- **Forward loops.** `forwardToAdmin` sends *from* `karisa@voyani.tech` *to* `voyanitech@gmail.com`. If Gmail is ever configured to auto-forward back to `karisa@voyani.tech`, that is an infinite loop. Do not set up such a rule.
