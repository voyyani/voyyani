/**
 * Email reply object from database
 */
export interface InboundReply {
  id: string;
  submission_id: string;
  from_email: string;
  from_name?: string;
  to_email: string;
  subject: string;
  body_html?: string;
  body_text?: string;
  body_preview?: string;
  message_id?: string;
  in_reply_to?: string;
  references?: string[];
  thread_id?: string;
  status: 'received' | 'processing' | 'processed' | 'failed' | 'spam' | 'quarantined' | 'archived';
  spam_score: number;
  is_spam: boolean;
  spam_reasons?: string[];
  security_checks?: Record<string, unknown>;
  sender_ip_address?: string;
  is_sender_verified: boolean;
  sender_verification_note?: string;
  has_attachments: boolean;
  attachment_count: number;
  total_attachment_size: number;
  is_read: boolean;
  read_at?: string;
  admin_notes?: string;
  received_at: string;
  processed_at?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Attachment object from database
 */
export interface InboundAttachment {
  id: string;
  inbound_reply_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  file_extension?: string;
  content_id?: string;
  is_inline: boolean;
  storage_path: string;
  public_url?: string;
  is_safe: boolean;
  is_executable: boolean;
  virus_scan_status: 'pending' | 'clean' | 'infected' | 'suspicious' | 'error';
  virus_scan_result?: Record<string, unknown>;
  download_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Validation result with errors and warnings
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskLevel: 'safe' | 'warning' | 'danger';
}

/**
 * Validates inbound email for security issues
 */
export function validateInboundEmail(email: InboundReply): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let riskLevel: 'safe' | 'warning' | 'danger' = 'safe';

  // 1. Check sender verification
  if (!email.is_sender_verified) {
    warnings.push('Sender email does not match original submission email');
    riskLevel = 'warning';
  }

  // 2. Check security headers (SPF, DKIM, DMARC)
  const securityChecks = email.security_checks as Record<string, unknown> | undefined;
  if (securityChecks) {
    if (securityChecks.spf === false) {
      warnings.push('SPF validation failed - email may be spoofed');
      riskLevel = 'warning';
    }
    if (securityChecks.dkim === false) {
      warnings.push('DKIM validation failed');
      riskLevel = 'warning';
    }
    if (securityChecks.dmarc === false) {
      errors.push('DMARC validation failed - likely spoofed');
      riskLevel = 'danger';
    }
  }

  // 3. Check spam score
  if (email.spam_score >= 7.0) {
    errors.push(`Critical spam score: ${email.spam_score.toFixed(2)}/10.00 (high confidence)` );
    riskLevel = 'danger';
  } else if (email.spam_score >= 5.0) {
    warnings.push(`Moderate spam score: ${email.spam_score.toFixed(2)}/10.00`);
    riskLevel = 'warning';
  }

  // 4. Check for dangerous attachment types
  if (email.has_attachments && email.attachment_count > 0) {
    if (email.total_attachment_size > 26214400) { // 25MB
      errors.push('Total attachment size exceeds 25MB limit');
      riskLevel = 'danger';
    }
  }

  // 5. Check spam flag
  if (email.is_spam) {
    errors.push('Email flagged as spam during processing');
    riskLevel = 'danger';

    if (email.spam_reasons && email.spam_reasons.length > 0) {
      errors.push(`Reasons: ${email.spam_reasons.slice(0, 2).join(', ')}`);
    }
  }

  // 6. Check processing status
  if (email.status === 'failed') {
    errors.push('Email processing failed');
    riskLevel = 'danger';
  } else if (email.status === 'quarantined') {
    errors.push('Email has been quarantined');
    riskLevel = 'danger';
  }

  return {
    isValid: errors.length === 0 && email.status === 'processed',
    errors,
    warnings,
    riskLevel,
  };
}

/**
 * Validates email attachment for safety
 */
export function validateAttachment(attachment: InboundAttachment): {
  isSafe: boolean;
  warnings: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check if marked as safe
  if (!attachment.is_safe) {
    errors.push('Attachment flagged as unsafe');
  }

  // 2. Check if executable
  if (attachment.is_executable) {
    errors.push('Executable file detected - potential malware risk');
  }

  // 3. Check virus scan status
  if (attachment.virus_scan_status === 'infected') {
    errors.push('Virus detected by security scan - file quarantined');
  } else if (attachment.virus_scan_status === 'suspicious') {
    warnings.push('File flagged as potentially suspicious');
  } else if (attachment.virus_scan_status === 'pending') {
    warnings.push('Security scan in progress');
  } else if (attachment.virus_scan_status === 'error') {
    warnings.push('Security scan encountered an error');
  }

  // 4. Check file size
  const maxSize = 26214400; // 25MB
  if (attachment.file_size > maxSize) {
    errors.push(`File exceeds maximum size (${(attachment.file_size / 1024 / 1024).toFixed(1)}MB > 25MB)`);
  }

  // 5. Check for dangerous MIME types
  const dangerous = ['application/x-msdownload', 'application/x-msdos-program', 'application/x-executable'];
  if (dangerous.includes(attachment.mime_type.toLowerCase())) {
    errors.push('File type not allowed');
  }

  return {
    isSafe: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Get human-readable risk level description
 */
export function getRiskDescription(riskLevel: 'safe' | 'warning' | 'danger'): string {
  switch (riskLevel) {
    case 'safe':
      return '✓ Safe';
    case 'warning':
      return '⚠️ Warning';
    case 'danger':
      return '🚨 Potential Risk';
    default:
      return 'Unknown';
  }
}

/**
 * Get risk level color for UI
 */
export function getRiskColor(riskLevel: 'safe' | 'warning' | 'danger'): string {
  switch (riskLevel) {
    case 'safe':
      return 'text-green-600';
    case 'warning':
      return 'text-amber-600';
    case 'danger':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get spam score color for UI
 */
export function getSpamScoreColor(score: number): string {
  if (score < 2) return 'text-green-600';
  if (score < 5) return 'text-amber-600';
  return 'text-red-600';
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get MIME type emoji icon
 */
export function getMimeTypeIcon(mimeType: string): string {
  const type = mimeType.toLowerCase();

  if (type.includes('pdf')) return '📄';
  if (type.includes('image')) return '🖼️';
  if (type.includes('video')) return '🎥';
  if (type.includes('audio')) return '🎵';
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
  if (type.includes('code') || type.includes('javascript') || type.includes('json')) return '< />';
  if (type.includes('text')) return '📄';

  return '📎';
}
