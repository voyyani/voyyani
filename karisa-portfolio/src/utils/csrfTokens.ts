/**
 * CSRF Token Management
 * Generate, store, and validate CSRF tokens for form submissions
 */

export interface CSRFToken {
  token: string;
  timestamp: number;
}

const CSRF_STORAGE_KEY = 'csrf_token';
const CSRF_VALIDITY_MS = 1000 * 60 * 60; // 1 hour

/**
 * Generate a new CSRF token
 */
export const generateCSRFToken = (): CSRFToken => {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const csrfToken: CSRFToken = {
    token,
    timestamp: Date.now(),
  };

  // Store in sessionStorage (session-based, cleared on browser close)
  sessionStorage.setItem(CSRF_STORAGE_KEY, JSON.stringify(csrfToken));

  return csrfToken;
};

/**
 * Get current CSRF token, generate if missing
 */
export const getCSRFToken = (): string => {
  try {
    const stored = sessionStorage.getItem(CSRF_STORAGE_KEY);
    if (!stored) {
      return generateCSRFToken().token;
    }

    const csrfToken: CSRFToken = JSON.parse(stored);

    // Check if token has expired
    if (Date.now() - csrfToken.timestamp > CSRF_VALIDITY_MS) {
      return generateCSRFToken().token;
    }

    return csrfToken.token;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return generateCSRFToken().token;
  }
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string): boolean => {
  try {
    const stored = sessionStorage.getItem(CSRF_STORAGE_KEY);
    if (!stored) {
      return false;
    }

    const csrfToken: CSRFToken = JSON.parse(stored);

    // Check token matches
    if (csrfToken.token !== token) {
      return false;
    }

    // Check if token has expired
    if (Date.now() - csrfToken.timestamp > CSRF_VALIDITY_MS) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating CSRF token:', error);
    return false;
  }
};

/**
 * Clear CSRF token (on logout or submission)
 */
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem(CSRF_STORAGE_KEY);
};

export default {
  generateCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  clearCSRFToken,
};
