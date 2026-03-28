import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML email content to prevent XSS attacks
 * Whitelist-based approach: only allows safe HTML tags
 */
export function sanitizeEmailHTML(html: string): string {
  if (!html) return '';

  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'section', 'article', 'hr'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel', 'class',
      'width', 'height', 'style' // Allow basic styling
    ],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    FORCE_BODY: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    SAFE_FOR_TEMPLATES: true,
  };

  // Sanitize using DOMPurify
  const clean = DOMPurify.sanitize(html, config);

  return clean;
}

/**
 * Sanitizes plain text email content
 * Escapes all HTML special characters
 */
export function sanitizeEmailText(text: string): string {
  if (!text) return '';
  return escapeHtml(text);
}

/**
 * Escapes HTML special characters
 * Used for text-only email display
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Extracts plain text from HTML content
 * Useful for creating email previews
 */
export function extractTextFromHTML(html: string, maxLength: number = 200): string {
  if (!html) return '';

  // Remove style and script tags
  let text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Convert common tags to line breaks
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|blockquote)>/gi, '\n')
    .replace(/<h[1-6][^>]*>/gi, '\n');

  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  // Clean up whitespace
  text = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();

  // Truncate to maxLength
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }

  return text;
}

/**
 * Decodes HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&nbsp;': ' ',
    '&#x2013;': '–',
    '&#x2014;': '—',
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }

  return result;
}

/**
 * Validates if URL is safe to open
 * Prevents javascript: and data: URLs
 */
export function isSafeURL(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url, window.location.href);
    const protocol = parsed.protocol.toLowerCase();

    // Only allow http, https
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Creates a safe link element with rel attributes
 */
export function createSafeLink(href: string, text: string): string {
  if (!isSafeURL(href)) {
    return escapeHtml(text);
  }

  return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
}
