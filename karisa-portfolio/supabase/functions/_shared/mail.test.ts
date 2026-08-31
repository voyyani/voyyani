import { describe, it, expect } from 'vitest';
import { buildFrom, buildReplyAddress, buildThreadMessageId } from './mail';

describe('buildFrom', () => {
  it('formats a display-name From header', () => {
    expect(buildFrom('Karisa', 'karisa@voyani.tech')).toBe('Karisa <karisa@voyani.tech>');
  });

  it('quotes a name containing a comma so the header stays valid', () => {
    expect(buildFrom('Ngowa, Karisa', 'karisa@voyani.tech'))
      .toBe('"Ngowa, Karisa" <karisa@voyani.tech>');
  });

  it('omits the display name when it is empty', () => {
    expect(buildFrom('', 'karisa@voyani.tech')).toBe('karisa@voyani.tech');
  });
});

describe('buildReplyAddress', () => {
  it('produces the reply+{uuid}@domain form the migration parses', () => {
    // supabase/migrations/...: substring(email FROM 'reply\+([a-f0-9-]{36})@')
    expect(buildReplyAddress('550e8400-e29b-41d4-a716-446655440000', 'voyani.tech'))
      .toBe('reply+550e8400-e29b-41d4-a716-446655440000@voyani.tech');
  });
});

describe('buildThreadMessageId', () => {
  it('produces an RFC-2822 angle-bracketed id on the sending domain', () => {
    expect(buildThreadMessageId('550e8400-e29b-41d4-a716-446655440000', 'voyani.tech', 1700000000000))
      .toBe('<550e8400-e29b-41d4-a716-446655440000.1700000000000@voyani.tech>');
  });
});
