import { describe, it, expect } from 'vitest';
import { rangeWindow, countBetween, deltaPct, bucketByDay, medianResponseMinutes, formatDuration, deliveryFunnel, countBy, toCsv } from '../analyticsMath';

const now = new Date('2026-09-17T12:00:00Z');

describe('rangeWindow', () => {
  it('gives a current window and the equal-length one before it', () => {
    const w = rangeWindow('7d', now);
    expect(w.end).toEqual(now);
    expect(w.start.toISOString()).toBe('2026-09-10T12:00:00.000Z');
    expect(w.prevEnd).toEqual(w.start);
    expect(w.prevStart.toISOString()).toBe('2026-09-03T12:00:00.000Z');
  });
  it('all-time has no previous period', () => {
    const w = rangeWindow('all', now);
    expect(w.start.getTime()).toBe(0);
    expect(w.prevStart).toEqual(w.prevEnd);
  });
});

describe('deltaPct', () => {
  it('is null with no baseline and rounded otherwise', () => {
    expect(deltaPct(5, 0)).toBeNull();
    expect(deltaPct(6, 4)).toBe(50);
    expect(deltaPct(3, 4)).toBe(-25);
  });
});

describe('bucketByDay', () => {
  it('zero-fills every day in the window', () => {
    const rows = [{ created_at: '2026-09-15T01:00:00Z' }, { created_at: '2026-09-15T23:00:00Z' }, { created_at: '2026-09-17T01:00:00Z' }];
    const b = bucketByDay(rows, new Date('2026-09-14T12:00:00Z'), now);
    expect(b).toEqual([
      { date: '2026-09-14', count: 0 }, { date: '2026-09-15', count: 2 }, { date: '2026-09-16', count: 0 }, { date: '2026-09-17', count: 1 },
    ]);
  });
  it('caps all-time at the last 91 days', () => {
    expect(bucketByDay([], new Date(0), now)).toHaveLength(91);
  });
});

describe('medianResponseMinutes / formatDuration', () => {
  it('ignores unanswered rows and resists outliers', () => {
    const subs = [
      { created_at: '2026-09-10T10:00:00Z', responded_at: '2026-09-10T10:30:00Z' },
      { created_at: '2026-09-10T10:00:00Z', responded_at: '2026-09-10T11:00:00Z' },
      { created_at: '2026-09-10T10:00:00Z', responded_at: '2026-09-20T10:00:00Z' },
      { created_at: '2026-09-10T10:00:00Z', responded_at: null },
    ];
    expect(medianResponseMinutes(subs)).toBe(60);
    expect(medianResponseMinutes([])).toBeNull();
    expect(formatDuration(null)).toBe('—');
    expect(formatDuration(42)).toBe('42 min');
    expect(formatDuration(210)).toBe('3.5 h');
    expect(formatDuration(3024)).toBe('2.1 d');
  });
});

describe('deliveryFunnel', () => {
  it('counts each stage cumulatively', () => {
    const f = deliveryFunnel([{ email_status: 'sent' }, { email_status: 'delivered' }, { email_status: 'opened' }, { email_status: 'clicked' }, { email_status: 'bounced' }, { email_status: null }]);
    expect(f).toEqual({ total: 6, sent: 4, delivered: 3, opened: 2, bounced: 1, failed: 0, pending: 1 });
  });
});

describe('countBy', () => {
  it('keeps the given order and includes zeros', () => {
    expect(countBy([{ status: 'new' }, { status: 'new' }, { status: 'closed' }], 'status', ['new', 'in_progress', 'closed']))
      .toEqual([{ key: 'new', count: 2 }, { key: 'in_progress', count: 0 }, { key: 'closed', count: 1 }]);
  });
});

describe('toCsv', () => {
  it('escapes quotes, commas and newlines and starts with a BOM', () => {
    const csv = toCsv([{ name: 'A, "B"', subject: 'line1\nline2', n: 3 }], ['name', 'subject', 'n']);
    expect(csv).toBe('﻿name,subject,n\r\n"A, ""B""","line1\nline2",3');
  });
});
