/**
 * Convert raw 2880×1800 Playwright captures into the served set: 1600-wide
 * jpg (q80, progressive) + webp (q80) + avif (q60), matching the Neema assets.
 * Usage: node scripts/convert-screenshots.mjs public/images/projects/<slug>
 * Requires `sharp` (install ad hoc: npm i --no-save sharp). Deletes the .png on success.
 */
import sharp from 'sharp';
import { readdirSync, unlinkSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: convert-screenshots.mjs <dir>'); process.exit(1); }

for (const f of readdirSync(dir).filter((n) => n.endsWith('.png'))) {
  const src = join(dir, f);
  const base = join(dir, f.replace(/\.png$/, ''));
  const img = sharp(src).resize({ width: 1600 });
  await img.clone().jpeg({ quality: 80, progressive: true }).toFile(`${base}.jpg`);
  await img.clone().webp({ quality: 80 }).toFile(`${base}.webp`);
  await img.clone().avif({ quality: 60 }).toFile(`${base}.avif`);
  unlinkSync(src);
  const kb = (ext) => Math.round(statSync(`${base}.${ext}`).size / 1024);
  console.log(`${f} → jpg ${kb('jpg')} KB · webp ${kb('webp')} KB · avif ${kb('avif')} KB`);
}
