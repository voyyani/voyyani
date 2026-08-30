# Site Audit — Post-Roadmap, Pre-Launch

**Date:** 2026-08-30
**Auditor:** Claude, for Ngowa Karisa
**Scope:** (a) did the roadmap achieve its stated goals, (b) what stands between this site and ranking.
**Method:** every claim below was checked against the live site or the working tree on 2026-08-30. Nothing is carried over from `roadmapupdated.md`'s own status notes.

> **Relationship to the old `AUDIT.md`:** this does not resurrect it. That file rated the
> site "9.0/10 world-class" with no evidence and is archived in [`archive/`](./archive/).
> This document rates nothing. It reports measurements and what is still broken.

---

## 1. Headline finding

**The site is live and looks like the redesign — but the most recent work is not deployed, and the site is invisible to every crawler that does not execute JavaScript.**

Two separate problems, in priority order:

1. **`origin/main` is 7 commits behind local `main`.** Vercel is serving commit `09a8856` from the `phase-0-foundation-and-truth` branch. The entire Phase 5 pass — the WCAG contrast fixes, the skip-to-content link, the canonical reconciliation, the sitemap rewrite, two security fixes, and the test suite going 10 failures → 0 — **exists only on this machine**. It is on no remote.
2. **The HTML served to crawlers is an empty `<div id="root">`.** Everything that matters for SEO and sharing — the real title, description, canonical, Open Graph tags, Twitter card, and both JSON-LD blocks — is injected client-side by `react-helmet-async`. None of it is in the response.

The second is the one that blocks the "rank top" goal, and no amount of content or keyword work fixes it while it stands.

---

## 2. Deployment state

| Ref | Commit | What it holds |
|---|---|---|
| `origin/main` | `c4b52e4` | Pre-revamp CRM commit. **Still.** |
| `origin/phase-0-foundation-and-truth` | `09a8856` | Phases 0–3 + `vercel.json` SPA rewrite. **This is what is live.** |
| local `main` | `da6e7ac` | Everything above **plus all of Phase 5**. On no remote. |

Verified live on 2026-08-30:

```
https://www.voyani.tech          200   theme-color #0B0B0C   ← Phase 2 design IS live
https://www.voyani.tech/admin/login  200                     ← SPA rewrite IS working
https://voyani.tech              307 → www.voyani.tech        ← still a 307, not a 301
```

The 307 is expected: the `301` redirect was added to `vercel.json` in `da6e7ac`, which is not deployed. **Unverified risk:** if the apex domain is configured as a *dashboard-level* domain redirect in Vercel, the `vercel.json` rule will never fire and the 307 will persist after deploying. That has to be checked in the Vercel UI, not from the repo.

---

## 3. SEO audit — what actually blocks ranking

### 3.1 CRITICAL — Nothing is server-rendered

This is the complete body served to every crawler:

```html
<body>
  <div id="root"></div>
</body>
```

And the complete `<head>` contains: charset, favicon, manifest, viewport, theme-color, one generic `<meta name="description">`, and a static `<title>`. That is all.

**What is missing from the served HTML:** `<link rel="canonical">`, every `og:*` tag, every `twitter:*` tag, both `application/ld+json` blocks (Person and WebSite schema), and the real per-page title and description. All are rendered by `SEO.jsx` via Helmet — client-side only.

**Consequences, in order of severity:**

- **Every social share is broken right now.** LinkedIn, X/Twitter, Facebook, Slack, WhatsApp and iMessage do *not* execute JavaScript. They read the raw HTML, find no `og:image` and no `og:title`, and render a bare link with the generic fallback description. `og-image.jpg` exists and returns 200 — it is simply never referenced in anything a crawler can see. For a portfolio whose distribution plan is "share the write-ups where technical communities read them," this defeats the plan before it starts.
- **The structured data does not count.** Google's rich-results and knowledge-panel signals come from the Person/WebSite JSON-LD. Injected post-render, it is unreliable at best.
- **Googlebot can render JS, but it is a deferred second pass** with a queue, and it is the *only* major crawler that does it well. Bing, DuckDuckGo and every AI crawler see an empty page.

**Fix (highest ROI item in this document):** this is effectively a one-page marketing site, so it does not need a framework migration. Hard-code the full meta block — canonical, OG, Twitter, and the JSON-LD — directly into `index.html`. Keep `SEO.jsx` for the routes Phase 4 will add. That is a ~30-line change with near-zero risk that immediately fixes social sharing and gives crawlers real metadata. Prerendering (`vite-prerender-plugin` or similar) is the better long-term answer once `/writing/*` exists and each post needs its own tags.

