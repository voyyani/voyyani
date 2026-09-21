#!/usr/bin/env node
/**
 * Capture the project-card screenshots from a live site, the same way for every
 * project so the cards read as one system: 1440×900 viewport @2x, PNG into
 * public/images/projects/<slug>/. Follow with scripts/convert-screenshots.mjs to
 * produce the served jpg/webp/avif set.
 *
 * Usage: node scripts/capture-screenshots.mjs <slug>
 * Slugs and their pages are listed in SITES below; add a project there.
 *
 * What the extra steps are for (learned on the Raslipwani capture):
 *  - `networkidle` alone is not enough: webfonts and lazy-loaded images finish after
 *    it fires, so we wait on document.fonts and scroll the page once to trigger
 *    IntersectionObserver loaders, then scroll back to the top.
 *  - Fade-in images animate from opacity 0 when their src is cached, so the frame can
 *    land mid-transition. We force every <img> to opacity 1 before shooting.
 *  - A second load of each page runs against a warm font/image cache, which removes
 *    the FOUT frames we otherwise saw on first load.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const SITES = {
  neema: {
    base: 'https://www.neemafoundationkilifi.org',
    pages: [
      ['home', '/'],
      ['programs', '/programs'],
      ['donate', '/donate'],
      ['media', '/media'],
      ['volunteer', '/volunteer'],
    ],
  },
  raslipwani: {
    base: 'https://raslipwani.co.ke',
    pages: [
      ['home', '/'],
      ['properties', '/properties'],
      ['services', '/services'],
      ['viewing', '/services/viewing'],
      ['about', '/about'],
      // 'property' is a listing modal opened from /properties — captured by hand.
    ],
  },
  cultureszn: {
    // Captured from `vite preview` of ~/projects/cultureszn (same build the live site
    // serves) because www.cultureszn.com 404s deep routes on direct load as of
    // 2026-09-21. Switch to the live base once that routing fix ships. `?motion=off`
    // is the site's own flag for deterministic frames.
    base: process.env.CAPTURE_BASE ?? 'http://localhost:4173',
    pages: [
      ['home', '/?motion=off'],
      ['release', '/releases/6-am?motion=off'],
      ['artist', '/artists/xiix?motion=off'],
      ['releases', '/releases?motion=off'],
      ['sznals', '/sznals?motion=off'],
      ['join', '/join?motion=off'],
    ],
  },
};

const slug = process.argv[2];
const site = SITES[slug];
if (!site) {
  console.error(`usage: capture-screenshots.mjs <${Object.keys(SITES).join('|')}>`);
  process.exit(1);
}

const outDir = `public/images/projects/${slug}`;
mkdirSync(outDir, { recursive: true });

const settle = async (page) => {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  // Sites with `scroll-behavior: smooth` animate scrollTo, which can leave the frame
  // mid-scroll; make every scroll instant for the capture.
  await page.addStyleTag({ content: 'html, body { scroll-behavior: auto !important; }' });
  // Walk the page so lazy images load, then return to the top for the capture.
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((img) =>
        img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })
      )
    )
  );
  await page.addStyleTag({ content: 'img { opacity: 1 !important; transition: none !important; }' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => window.scrollY === 0);
  await page.waitForTimeout(600);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: 'en-GB',
});
const page = await ctx.newPage();

for (const [name, path] of site.pages) {
  const url = site.base + path;
  await page.goto(url, { waitUntil: 'networkidle' });
  await settle(page);
  // Warm cache, then shoot the second render.
  await page.reload({ waitUntil: 'networkidle' });
  await settle(page);
  const out = `${outDir}/${name}.png`;
  await page.screenshot({ path: out });
  console.log(`${name.padEnd(12)} ${url} → ${out}`);
}

await browser.close();
