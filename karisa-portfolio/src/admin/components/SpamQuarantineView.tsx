import React, { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { InboundReply } from '@/utils/emailValidation';
import InboundEmailCard from './InboundEmailCard';

interface SpamQuarantineViewProps {
  submissionId?: string;
  client: SupabaseClient;
  userId?: string;
}

/**
 * Admin view for reviewing and managing quarantined spam emails
 */
export const SpamQuarantineView: React.FC<SpamQuarantineViewProps> = ({
  submissionId,
  client,
  userId,
}) => {
  const [spamEmails, setSpamEmails] = useState<InboundReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [scoreFilter, setScoreFilter] = useState<number>(5);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');

  useEffect(() => {
    const fetchSpam = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = client
          .from('inbound_replies')
          .select('*, inbound_attachments(*)')
          .gte('spam_score', scoreFilter)
          .order('spam_score', { ascending: false });

        const { data, error: fetchError } = submissionId
          ? query.eq('submission_id', submissionId)
          : query;

        if (fetchError) throw fetchError;

        // Apply date filter
        const filtered = data?.filter((email) => {
          const emailDate = new Date(email.received_at);
          const now = new Date();
          const days = parseInt(dateRange);

          if (dateRange === 'all') return true;

          const diffTime = Math.abs(now.getTime() - emailDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return diffDays <= days;
        }) || [];

        setSpamEmails(filtered as InboundReply[]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load spam emails';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchSpam();
  }, [submissionId, scoreFilter, dateRange, client]);

  const handleToggleSelect = (emailId: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(emailId)) {
      newSelected.delete(emailId);
    } else {
      newSelected.add(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmails.size === spamEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(spamEmails.map((e) => e.id)));
    }
  };

  const handleReleaseFromSpam = async () => {
    try {
      for (const emailId of Array.from(selectedEmails)) {
        await client
          .from('inbound_replies')
          .update({ is_spam: false, status: 'processed' })
          .eq('id', emailId);
      }

      // Refresh list
      setSpamEmails((prev) => prev.filter((e) => !selectedEmails.has(e.id)));
      setSelectedEmails(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release emails');
    }
  };

  const handleDeletePermanently = async () => {
    if (!confirm('Are you sure you want to permanently delete these emails?')) return;

    try {
      for (const emailId of Array.from(selectedEmails)) {
        await client.from('inbound_replies').delete().eq('id', emailId);
      }

      setSpamEmails((prev) => prev.filter((e) => !selectedEmails.has(e.id)));
      setSelectedEmails(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete emails');
    }
  };

  const handleExportAsCSV = () => {
    const csv = [
      ['From', 'Subject', 'Spam Score', 'Reasons', 'Received At'].join(','),
      ...spamEmails.map((email) =>
        [
          `"${email.from_email}"`,
          `"${email.subject}"`,
          email.spam_score.toFixed(2),
          `"${(email.spam_reasons || []).join('; ')}"`,
          new Date(email.received_at).toISOString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spam-quarantine-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🚨 Spam Quarantine ({spamEmails.length})
        </h3>

        {error && (
          <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Score filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Minimum Score
            </label>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(parseFloat(e.target.value))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 text-sm"
            >
              <option value={0}>All (0.0+)</option>
              <option value={2}>Low (2.0+)</option>
              <option value={5}>Medium (5.0+)</option>
              <option value={7}>High (7.0+)</option>
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7' | '30' | '90' | 'all')}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          {/* Export button */}
          <div className="flex items-end">
            <button
              onClick={handleExportAsCSV}
              disabled={spamEmails.length === 0}
              className="w-full px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        {spamEmails.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedEmails.size === spamEmails.length && spamEmails.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedEmails.size > 0
                    ? `${selectedEmails.size} selected`
                    : 'Select all'}
                </span>
              </div>

              {selectedEmails.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleReleaseFromSpam}
                    className="px-3 py-1 text-sm bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                  >
                    ✓ Release ({selectedEmails.size})
                  </button>
                  <button
                    onClick={handleDeletePermanently}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    🗑️ Delete ({selectedEmails.size})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email list */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Loading spam emails...</p>
          </div>
        ) : spamEmails.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">✓ No spam emails in quarantine</p>
          </div>
        ) : (
          <div className="space-y-3">
            {spamEmails.map((email) => (
              <div
                key={email.id}
                className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedEmails.has(email.id)}
                  onChange={() => handleToggleSelect(email.id)}
                  className="h-4 w-4 rounded mt-1 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleToggleSelect(email.id)}>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {email.from_email} - {email.subject}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(email.received_at).toLocaleString()}
                  </p>
                  {email.spam_reasons && email.spam_reasons.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {email.spam_reasons.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">
                    {email.spam_score.toFixed(1)}
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400">/10</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SpamQuarantineView;
