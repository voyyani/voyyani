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
