import { describe, it, expect } from 'vitest';
import { renderEmail, escapeHtml, textToHtml } from './emailTemplate';

describe('escapeHtml', () => {
  it('escapes the five characters', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;');
  });
});

describe('textToHtml', () => {
  it('splits paragraphs on blank lines and preserves single line breaks', () => {
    expect(textToHtml('a\n\nb<')).toBe('<p style="margin:0 0 12px">a</p><p style="margin:0 0 12px">b&lt;</p>');
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
