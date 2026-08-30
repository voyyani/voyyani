import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import NotFound from './NotFound';
import { SITE } from '../config/site';

const renderNotFound = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    </HelmetProvider>
  );

describe('NotFound', () => {
  it('tells the visitor the page does not exist', () => {
    renderNotFound();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/doesn’t exist/i);
  });

  it('offers a route back into the site', () => {
    renderNotFound();
    expect(screen.getByRole('link', { name: /back to homepage/i })).toHaveAttribute('href', '/');
  });

  it('links the résumé at the current filename', () => {
    // Guards against the 404 page pointing at the pre-rename PDF path.
    renderNotFound();
    expect(screen.getByRole('link', { name: /résumé/i })).toHaveAttribute(
      'href',
      SITE.resume.href
    );
  });

  it('marks itself noindex', async () => {
    // The single most important thing this page does. A static SPA on Vercel cannot
    // return a real 404 status — the rewrite already served index.html with a 200 — so
    // this meta tag is the only signal keeping junk URLs out of the search index.
    renderNotFound();
    await waitFor(() => {
      const robots = document.head.querySelector('meta[name="robots"]');
      expect(robots).not.toBeNull();
      expect(robots.getAttribute('content')).toBe('noindex, nofollow');
    });
  });

  it('exposes a main landmark for the skip link to target', () => {
    renderNotFound();
    expect(document.querySelector('main#main')).not.toBeNull();
  });
});