### 3.2 HIGH — The live `sitemap.xml` and `robots.txt` are both wrong

Live `sitemap.xml` (still the pre-Phase-5 version):

- Uses the bare host `https://voyani.tech/`, **which 307-redirects**. A sitemap that lists redirecting URLs asks Google to index a hop.
- Four of its five entries are `#fragment` URLs (`/#skills`, `/#projects`, `/#philosophy`, `/#contact`). Search engines do not treat a fragment as a separate document, so those entries are inert — the sitemap effectively declares one page.
- Every `lastmod` reads `2026-01-20`, seven months stale.

Live `robots.txt` points `Sitemap:` at `https://voyani.tech/sitemap.xml` — the redirecting host again — and is dated `2026-01-20`.

The sitemap fix is already written in `da6e7ac` and just needs deploying. **`robots.txt` is not yet fixed** — its `Sitemap:` line still needs updating to the `www` host.

### 3.3 HIGH — Every URL returns 200, including ones that do not exist

```
https://www.voyani.tech/nonexistent-page  →  200 (homepage content)
https://www.voyani.tech/writing           →  200 (homepage content)
```

This is a side effect of the SPA rewrite added in `09a8856` — necessary for `/admin/*` and for Phase 4's `/writing/*`, but it now means **any** path serves the homepage with a 200. That is a soft-404: search engines can index unlimited garbage URLs, all with duplicate homepage content.

It also catches non-HTML URLs, which is worse than the SEO cost alone:

```
/Ngowa-Karisa-Resume.pdf   200  text/html         1,564 bytes   ← not yet deployed
/Karisa-Voyani-Resume.pdf  200  application/pdf   3,116,347 bytes
/totally-fake.pdf          200  text/html         1,564 bytes
```

A `.pdf` URL that does not exist returns an HTML page with a `200`, byte-identical to a
made-up filename. Nothing tells the browser or the visitor that the file is missing — the
download simply produces a corrupt-looking file. **This becomes live the moment the rename
in §3.6 deploys**, for anyone holding a link to the old résumé filename.

**Fix:** add a catch-all `*` route in `App.jsx` rendering a real 404 page with `<meta name="robots" content="noindex">`, and narrow the `vercel.json` rewrite so it does not swallow paths carrying a file extension. A true HTTP 404 status is not achievable from a static SPA, so the noindex tag is the correct mitigation for the HTML case.

### 3.6 MEDIUM — The identity rename is clean in the repo, but changes the résumé URL

The published name changed from "Karisa Voyani" to **Ngowa Karisa** during this audit. The rename itself was done properly — verified across the working tree:

- `site.js`, `SEO.jsx` (including both JSON-LD blocks), `index.html` title and description, and the headshot `alt` text are all consistent.
- The PDF was renamed on disk too: `public/Ngowa-Karisa-Resume.pdf` exists.
- **Zero** stale `Karisa Voyani` or `Karisa-Voyani-Resume.pdf` references remain in `src/`, `public/` or `index.html`.
- Suite still green after the rename: 169 passing, 0 failing; build clean.

Two consequences worth tracking:

1. **The résumé URL changes**, and per §3.3 the old one will silently serve HTML rather than 404. If that link has been shared anywhere, add a `vercel.json` redirect from the old filename to the new one.
2. **Search Console will see a name change** on the site's primary entity. Existing rankings for "Karisa Voyani" will not transfer automatically to "Ngowa Karisa." Both names should appear in the Person JSON-LD — schema.org supports `alternateName` — so the two identities are explicitly linked rather than competing.

### 3.4 MEDIUM — Search Console verification never renders

`SEO.jsx:17-20` reads `VITE_GOOGLE_VERIFICATION` and `VITE_BING_VERIFICATION`. Neither is set in Vercel. Both are optional-guarded so nothing breaks, but the verification `<meta>` never renders — and per §3.1 it would not reach a crawler even if it did. Use the DNS TXT verification method in Search Console instead; it does not depend on the page at all.

### 3.5 What is already correct

Credit where due — these were checked and pass:

- **Heading structure is sound.** Exactly one `<h1>` on the homepage (the Hero headline, as `<motion.h1>`, with an `sr-only` span carrying name and location), and one `<h2>` per section. The Phase 1 fix that demoted the navbar wordmark from `<h1>` held.
- **HTTPS + HSTS** enabled (`max-age=63072000`).
- **Brotli compression** active on HTML and all assets.
- Résumé PDF, headshot (jpg/webp/avif), `og-image.jpg`, manifest and favicons all return 200.

---

