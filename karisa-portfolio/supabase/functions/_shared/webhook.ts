/**
 * Pure Svix webhook-signature verification. No Deno globals — only crypto.subtle and
 * TextEncoder, both available in Deno and in Node >= 18 / Vitest — so the edge functions
 * and the test suite import the exact same file.
 *
 * Resend signs webhooks via Svix, not with the `x-resend-signature: t=...,signature=...`
 * (or `v1,<ts>:<hex>`) formats this codebase previously parsed. Because that header is
 * never sent, verification always failed with "Missing webhook secret or signature" and
 * every inbound email / delivery-status webhook was rejected with 401 (handle-inbound-email
 * logs: "[verify] Missing webhook secret or signature" -> "[handler] Invalid webhook
 * signature — rejecting"; inbound_replies has 0 rows ever). Svix actually sends:
 *   - headers: svix-id, svix-timestamp (unix seconds), svix-signature (space-separated
 *     list of `v1,<base64>` entries — accept any match)
 *   - secret: `whsec_<base64>`; strip the `whsec_` prefix and base64-decode for the HMAC
 *     key bytes (a secret without the prefix is treated as base64 too)
 *   - signed content: `${svix-id}.${svix-timestamp}.${rawBody}`, HMAC-SHA256, base64
 * See https://docs.svix.com/receiving/verifying-payloads/how-manual.
 */

export interface SvixHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

export type SvixVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'missing_secret' | 'missing_headers' | 'bad_timestamp' | 'stale' | 'no_match' };

/**
 * Reads svix-id / svix-timestamp / svix-signature, falling back to webhook-id /
 * webhook-timestamp / webhook-signature — the standard-webhooks aliases Svix also accepts.
 */
export function readSvixHeaders(headers: Headers): SvixHeaders {
  return {
    id: headers.get('svix-id') ?? headers.get('webhook-id'),
    timestamp: headers.get('svix-timestamp') ?? headers.get('webhook-timestamp'),
    signature: headers.get('svix-signature') ?? headers.get('webhook-signature'),
  };
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: ArrayBuffer): string {
  let binary = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}

function secretToKeyBytes(secret: string): Uint8Array {
  const b64 = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
  return base64ToBytes(b64);
}

async function hmacSha256Base64(keyBytes: Uint8Array, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return bytesToBase64(signed);
}

/** Returns `v1,<base64>` for the given raw body / id / timestamp / secret. Used by tests. */
export async function signSvix(
  rawBody: string,
  id: string,
  timestamp: string,
  secret: string
): Promise<string> {
  const keyBytes = secretToKeyBytes(secret);
  const signature = await hmacSha256Base64(keyBytes, `${id}.${timestamp}.${rawBody}`);
  return `v1,${signature}`;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifySvixSignature(
  rawBody: string,
  h: SvixHeaders,
  secret: string,
  now: number = Date.now(),
  toleranceSeconds = 300
): Promise<SvixVerifyResult> {
  if (!secret) {
    return { ok: false, reason: 'missing_secret' };
  }

  if (!h.id || !h.timestamp || !h.signature) {
    return { ok: false, reason: 'missing_headers' };
  }

  const timestampNum = Number(h.timestamp);
  if (!Number.isFinite(timestampNum)) {
    return { ok: false, reason: 'bad_timestamp' };
  }

  const nowSeconds = Math.floor(now / 1000);
  if (Math.abs(nowSeconds - timestampNum) > toleranceSeconds) {
    return { ok: false, reason: 'stale' };
  }

  const expected = await signSvix(rawBody, h.id, h.timestamp, secret);
  const expectedValue = expected.slice('v1,'.length);

  const candidates = h.signature.split(' ').filter(Boolean);
  for (const candidate of candidates) {
    if (!candidate.startsWith('v1,')) continue;
    const candidateValue = candidate.slice('v1,'.length);
    if (constantTimeEqual(candidateValue, expectedValue)) {
      return { ok: true };
    }
  }

  return { ok: false, reason: 'no_match' };
}
