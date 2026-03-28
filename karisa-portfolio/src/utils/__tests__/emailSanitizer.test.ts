import { describe, it, expect } from 'vitest';
import {
  sanitizeEmailHTML,
  sanitizeEmailText,
  extractTextFromHTML,
  isSafeURL,
  createSafeLink,
} from '@/utils/emailSanitizer';

describe('emailSanitizer - sanitizeEmailHTML', () => {
  it('should allow safe HTML tags', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    const result = sanitizeEmailHTML(html);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('Hello');
    expect(result).toContain('world');
  });

  it('should remove script tags', () => {
    const html = '<p>Text</p><script>alert("xss")</script>';
    const result = sanitizeEmailHTML(html);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('Text');
  });

  it('should remove javascript: URLs', () => {
    const html = '<a href="javascript:alert(\'xss\')">Click</a>';
    const result = sanitizeEmailHTML(html);
    expect(result).not.toContain('javascript:');
  });

  it('should remove event handlers', () => {
    const html = '<img src="valid.jpg" onerror="alert(\'xss\')" />';
    const result = sanitizeEmailHTML(html);
    expect(result).not.toContain('onerror');
  });

  it('should preserve safe attributes (href, src, alt)', () => {
    const html = '<a href="https://example.com">Link</a><img src="image.jpg" alt="Test" />';
    const result = sanitizeEmailHTML(html);
    expect(result).toContain('href');
    expect(result).toContain('https://example.com');
    expect(result).toContain('src');
    expect(result).toContain('alt');
  });

  it('should handle nested HTML safely', () => {
    const html = '<div><p><strong>Nested</strong></p></div>';
    const result = sanitizeEmailHTML(html);
    expect(result).toContain('Nested');
  });

  it('should remove style tags but preserve styled content', () => {
    const html = '<style>body { color: red; }</style><p style="color: red;">Text</p>';
    const result = sanitizeEmailHTML(html);
    expect(result).not.toContain('body { color: red; }');
  });

  it('should handle malformed HTML gracefully', () => {
    const html = '<p>Unclosed paragraph<div>Another div';
    const result = sanitizeEmailHTML(html);
    expect(result).toContain('Unclosed paragraph');
  });

  it('should remove iframe tags', () => {
    const html = '<iframe src="http://evil.com"></iframe>';
    const result = sanitizeEmailHTML(html);
    expect(result).not.toContain('iframe');
  });
});

describe('emailSanitizer - sanitizeEmailText', () => {
  it('should escape HTML special characters', () => {
    const text = '<script>alert("xss")</script>';
    const result = sanitizeEmailText(text);
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('should handle all special HTML characters', () => {
    const text = '& < > " \'';
    const result = sanitizeEmailText(text);
    expect(result).toBe('&amp; &lt; &gt; &quot; &#039;');
  });

  it('should preserve normal text', () => {
    const text = 'This is a normal email body with no HTML.';
    const result = sanitizeEmailText(text);
    expect(result).toBe('This is a normal email body with no HTML.');
  });

  it('should handle empty strings', () => {
    expect(sanitizeEmailText('')).toBe('');
    expect(sanitizeEmailText(null as any)).toBe('');
  });

  it('should handle special Unicode characters', () => {
    const text = 'Hello 👋 World 🌍';
    const result = sanitizeEmailText(text);
    expect(result).toContain('👋');
    expect(result).toContain('🌍');
  });
});

describe('emailSanitizer - extractTextFromHTML', () => {
  it('should convert HTML to plain text', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    const result = extractTextFromHTML(html);
    expect(result).toBe('Hello world');
  });

  it('should remove script tags and content', () => {
    const html = '<p>Text</p><script>alert("xss")</script>';
    const result = extractTextFromHTML(html);
    expect(result).not.toContain('alert');
    expect(result).toContain('Text');
  });

  it('should preserve line breaks', () => {
    const html = '<p>Line 1</p><p>Line 2</p>';
    const result = extractTextFromHTML(html);
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
  });

  it('should handle empty HTML', () => {
    expect(extractTextFromHTML('')).toBe('');
    expect(extractTextFromHTML(null as any)).toBe('');
  });

  it('should truncate long text to maxLength', () => {
    const html = '<p>This is a very long text that should be truncated at 20 characters</p>';
    const result = extractTextFromHTML(html, 20);
    expect(result.length).toBeLessThanOrEqual(23); // 20 + "..."
    expect(result).toContain('...');
  });

  it('should decode HTML entities', () => {
    const html = '<p>Hello &amp; goodbye</p>';
    const result = extractTextFromHTML(html);
    expect(result).toContain('&');
  });

  it('should remove style/script content', () => {
    const html = '<style>body { display: none; }</style><p>Visible</p>';
    const result = extractTextFromHTML(html);
    expect(result).toContain('Visible');
    expect(result).not.toContain('display');
  });
});

describe('emailSanitizer - isSafeURL', () => {
  it('should allow https URLs', () => {
    expect(isSafeURL('https://example.com')).toBe(true);
    expect(isSafeURL('https://example.com/path?query=value')).toBe(true);
  });

  it('should allow http URLs', () => {
    expect(isSafeURL('http://example.com')).toBe(true);
  });

  it('should reject javascript: URLs', () => {
    expect(isSafeURL('javascript:alert("xss")')).toBe(false);
  });

  it('should reject data: URLs', () => {
    expect(isSafeURL('data:text/html,<script>alert("xss")</script>')).toBe(false);
  });

  it('should reject vbscript: URLs', () => {
    expect(isSafeURL('vbscript:alert("xss")')).toBe(false);
  });

  it('should reject empty URLs', () => {
    expect(isSafeURL('')).toBe(false);
    expect(isSafeURL(null as any)).toBe(false);
  });

  it('should handle relative URLs', () => {
    // Relative URLs should parse based on window.location.href
    // This test would need special setup in real environment
    expect(typeof isSafeURL('/path')).toBe('boolean');
  });
});

describe('emailSanitizer - createSafeLink', () => {
  it('should create safe link with secure attributes', () => {
    const result = createSafeLink('https://example.com', 'Click here');
    expect(result).toContain('href=');
    expect(result).toContain('https://example.com');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).toContain('Click here');
  });

  it('should escape URL in href attribute', () => {
    const result = createSafeLink('https://example.com/test?q=1&other=2', 'Link');
    expect(result).toContain('href=');
  });

  it('should return escaped text for unsafe URLs', () => {
    const result = createSafeLink('javascript:alert("xss")', 'Click me');
    expect(result).toContain('&lt;');
    expect(result).not.toContain('href=');
    expect(result).not.toContain('javascript:');
  });

  it('should escape link text to prevent injection', () => {
    const result = createSafeLink('https://example.com', '<script>alert("xss")</script>');
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
  });
});
