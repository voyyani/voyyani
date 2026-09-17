import { describe, it, expect } from 'vitest';
import { formatRelative, formatDateTime } from './format';

const now = new Date('2026-09-17T12:00:00Z');

describe('formatRelative', () => {
  it('reads recent times as minutes and hours', () => {
    expect(formatRelative('2026-09-17T11:59:40Z', now)).toBe('just now');
    expect(formatRelative('2026-09-17T11:48:00Z', now)).toBe('12 min ago');
    expect(formatRelative('2026-09-17T09:00:00Z', now)).toBe('3 h ago');
  });
  it('names yesterday, then falls back to a date', () => {
    expect(formatRelative('2026-09-16T12:00:00Z', now)).toBe('Yesterday');
    expect(formatRelative('2026-09-02T12:00:00Z', now)).toBe('2 Sep');
    expect(formatRelative('2025-09-02T12:00:00Z', now)).toBe('2 Sep 2025');
  });
});

describe('formatDateTime', () => {
  it('prints a full, unambiguous timestamp', () => {
    expect(formatDateTime('2026-09-02T09:05:00Z')).toMatch(/^[12] Sep 2026, \d{2}:\d{2}$/);
  });
});
