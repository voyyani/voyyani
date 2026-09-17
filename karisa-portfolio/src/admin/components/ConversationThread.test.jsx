import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockClient } from '../../test/mockSupabase';
import ConversationThread from './ConversationThread';

const items = [
  { kind: 'original', id: 's1', at: '2026-09-10T10:00:00Z', body: 'Hello there', name: 'Amina', email: 'amina@example.com' },
  { kind: 'outbound', id: 'r1', at: '2026-09-10T12:00:00Z', body: 'Thanks Amina', replyType: 'manual', emailStatus: 'delivered', resendId: 're1', source: 'dashboard' },
  { kind: 'inbound', id: 'i1', at: '2026-09-11T09:00:00Z', subject: 'Re: Thanks', bodyText: 'Great, when can we start?', bodyHtml: null, fromName: 'Amina', fromEmail: 'amina@example.com', isRead: false, isImportant: false, held: false, heldReason: null, senderVerified: true, spamScore: 0.2, attachments: [] },
  { kind: 'inbound', id: 'i2', at: '2026-09-11T10:00:00Z', subject: 'WIN', bodyText: 'lottery', bodyHtml: '<p>lottery <script>x()</script></p>', fromName: null, fromEmail: 'x@spam.io', isRead: false, isImportant: false, held: true, heldReason: 'keywords', senderVerified: false, spamScore: 8, attachments: [] },
  { kind: 'outbound', id: 'r2', at: '2026-09-12T12:00:00Z', body: 'From my phone', replyType: 'manual', emailStatus: 'bounced', resendId: 're2', source: 'email_relay' },
];

describe('ConversationThread', () => {
  it('renders every item in order with who said it and its delivery state', () => {
    render(<ConversationThread items={items} client={createMockClient()} userId="u1" />);
    const entries = screen.getAllByRole('article');
    expect(entries).toHaveLength(5);
    expect(entries[0]).toHaveTextContent('Amina');
    expect(entries[1]).toHaveTextContent('You');
    expect(entries[1]).toHaveTextContent('Delivered');
    expect(entries[4]).toHaveTextContent('via Gmail');
    expect(entries[4]).toHaveTextContent('Bounced');
  });

  it('collapses held mail behind its reason and never injects script', async () => {
    render(<ConversationThread items={items} client={createMockClient()} userId="u1" />);
    const held = screen.getAllByRole('article')[3];
    expect(held).toHaveTextContent(/held/i);
    expect(held).toHaveTextContent(/keywords/i);
    expect(screen.queryByText(/lottery/)).toBeNull();   // collapsed until opened
    await userEvent.click(screen.getByRole('button', { name: /show held message/i }));
    expect(held.querySelector('script')).toBeNull();
    expect(held).toHaveTextContent(/lottery/);
  });
});