## 4. Performance audit

> Real Lighthouse scores are still **not** recorded. There is no Chrome in the working sandbox (Playwright's cache holds `chromium-1234`; the library wants `1208`), so the numbers below are direct measurements, not a Lighthouse run. Roadmap Phase 5 item 1 remains genuinely open.

### 4.1 HIGH — Content-hashed assets are not cached

```
/assets/react-vendor-BI3NJeJA.js
  cache-control: public, max-age=0, must-revalidate
```

Every filename already contains a content hash, so these files can never change under a given URL — they should be `max-age=31536000, immutable`. As configured, a returning visitor revalidates **every** asset on **every** visit. This is a straightforward Lighthouse "efficient cache policy" failure and a real repeat-visit latency cost.

**Fix:** add a `headers` block to `vercel.json` for `/assets/(.*)`.

### 4.2 HIGH — The chunk splitting does not work

Live entry chunk: **821,362 bytes raw / ~248 KB brotli.**

Meanwhile `react-vendor` — which `vite.config.js` explicitly configures as `['react', 'react-dom']` — is **11 KB**. React DOM is not in it. Its bulk has landed in the entry chunk instead, because `react-dom/client` resolves through a different module id than the bare `react-dom` specifier the `manualChunks` map matches.

The practical effect: the single largest blocking resource on first paint contains React DOM, the router, Supabase's client, and the entire admin bundle, none of which a first-time visitor to the homepage needs.

**Fix:** switch `manualChunks` from the object form to the function form and match on `node_modules` path segments. Separately, the `/admin/*` routes are imported eagerly at the top of `App.jsx` — lazy-loading them the way the public sections already are would take a meaningful slice out of the entry chunk on its own.

### 4.3 MEDIUM — The résumé PDF is 3.1 MB

`/Ngowa-Karisa-Resume.pdf` is 3,116,347 bytes. It is not on the critical path, but 3 MB is a slow download on the Kenyan mobile connections a portion of this audience is on. Re-exporting with compressed images would likely land it under 500 KB.

---

## 5. Roadmap goal audit — did we achieve what we set out to?

Checked against the working tree and the live site, not against the roadmap's own status markers.

| Phase | Claimed | Verified | Notes |
|---|---|---|---|
| **0 — Foundation & Truth** | ✅ Done (2 partial) | ✅ **Confirmed** | Headshot, résumé, `site.js`, admin link removed, dead stubs deleted — all present. The two partials are real and unchanged: Raslipwani has no screenshots, CAD Viewer has no visual. |
| **0.5 — Doc consolidation** | ✅ Done | ✅ **Confirmed** | `docs/` holds a small current set plus `archive/`. |
| **1 — Narrative & Copy** | ✅ Done | ✅ **Confirmed** | `About.jsx` exists, hero headline is fixed not rotating, no percentage skill bars, no vanity metrics. |
| **2 — Visual Identity** | ✅ Done | ✅ **Confirmed live** | The deployed site serves `#0B0B0C`, Archivo + JetBrains Mono, square corners, no blobs. |
| **3 — Proof Systems** | ✅ Done (1 blocked) | ⚠️ **Partly** | GitHub activity section and both SVG diagrams are real. Task 4 (admin screen captures) still blocked on Karisa's credentials. |
| **4 — Content & Trust** | 🟡 Designed | ❌ **Not built** | Spec committed. **Zero code.** No `Testimonials.jsx`, no `/writing`, no write-ups. |
| **5 — Technical Polish** | 🟡 In progress | ⚠️ **Built, not deployed** | Items 2/3/5 done and committed. Item 1 (Lighthouse) genuinely open. **None of it is live.** |

### 5.1 Success metrics from `roadmapupdated.md` §10

| Metric | Status |
|---|---|
| Every project has ≥1 real screenshot | ❌ **1 of 2.** Neema has 5; Raslipwani has none (client maintenance). |
| Résumé downloadable from live site | ✅ Verified 200 |
| Zero placeholder URLs in shipped content | ✅ |
| No public `/admin` link | ✅ Not in `LINKS` |
| About section exists | ✅ |
| 2 testimonials live | ❌ **0** — Phase 4 not built |
| 2 deep-dive write-ups live | ❌ **0** — Phase 4 not built |
| Visual design distinguishable from template | ✅ Live |
| Real Lighthouse scores recorded | ❌ Still not run |
| Every published contact address receives mail | ✅ `voyanitech@gmail.com` everywhere |

**Score: 6 of 10 met.** The four outstanding all trace to two causes — Phase 4 was never built, and no Lighthouse run has happened.

Worth being precise about what that score does and does not mean. Six of these are *content-truthfulness* metrics, and the roadmap hit every one it could reach without another person's cooperation. The failures are not sloppiness: two need clients to reply, one needs a client site to come out of maintenance, and one needs a browser this environment does not have. The roadmap's own goals were largely met.

What the score does not capture is that **none of these metrics ask whether anyone can find the site** — which is the subject of §3 and the reason this audit exists.

### 5.2 Where the roadmap was right, and where it under-delivered

**Right:** refusing to fabricate testimonials, pulling the CAD Viewer rather than shipping a project with no visual, replacing skill percentages with where-it-shipped, and killing the vanity metrics. The site's claims are now defensible, which was the entire point of Phase 0–1.

**Under-delivered:** the roadmap optimised hard for *truthfulness* of on-page content and never audited the *delivery layer*. Nothing in Phases 0–5 asked whether a crawler or a social card could see any of that carefully-verified content. That gap is §3.1, and it is why a site with genuinely good content has no distribution.

---

## 6. What to do, in order

### Before anything else

1. **`git push origin main`.** 7 commits, including all of Phase 5. Nothing below matters until the work is on the remote and deployed.
2. **Verify in the Vercel dashboard** that the production branch is `main` — it is currently deploying `phase-0-foundation-and-truth`. Otherwise pushing `main` changes nothing.

### Then — the SEO unblock (highest ROI in this document)

3. **Bake the meta block into `index.html`** — canonical, OG, Twitter card, Person + WebSite JSON-LD. Fixes social sharing immediately and gives non-JS crawlers real metadata. ~30 lines, near-zero risk.
4. **Add a 404 route** with `noindex`, so `/anything` stops returning the homepage with a 200.
5. **Fix `robots.txt`** — point `Sitemap:` at the `www` host.
6. **Confirm the apex 301 actually fires** after deploy; if not, fix the redirect in the Vercel domain settings.
7. **Handle the rename (§3.6):** add `alternateName: "Karisa Voyani"` to the Person JSON-LD so the two identities are linked rather than competing, and add a `vercel.json` redirect from `/Karisa-Voyani-Resume.pdf` to the new filename if that link was ever shared.

### Then — performance

8. **`cache-control: immutable`** for `/assets/*` in `vercel.json`.
9. **Fix `manualChunks`** and lazy-load the `/admin/*` routes out of the entry chunk.
10. **Run a real Lighthouse** from your browser's DevTools against the deployed site and paste the numbers in — Phase 5's Definition of Done needs them and nothing here substitutes.

### Then — the content that ranks

11. **Build Phase 4.** Two write-ups at their own indexable URLs are the only pages this site would have that target searchable technical queries. The homepage ranks for "Ngowa Karisa" and essentially nothing else; a post titled *"cutting load time from 3s to 1.2s"* with real numbers is the kind of page that earns links. This is now the single highest-value remaining work, and steps 3–4 are what make it able to rank at all.
12. **Email the two clients** for testimonials — still the only item gated on someone else.

### Honest note on "rank top"

Ranking is competitive and query-dependent, and no audit can promise a position. What is achievable and worth stating plainly: `voyani.tech` should rank #1 for "Ngowa Karisa" and related name queries once §3.1 and §3.2 are fixed — that is largely mechanical. Ranking for competitive generic terms like "full-stack developer Kenya" is a months-long content-and-links effort, and the two Phase 4 write-ups are the correct first move, not more homepage keyword tuning.

---

## 7. Verification state of this document

- Live-site claims: checked against `https://www.voyani.tech` on 2026-08-30 via HTTP.
- Repo claims: checked against the working tree at `da6e7ac`.
- Test/lint/build: `169 passing, 3 skipped, 0 failing`; lint `88 problems`; build green — all re-run locally after the Ngowa Karisa rename, on `da6e7ac` plus the uncommitted rename, **not** on the deployed commit.
- Rename consistency: `grep` across `src/`, `public/` and `index.html` returns zero stale `Karisa Voyani` / `Karisa-Voyani-Resume.pdf` references.
- **Not verified:** real Lighthouse scores, Core Web Vitals field data, current Search Console coverage, and whether the apex→www 301 in `vercel.json` will override the existing Vercel domain redirect.

### One correction made while writing this

An earlier pass of this audit was about to report "the homepage has no `<h1>`," based on a `grep` for `<h1`. That was wrong: the Hero headline is `<motion.h1>`, which the pattern missed. Heading structure is correct and is recorded as such in §3.5. Noting it because an audit that reports a false critical finding is worse than one that reports nothing.
