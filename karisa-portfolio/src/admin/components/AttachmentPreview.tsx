import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import {
  InboundAttachment,
  validateAttachment,
  getRiskColor,
  formatFileSize,
  getMimeTypeIcon,
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
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        📎 Attachments ({attachments.length})
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">⚠️ {error}</p>
        </div>
      )}

      <div className="space-y-2">
        {attachments.map((attachment, index) => {
          const validation = validateAttachment(attachment);
          const isDownloading = downloading.has(attachment.id);

          return (
            <motion.div
              key={attachment.id}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* File info */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getMimeTypeIcon(attachment.mime_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatFileSize(attachment.file_size)}
                      </p>
                    </div>
                  </div>

                  {/* Safety status */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {attachment.is_executable && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                        🚨 Executable
                      </span>
                    )}

                    {attachment.virus_scan_status === 'clean' && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        ✅ Clean
                      </span>
                    )}

                    {attachment.virus_scan_status === 'infected' && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                        ❌ Infected
                      </span>
                    )}

                    {attachment.virus_scan_status === 'suspicious' && (
                      <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                        ⚠️ Suspicious
                      </span>
                    )}

                    {attachment.virus_scan_status === 'pending' && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        ⏳ Scanning
                      </span>
                    )}

                    {attachment.is_inline && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        🖼️ Inline
                      </span>
                    )}

                    {validation.warnings.length > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                        ⚠️ {validation.warnings[0]}
                      </span>
                    )}
                  </div>

                  {/* Validation errors display */}
                  {validation.errors.length > 0 && (
                    <div className="space-y-1">
                      {validation.errors.map((error, i) => (
                        <p key={i} className="text-xs text-red-600 dark:text-red-400">
                          🚫 {error}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Download button */}
                <button
                  onClick={() => handleDownload(attachment)}
                  disabled={isDownloading || !validation.isSafe}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !validation.isSafe
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  }`}
                  title={!validation.isSafe ? 'Cannot download unsafe attachment' : 'Download'}
                >
                  {isDownloading ? (
                    <span className="flex items-center gap-1">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="inline-block"
                      >
                        ⏳
                      </motion.span>
                      Downloading
                    </span>
                  ) : (
                    '⬇️ Download'
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Download count info */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💾 {attachments.reduce((sum, a) => sum + a.download_count, 0)} download{
          attachments.reduce((sum, a) => sum + a.download_count, 0) !== 1 ? 's' : ''
        } total
      </div>
    </motion.div>
  );
};

export default AttachmentPreview;
