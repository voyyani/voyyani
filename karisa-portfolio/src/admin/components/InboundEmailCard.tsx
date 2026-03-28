import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import {
  InboundReply,
  InboundAttachment,
  validateInboundEmail,
  getRiskColor,
  getRiskDescription,
  getSpamScoreColor,
} from '@/utils/emailValidation';
import { sanitizeEmailHTML, sanitizeEmailText, extractTextFromHTML } from '@/utils/emailSanitizer';
import { markEmailAsRead, updateEmailNotes } from '@/hooks/useInboundEmails';
import AttachmentPreview from './AttachmentPreview';

interface InboundEmailCardProps {
  email: InboundReply;
  attachments?: InboundAttachment[];
  onMarkAsRead?: (id: string) => void;
  onToggleStar?: (id: string, isImportant: boolean) => void;
  onAddNote?: (id: string, note: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  client: SupabaseClient;
  userId?: string;
}

/**
 * Component to display a single inbound email with full details
 * Includes sanitization, security indicators, attachments, and admin actions
 */
export const InboundEmailCard: React.FC<InboundEmailCardProps> = ({
  email,
  attachments = [],
  onMarkAsRead,
  onToggleStar,
  onAddNote,
  isSelected = false,
  onSelect,
  client,
  userId,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(email.admin_notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const validation = validateInboundEmail(email);
  const bodyPreview = email.body_preview || extractTextFromHTML(email.body_html || email.body_text || '');

  const handleMarkAsRead = async () => {
    if (!email.is_read && userId) {
      const result = await markEmailAsRead(email.id, userId, client);
      if (result.success) {
        onMarkAsRead?.(email.id);
      }
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      setNotesError(null);
      const result = await updateEmailNotes(email.id, notes, client);
      if (result.success) {
        onAddNote?.(email.id, notes);
        setShowNotes(false);
      } else {
        setNotesError(result.error || 'Failed to save notes');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save notes';
      setNotesError(message);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <motion.div
      className={`border rounded-lg overflow-hidden transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {/* Sender info */}
            <div className="flex items-center gap-2 mb-1">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {(email.from_name || email.from_email)[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {email.from_name || email.from_email}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {email.from_email}
                </p>
              </div>
            </div>

            {/* Subject */}
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 line-clamp-2 mb-2">
              {email.subject}
            </p>

            {/* Timestamp and status badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {new Date(email.received_at).toLocaleString()}
              </span>

              {!email.is_read && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                  ●
                </span>
              )}

              {email.is_spam && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                  🚨 Spam
                </span>
              )}

              {email.is_sender_verified && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  ✓ Verified
                </span>
              )}

              {!email.is_sender_verified && (
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                  ⚠️ Unverified
                </span>
              )}

              {email.has_attachments && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full">
                  📎 {email.attachment_count}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!email.is_read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsRead();
                }}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Mark as read"
              >
                ✓
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar?.(email.id, !email.is_important);
              }}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={email.is_important ? 'Unstar' : 'Star'}
            >
              {email.is_important ? '⭐' : '☆'}
            </button>
          </div>
        </div>
      </div>

      {/* Risk/Validation indicators */}
      {validation.riskLevel !== 'safe' && (
        <div className={`p-3 border-t border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${getRiskColor(validation.riskLevel)}`}>
          <p className="text-sm font-medium mb-2">{getRiskDescription(validation.riskLevel)}</p>
          {validation.warnings.length > 0 && (
            <ul className="text-xs space-y-1 ml-4">
              {validation.warnings.map((warning, i) => (
                <li key={i}>⚠️ {warning}</li>
              ))}
            </ul>
          )}
          {validation.errors.length > 0 && (
            <ul className="text-xs space-y-1 ml-4 text-red-700 dark:text-red-400">
              {validation.errors.map((error, i) => (
                <li key={i}>🚫 {error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Spam score indicator */}
      {email.spam_score > 0 && (
        <div className={`p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 ${getSpamScoreColor(email.spam_score)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Spam Detection</span>
            <span className={`text-lg font-bold ${getSpamScoreColor(email.spam_score)}`}>
              {email.spam_score.toFixed(2)}/10
            </span>
          </div>

          {/* Spam reasons */}
          {email.spam_reasons && email.spam_reasons.length > 0 && (
            <div className="space-y-1">
              {email.spam_reasons.slice(0, 3).map((reason, i) => (
                <p key={i} className="text-xs opacity-75">
                  • {reason}
                </p>
              ))}
              {email.spam_reasons.length > 3 && (
                <p className="text-xs opacity-75">• +{email.spam_reasons.length - 3} more</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Email body */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {email.body_html ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-gray-100 line-clamp-6"
            dangerouslySetInnerHTML={{
              __html: sanitizeEmailHTML(email.body_html),
            }}
          />
        ) : (
          <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words line-clamp-6 font-sans">
            {sanitizeEmailText(email.body_text || '')}
          </pre>
        )}

        {(email.body_html || email.body_text) && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">...</p>
        )}
      </div>

      {/* Attachments */}
      {email.has_attachments && attachments.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <AttachmentPreview
            attachments={attachments}
            replyId={email.id}
            client={client}
            userId={userId}
          />
        </div>
      )}

      {/* Admin notes */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!showNotes ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotes(true);
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {email.admin_notes ? `📝 Edit notes: ${email.admin_notes.substring(0, 50)}...` : '📝 Add adminnotes'}
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add admin notes..."
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
              rows={3}
            />
            {notesError && <p className="text-xs text-red-600 dark:text-red-400">{notesError}</p>}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveNotes();
                }}
                disabled={savingNotes}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {savingNotes ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotes(false);
                  setNotes(email.admin_notes || '');
                }}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InboundEmailCard;
