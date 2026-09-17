import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  InboundAttachment,
  validateAttachment,
  getRiskColor,
  formatFileSize,
} from '@/utils/emailValidation';
import { getAttachmentDownloadUrl, logAttachmentDownload } from '@/hooks/useInboundEmails';

interface AttachmentPreviewProps {
  attachments: InboundAttachment[] | undefined;
  replyId: string;
  onDownload?: (attachmentId: string) => void;
  client: SupabaseClient;
  userId?: string;
}

/**
 * Component to display inbound email attachments with download functionality
 */
export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments = [],
  replyId,
  onDownload,
  client,
  userId,
}) => {
  const [downloading, setDownloading] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = async (attachment: InboundAttachment) => {
    try {
      setDownloading((prev) => new Set(prev).add(attachment.id));
      setError(null);

      // Validate attachment before download
      const validation = validateAttachment(attachment);
      if (!validation.isSafe) {
        setError(`Cannot download: ${validation.errors.join(', ')}`);
        setDownloading((prev) => {
          const next = new Set(prev);
          next.delete(attachment.id);
          return next;
        });
        return;
      }

      // Get signed download URL
      const { url, error: urlError } = await getAttachmentDownloadUrl(
        attachment.storage_path,
        client
      );

      if (urlError) {
        setError(`Download failed: ${urlError}`);
        setDownloading((prev) => {
          const next = new Set(prev);
          next.delete(attachment.id);
          return next;
        });
        return;
      }

      // Log download analytics
      if (userId) {
        await logAttachmentDownload(attachment.id, userId, client);
      }

      // Trigger download
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.file_name;
        link.click();
        onDownload?.(attachment.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setError(message);
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(attachment.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-mark-900">
        Attachments ({attachments.length})
      </div>

      {error && (
        <div className="border border-alarm bg-cloth-50 p-3">
          <p className="text-sm text-alarm">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        {attachments.map((attachment) => {
          const validation = validateAttachment(attachment);
          const isDownloading = downloading.has(attachment.id);

          return (
            <div key={attachment.id} className="border border-cloth-300 bg-cloth-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* File info */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-mark-900 truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-mark-500">
                        {formatFileSize(attachment.file_size)}
                      </p>
                    </div>
                  </div>

                  {/* Safety status */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {attachment.is_executable && (
                      <span className="border border-alarm px-2 py-1 text-xs font-medium text-alarm">
                        Executable
                      </span>
                    )}

                    {attachment.virus_scan_status === 'clean' && (
                      <span className="px-2 py-1 text-xs font-medium text-mark-500">
                        Clean
                      </span>
                    )}

                    {attachment.virus_scan_status === 'infected' && (
                      <span className="border border-alarm px-2 py-1 text-xs font-medium text-alarm">
                        Infected
                      </span>
                    )}

                    {attachment.virus_scan_status === 'suspicious' && (
                      <span className="px-2 py-1 text-xs font-medium text-warn">
                        Suspicious
                      </span>
                    )}

                    {attachment.virus_scan_status === 'pending' && (
                      <span className="px-2 py-1 text-xs font-medium text-mark-500">
                        Scanning
                      </span>
                    )}

                    {attachment.is_inline && (
                      <span className="px-2 py-1 text-xs font-medium text-mark-500">
                        Inline
                      </span>
                    )}

                    {validation.warnings.length > 0 && (
                      <span className="px-2 py-1 text-xs font-medium text-warn">
                        {validation.warnings[0]}
                      </span>
                    )}
                  </div>

                  {/* Validation errors display */}
                  {validation.errors.length > 0 && (
                    <div className="space-y-1">
                      {validation.errors.map((error, i) => (
                        <p key={i} className="text-xs text-alarm">
                          {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Download button */}
                <button
                  onClick={() => handleDownload(attachment)}
                  disabled={isDownloading || !validation.isSafe}
                  className="btn-quiet px-3 py-1 text-xs disabled:cursor-not-allowed disabled:text-mark-500"
                  title={!validation.isSafe ? 'Cannot download unsafe attachment' : 'Download'}
                >
                  {isDownloading ? 'Downloading' : 'Download'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download count info */}
      <div className="text-xs text-mark-500">
        {attachments.reduce((sum, a) => sum + a.download_count, 0)} download{
          attachments.reduce((sum, a) => sum + a.download_count, 0) !== 1 ? 's' : ''
        } total
      </div>
    </div>
  );
};

export default AttachmentPreview;
