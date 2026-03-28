import { describe, it, expect } from 'vitest';
import {
  validateInboundEmail,
  validateAttachment,
  getRiskDescription,
  getRiskColor,
  getSpamScoreColor,
  formatFileSize,
  getMimeTypeIcon,
  InboundReply,
  InboundAttachment,
} from '@/utils/emailValidation';

describe('emailValidation - validateInboundEmail', () => {
  const baseEmail: InboundReply = {
    id: 'test-1',
    submission_id: 'sub-1',
    from_email: 'user@example.com',
    from_name: 'John Doe',
    to_email: 'reply+sub-1@voyani.tech',
    subject: 'Test Email',
    body_text: 'Test body',
    status: 'processed',
    spam_score: 0,
    is_spam: false,
    is_sender_verified: true,
    has_attachments: false,
    attachment_count: 0,
    total_attachment_size: 0,
    is_read: false,
    received_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  it('should validate clean email as safe', () => {
    const result = validateInboundEmail(baseEmail);
    expect(result.isValid).toBe(true);
    expect(result.riskLevel).toBe('safe');
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should flag unverified sender with warning', () => {
    const email = { ...baseEmail, is_sender_verified: false };
    const result = validateInboundEmail(email);
    expect(result.warnings.some((w) => w.includes('Sender'))).toBe(true);
    expect(result.riskLevel).toBe('warning');
  });

  it('should error on DMARC failure', () => {
    const email = {
      ...baseEmail,
      security_checks: { dmarc: false, spf: true, dkim: true },
    };
    const result = validateInboundEmail(email);
    expect(result.errors.some((e) => e.includes('DMARC'))).toBe(true);
    expect(result.isValid).toBe(false);
    expect(result.riskLevel).toBe('danger');
  });

  it('should warn on SPF failure', () => {
    const email = {
      ...baseEmail,
      security_checks: { spf: false, dkim: true, dmarc: true },
    };
    const result = validateInboundEmail(email);
    expect(result.warnings.some((w) => w.includes('SPF'))).toBe(true);
  });

  it('should warn on DKIM failure', () => {
    const email = {
      ...baseEmail,
      security_checks: { dkim: false },
    };
    const result = validateInboundEmail(email);
    expect(result.warnings.some((w) => w.includes('DKIM'))).toBe(true);
  });

  it('should error on high spam score (7.0+)', () => {
    const email = { ...baseEmail, spam_score: 7.5 };
    const result = validateInboundEmail(email);
    expect(result.errors.some((e) => e.includes('spam'))).toBe(true);
    expect(result.isValid).toBe(false);
  });

  it('should warn on moderate spam score (5.0-6.9)', () => {
    const email = { ...baseEmail, spam_score: 5.5 };
    const result = validateInboundEmail(email);
    expect(result.warnings.some((w) => w.includes('spam'))).toBe(true);
    expect(result.riskLevel).toBe('warning');
  });

  it('should error when is_spam is true', () => {
    const email = {
      ...baseEmail,
      is_spam: true,
      spam_reasons: ['Contains suspicious keywords', 'High URL count'],
    };
    const result = validateInboundEmail(email);
    expect(result.errors.some((e) => e.includes('spam'))).toBe(true);
    expect(result.isValid).toBe(false);
  });

  it('should error when status is failed', () => {
    const email = { ...baseEmail, status: 'failed' as any };
    const result = validateInboundEmail(email);
    expect(result.errors.some((e) => e.includes('failed'))).toBe(true);
  });

  it('should error when status is quarantined', () => {
    const email = {
      ...baseEmail,
      status: 'quarantined' as any,
    };
    const result = validateInboundEmail(email);
    expect(result.errors.some((e) => e.includes('quarantined'))).toBe(true);
  });

  it('should error on oversized attachments (>25MB)', () => {
    const email = {
      ...baseEmail,
      has_attachments: true,
      total_attachment_size: 26214400 + 1, // 25MB + 1 byte
    };
    const result = validateInboundEmail(email);
    expect(result.errors.some((e) => e.includes('size'))).toBe(true);
  });

  it('should handle multiple issues with proper severity', () => {
    const email = {
      ...baseEmail,
      is_sender_verified: false,
      spam_score: 7.5,
      security_checks: { dmarc: false },
    };
    const result = validateInboundEmail(email);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.riskLevel).toBe('danger');
  });
});

