import { describe, it, expect } from 'vitest';
import {
  routeInboundAddress,
  parseAddress,
  normalizeReferences,
  buildMessageId,
  buildInboundReplyRow,
  buildAttachmentRow,
} from './inbound';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('routeInboundAddress', () => {
  it('routes a reply+{uuid} address to the threading path', () => {
    expect(routeInboundAddress(`reply+${UUID}@voyani.tech`, 'voyani.tech')).toEqual({
      kind: 'reply',
      submissionId: UUID,
    });
  });

  it('is case-insensitive and tolerates a display name', () => {
    expect(routeInboundAddress(`Karisa <REPLY+${UUID.toUpperCase()}@Voyani.Tech>`, 'voyani.tech'))
      .toEqual({ kind: 'reply', submissionId: UUID });
  });

  it('routes plain mail at the domain to the direct path', () => {
    expect(routeInboundAddress('karisa@voyani.tech', 'voyani.tech')).toEqual({
      kind: 'direct',
      mailbox: 'karisa',
    });
  });

  it('routes any other mailbox at the domain to the direct path too', () => {
    // A catch-all domain means hello@, info@ and typos all still reach a human.
    expect(routeInboundAddress('hello@voyani.tech', 'voyani.tech')).toEqual({
      kind: 'direct',
      mailbox: 'hello',
    });
  });

  it('rejects a reply+ address whose token is not a UUID', () => {
    expect(routeInboundAddress('reply+not-a-uuid@voyani.tech', 'voyani.tech'))
      .toEqual({ kind: 'direct', mailbox: 'reply+not-a-uuid' });
  });

  it('marks addresses at another domain as foreign', () => {
    expect(routeInboundAddress('someone@example.com', 'voyani.tech')).toEqual({ kind: 'foreign' });
  });
});

describe('parseAddress', () => {
  it('splits a display-name address', () => {
    // The DB CHECK constraint on from_email rejects "Jane Doe <jane@x.com>" outright.
    expect(parseAddress('Jane Doe <jane@example.com>')).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
  });

  it('handles a bare address', () => {
    expect(parseAddress('jane@example.com')).toEqual({ name: null, email: 'jane@example.com' });
  });

  it('strips quotes from a quoted display name', () => {
    expect(parseAddress('"Doe, Jane" <jane@example.com>')).toEqual({
      name: 'Doe, Jane',
      email: 'jane@example.com',
    });
  });

  it('lowercases the address', () => {
    expect(parseAddress('Jane@Example.COM').email).toBe('jane@example.com');
  });
});

describe('normalizeReferences', () => {
  it('splits a whitespace-separated header into an array', () => {
    expect(normalizeReferences('<a@x.com> <b@x.com>')).toEqual(['<a@x.com>', '<b@x.com>']);
  });

  it('passes an array through', () => {
    expect(normalizeReferences(['<a@x.com>'])).toEqual(['<a@x.com>']);
  });

  it('returns null for undefined', () => {
    expect(normalizeReferences(undefined)).toBeNull();
  });

  it("returns null for an empty string rather than ['']", () => {
    expect(normalizeReferences('   ')).toBeNull();
  });
});

describe('buildMessageId', () => {
  it('keeps the provider Message-ID when present', () => {
    expect(buildMessageId({ message_id: '<abc@mail.example.com>' }, UUID))
      .toBe('<abc@mail.example.com>');
  });

  it('synthesises one when absent, because the column is NOT NULL UNIQUE', () => {
    const id = buildMessageId({}, UUID);
    expect(id).toMatch(/^<generated\.[0-9a-f-]{36}\.\d+@voyani\.tech>$/);
  });
});

describe('buildInboundReplyRow', () => {
  const input = {
    submissionId: UUID,
    toAddress: `reply+${UUID}@voyani.tech`,
    from: 'Jane Doe <jane@example.com>',
    subject: 'Re: Project Inquiry',
    bodyText: 'Sounds good.',
    bodyHtml: '<p>Sounds good.</p>',
    payload: { message_id: '<abc@mail.example.com>', in_reply_to: '<x@y.com>', references: '<x@y.com>' },
    senderVerified: true,
    spamScore: 0.5,
    spamReasons: [],
    isSpam: false,
  };

  it('writes is_sender_verified, not sender_verified', () => {
    const row = buildInboundReplyRow(input);
    expect(row.is_sender_verified).toBe(true);
    expect(row).not.toHaveProperty('sender_verified');
  });

  it('never writes the generated body_preview column', () => {
    expect(buildInboundReplyRow(input)).not.toHaveProperty('body_preview');
  });

  it('splits the from header into from_email and from_name', () => {
    const row = buildInboundReplyRow(input);
    expect(row.from_email).toBe('jane@example.com');
    expect(row.from_name).toBe('Jane Doe');
  });

  it('writes references as an array', () => {
    expect(buildInboundReplyRow(input).references).toEqual(['<x@y.com>']);
  });

  it('marks a spam row with status spam', () => {
    expect(buildInboundReplyRow({ ...input, isSpam: true }).status).toBe('spam');
  });

  it('marks a clean row with status processed', () => {
    expect(buildInboundReplyRow(input).status).toBe('processed');
  });

  it('falls back to "(No subject)" for a missing subject', () => {
    expect(buildInboundReplyRow({ ...input, subject: '' }).subject).toBe('(No subject)');
  });
});

describe('buildAttachmentRow', () => {
  const input = {
    inboundReplyId: 'r1',
    filename: 'brief.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    storagePath: `${UUID}/r1/brief.pdf`,
    isInline: false,
    contentId: undefined,
  };

  it('uses the schema column names file_name and file_size', () => {
    const row = buildAttachmentRow(input);
    expect(row.file_name).toBe('brief.pdf');
    expect(row.file_size).toBe(1024);
    expect(row).not.toHaveProperty('filename');
    expect(row).not.toHaveProperty('size');
  });

  it('never writes the generated file_extension column', () => {
    expect(buildAttachmentRow(input)).not.toHaveProperty('file_extension');
  });
});
