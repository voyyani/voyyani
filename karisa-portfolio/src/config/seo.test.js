import { describe, it, expect } from 'vitest';
import { buildSeoTags, renderTagsToHtml, DEFAULTS, ALTERNATE_NAMES } from './seo';
import { SITE } from './site';

// Vite's ?raw import rather than fs. __dirname does not exist in ESM, and under Vitest's
// jsdom environment import.meta.url is an http: URL, so readFileSync cannot use it either.
// ?raw goes through the same transform pipeline the app does and needs no path maths.
import indexHtmlSource from '../../index.html?raw';

const indexHtml = () => indexHtmlSource;

const metaByKey = (tags, key) =>
  tags.meta.find((m) => m.name === key || m.property === key)?.content;

describe('buildSeoTags', () => {
  it('does not repeat the name in the homepage title', () => {
    // The previous rule compared the title against a constant the default never
    // equalled, producing "Ngowa Karisa — … | Ngowa Karisa — Portfolio".
    const { title } = buildSeoTags();
    expect(title).toBe(DEFAULTS.title);
    expect(title.match(/Ngowa Karisa/g)).toHaveLength(1);
  });

  it('appends the name for a page that supplies its own title', () => {
    const { title } = buildSeoTags({ title: 'Cutting load time from 3s to 1.2s' });
    expect(title).toBe(`Cutting load time from 3s to 1.2s | ${SITE.name}`);
  });

  it('keeps the title within the length search results render', () => {
    expect(buildSeoTags().title.length).toBeLessThanOrEqual(60);
  });

  it('keeps the description within the length search results render', () => {
    expect(metaByKey(buildSeoTags(), 'description').length).toBeLessThanOrEqual(160);
  });

  it('canonical and og:url agree, and match the sitemap trailing slash', () => {
    const tags = buildSeoTags();
    const canonical = tags.link.find((l) => l.rel === 'canonical').href;
    expect(canonical).toBe(`${SITE.url}/`);
    expect(metaByKey(tags, 'og:url')).toBe(canonical);
  });

  it('uses the www host everywhere, never the redirecting apex', () => {
    const tags = buildSeoTags();
    const urls = [
      ...tags.link.map((l) => l.href),
      metaByKey(tags, 'og:url'),
      metaByKey(tags, 'og:image'),
    ];
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/www\.voyani\.tech/);
    }
  });

  it('ships an absolute og:image — relative URLs are ignored by social scrapers', () => {
    expect(metaByKey(buildSeoTags(), 'og:image')).toMatch(/^https:\/\//);
  });

  it('carries the previous published name as alternateName', () => {
    // Without this the rename splits one person into two competing entities.
    const person = buildSeoTags().jsonLd.find((s) => s['@type'] === 'Person');
    expect(person.alternateName).toEqual(ALTERNATE_NAMES);
    expect(person.alternateName).toContain('Karisa Voyani');
  });

  it('links the WebSite entity to the Person entity by @id', () => {
    const [person, website] = buildSeoTags().jsonLd;
    expect(website.author['@id']).toBe(person['@id']);
  });

  describe('noindex pages', () => {
    it('emits noindex, nofollow', () => {
      expect(metaByKey(buildSeoTags({ noindex: true }), 'robots')).toBe('noindex, nofollow');
    });

    it('omits structured data, so a 404 does not describe the whole site', () => {
      expect(buildSeoTags({ noindex: true }).jsonLd).toEqual([]);
    });
  });
});

describe('renderTagsToHtml', () => {
  it('escapes quotes in attribute values so a tag cannot be broken out of', () => {
    const html = renderTagsToHtml(buildSeoTags({ description: 'He said "hi" <b>' }));
    expect(html).toContain('&quot;hi&quot;');
    expect(html).toContain('&lt;b&gt;');
    expect(html).not.toContain('content="He said "');
  });

  it('escapes < inside JSON-LD so </script> cannot terminate the block early', () => {
    const html = renderTagsToHtml(buildSeoTags({ description: '</script><script>alert(1)</script>' }));
    expect(html).not.toContain('</script><script>alert(1)');
    expect(html).toContain('\\u003c/script');
  });

  it('marks tags with data-rh so Helmet replaces rather than duplicates them', () => {
    // react-helmet-async removes every [data-rh="true"] tag on mount before inserting
    // its own. Without the attribute the page would carry two of every tag.
    const html = renderTagsToHtml(buildSeoTags());
    const tagCount = (html.match(/<(meta|link|title|script)/g) || []).length;
    const markedCount = (html.match(/data-rh="true"/g) || []).length;
    expect(markedCount).toBe(tagCount);
  });
});

describe('index.html build contract', () => {
  it('still contains the placeholder the Vite plugin injects into', () => {
    // If this is ever removed, the build throws rather than silently shipping a page
    // with no OG tags — but failing here names the cause directly.
    expect(indexHtml()).toContain('<!--%SEO_META%-->');
  });

  it('does not hand-write meta tags that the plugin owns', () => {
    const html = indexHtml();
    expect(html).not.toMatch(/<meta[^>]+property="og:/);
    expect(html).not.toMatch(/<link[^>]+rel="canonical"/);
  });
});