describe('emailValidation - validateAttachment', () => {
  const baseAttachment: InboundAttachment = {
    id: 'att-1',
    inbound_reply_id: 'reply-1',
    file_name: 'document.pdf',
    file_size: 1024000,
    mime_type: 'application/pdf',
    file_extension: 'pdf',
    is_inline: false,
    storage_path: 'submissions/reply-1/document.pdf',
    is_safe: true,
    is_executable: false,
    virus_scan_status: 'clean',
    download_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('should validate safe attachment', () => {
    const result = validateAttachment(baseAttachment);
    expect(result.isSafe).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should error on unsafe flag', () => {
    const attachment = { ...baseAttachment, is_safe: false };
    const result = validateAttachment(attachment);
    expect(result.isSafe).toBe(false);
    expect(result.errors.some((e) => e.includes('unsafe'))).toBe(true);
  });

  it('should error on executable detection', () => {
    const attachment = { ...baseAttachment, is_executable: true };
    const result = validateAttachment(attachment);
    expect(result.errors.some((e) => e.includes('Executable'))).toBe(true);
  });

  it('should error on infected virus scan', () => {
    const attachment = { ...baseAttachment, virus_scan_status: 'infected' };
    const result = validateAttachment(attachment);
    expect(result.errors.some((e) => e.includes('Virus'))).toBe(true);
  });

  it('should warn on suspicious scan', () => {
    const attachment = { ...baseAttachment, virus_scan_status: 'suspicious' };
    const result = validateAttachment(attachment);
    expect(result.warnings.some((w) => w.includes('suspicious'))).toBe(true);
  });

  it('should warn on pending scan', () => {
    const attachment = { ...baseAttachment, virus_scan_status: 'pending' };
    const result = validateAttachment(attachment);
    expect(result.warnings.some((w) => w.includes('in progress'))).toBe(true);
  });

  it('should error on oversized file (>25MB)', () => {
    const attachment = {
      ...baseAttachment,
      file_size: 26214400 + 1,
    };
    const result = validateAttachment(attachment);
    expect(result.errors.some((e) => e.includes('exceeds'))).toBe(true);
  });

  it('should error on dangerous MIME types', () => {
    const dangerousAttachment = {
      ...baseAttachment,
      mime_type: 'application/x-msdownload',
    };
    const result = validateAttachment(dangerousAttachment);
    expect(result.errors.some((e) => e.includes('not allowed'))).toBe(true);
  });
});

describe('emailValidation - utility functions', () => {
  describe('getRiskDescription', () => {
    it('should return "✓ Safe" for safe level', () => {
      expect(getRiskDescription('safe')).toBe('✓ Safe');
    });

    it('should return "⚠️ Warning" for warning level', () => {
      expect(getRiskDescription('warning')).toBe('⚠️ Warning');
    });

    it('should return "🚨 Potential Risk" for danger level', () => {
      expect(getRiskDescription('danger')).toBe('🚨 Potential Risk');
    });
  });

  describe('getRiskColor', () => {
    it('should return green for safe', () => {
      expect(getRiskColor('safe')).toBe('text-green-600');
    });

    it('should return amber for warning', () => {
      expect(getRiskColor('warning')).toBe('text-amber-600');
    });

    it('should return red for danger', () => {
      expect(getRiskColor('danger')).toBe('text-red-600');
    });
  });

  describe('getSpamScoreColor', () => {
    it('should return green for low score (<2)', () => {
      expect(getSpamScoreColor(0.5)).toBe('text-green-600');
      expect(getSpamScoreColor(1.9)).toBe('text-green-600');
    });

    it('should return amber for medium score (2-4.9)', () => {
      expect(getSpamScoreColor(2)).toBe('text-amber-600');
      expect(getSpamScoreColor(4.9)).toBe('text-amber-600');
    });

    it('should return red for high score (5+)', () => {
      expect(getSpamScoreColor(5)).toBe('text-red-600');
      expect(getSpamScoreColor(10)).toBe('text-red-600');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(512)).toBe('0.5 KB');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('getMimeTypeIcon', () => {
    it('should return correct icons for MIME types', () => {
      expect(getMimeTypeIcon('application/pdf')).toBe('📄');
      expect(getMimeTypeIcon('image/png')).toBe('🖼️');
      expect(getMimeTypeIcon('video/mp4')).toBe('🎥');
      expect(getMimeTypeIcon('audio/mpeg')).toBe('🎵');
      expect(getMimeTypeIcon('application/zip')).toBe('📦');
      expect(getMimeTypeIcon('application/msword')).toBe('📝');
      expect(getMimeTypeIcon('application/json')).toBe('< />');
    });

    it('should return default icon for unknown types', () => {
      expect(getMimeTypeIcon('application/unknown')).toBe('📎');
    });
  });
});
