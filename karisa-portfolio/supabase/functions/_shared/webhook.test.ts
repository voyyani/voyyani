import { describe, it, expect } from 'vitest';
import { readSvixHeaders, verifySvixSignature, signSvix } from './webhook';

const SECRET_WHSEC = 'whsec_c2VjcmV0LWtleS1ieXRlcw=='; // whsec_ + base64("secret-key-bytes")
const SECRET_BARE = 'c2VjcmV0LWtleS1ieXRlcw==';

function headers(overrides: Record<string, string> = {}): Headers {
  const h = new Headers();
  for (const [k, v] of Object.entries(overrides)) {
    h.set(k, v);
  }
  return h;
}

describe('verifySvixSignature', () => {
  it('verifies a body signed with a whsec_-prefixed secret', async () => {
    const body = '{"hello":"world"}';
    const id = 'msg_1';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const sig = await signSvix(body, id, timestamp, SECRET_WHSEC);

    const result = await verifySvixSignature(
      body,
      { id, timestamp, signature: sig },
      SECRET_WHSEC
    );
    expect(result).toEqual({ ok: true });
  });

  it('verifies the same secret without the whsec_ prefix', async () => {
    const body = '{"hello":"world"}';
    const id = 'msg_1';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const sig = await signSvix(body, id, timestamp, SECRET_BARE);

    const result = await verifySvixSignature(
      body,
      { id, timestamp, signature: sig },
      SECRET_BARE
    );
    expect(result).toEqual({ ok: true });
  });

  it('rejects a tampered body with no_match', async () => {
    const body = '{"hello":"world"}';
    const id = 'msg_1';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const sig = await signSvix(body, id, timestamp, SECRET_WHSEC);

    const result = await verifySvixSignature(
      '{"hello":"tampered"}',
      { id, timestamp, signature: sig },
      SECRET_WHSEC
    );
    expect(result).toEqual({ ok: false, reason: 'no_match' });
  });

  it('rejects a wrong secret with no_match', async () => {
    const body = '{"hello":"world"}';
    const id = 'msg_1';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const sig = await signSvix(body, id, timestamp, SECRET_WHSEC);

    const result = await verifySvixSignature(
      body,
      { id, timestamp, signature: sig },
      'whsec_d3Jvbmctc2VjcmV0LWJ5dGVz'
    );
    expect(result).toEqual({ ok: false, reason: 'no_match' });
  });

  it('rejects when any svix header is missing', async () => {
    const body = '{"hello":"world"}';
    const timestamp = String(Math.floor(Date.now() / 1000));

    expect(
      await verifySvixSignature(body, { id: null, timestamp, signature: 'v1,abc' }, SECRET_WHSEC)
    ).toEqual({ ok: false, reason: 'missing_headers' });

    expect(
      await verifySvixSignature(body, { id: 'msg_1', timestamp: null, signature: 'v1,abc' }, SECRET_WHSEC)
    ).toEqual({ ok: false, reason: 'missing_headers' });

    expect(
      await verifySvixSignature(body, { id: 'msg_1', timestamp, signature: null }, SECRET_WHSEC)
    ).toEqual({ ok: false, reason: 'missing_headers' });
  });

  it('rejects an empty secret with missing_secret', async () => {
    const body = '{"hello":"world"}';
    const timestamp = String(Math.floor(Date.now() / 1000));

    const result = await verifySvixSignature(
      body,
      { id: 'msg_1', timestamp, signature: 'v1,abc' },
      ''
    );
    expect(result).toEqual({ ok: false, reason: 'missing_secret' });
  });

  it('rejects a timestamp 400s old with stale', async () => {
    const body = '{"hello":"world"}';
    const id = 'msg_1';
    const now = Date.now();
    const oldTimestamp = String(Math.floor(now / 1000) - 400);
    const sig = await signSvix(body, id, oldTimestamp, SECRET_WHSEC);

    const result = await verifySvixSignature(
      body,
      { id, timestamp: oldTimestamp, signature: sig },
      SECRET_WHSEC,
      now
    );
    expect(result).toEqual({ ok: false, reason: 'stale' });
  });

  it('rejects a non-numeric timestamp with bad_timestamp', async () => {
    const body = '{"hello":"world"}';

    const result = await verifySvixSignature(
      body,
      { id: 'msg_1', timestamp: 'not-a-number', signature: 'v1,abc' },
      SECRET_WHSEC
    );
    expect(result).toEqual({ ok: false, reason: 'bad_timestamp' });
  });

  it('verifies when the signature header has several space-separated entries', async () => {
    const body = '{"hello":"world"}';
    const id = 'msg_1';
    const timestamp = String(Math.floor(Date.now() / 1000));
    const sig = await signSvix(body, id, timestamp, SECRET_WHSEC);
    const combined = `v1,bm90LXRoZS1yaWdodC1vbmU= ${sig} v1,YW5vdGhlci13cm9uZy1vbmU=`;

    const result = await verifySvixSignature(
      body,
      { id, timestamp, signature: combined },
      SECRET_WHSEC
    );
    expect(result).toEqual({ ok: true });
  });
});

describe('readSvixHeaders', () => {
  it('reads the svix-* header names', () => {
    const h = headers({
      'svix-id': 'msg_1',
      'svix-timestamp': '12345',
      'svix-signature': 'v1,abc',
    });
    expect(readSvixHeaders(h)).toEqual({ id: 'msg_1', timestamp: '12345', signature: 'v1,abc' });
  });

  it('falls back to webhook-* header names', () => {
    const h = headers({
      'webhook-id': 'msg_2',
      'webhook-timestamp': '67890',
      'webhook-signature': 'v1,def',
    });
    expect(readSvixHeaders(h)).toEqual({ id: 'msg_2', timestamp: '67890', signature: 'v1,def' });
  });
});
