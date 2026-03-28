import React, { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { InboundReply } from '@/utils/emailValidation';
import InboundEmailCard from './InboundEmailCard';

interface InboundRepliesFilterProps {
  emails: InboundReply[];
  onFilter: (filtered: InboundReply[]) => void;
  client: SupabaseClient;
  userId?: string;
}

/**
 * Component to filter and search inbound emails
 */
export const InboundRepliesFilter: React.FC<InboundRepliesFilterProps> = ({
  emails,
  onFilter,
  client,
  userId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'spam' | 'high-risk'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'spam-score' | 'sender'>('date');

  useEffect(() => {
    let filtered = [...emails];

    // Apply filter
    switch (filterType) {
      case 'unread':
        filtered = filtered.filter((e) => !e.is_read);
        break;
      case 'spam':
        filtered = filtered.filter((e) => e.is_spam || e.spam_score >= 5);
        break;
      case 'high-risk':
        filtered = filtered.filter((e) => e.spam_score >= 7 || !e.is_sender_verified);
        break;
      case 'all':
      default:
        break;
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.from_email.toLowerCase().includes(term) ||
          e.from_name?.toLowerCase().includes(term) ||
          e.subject.toLowerCase().includes(term) ||
          e.body_text?.toLowerCase().includes(term)
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'spam-score':
          return b.spam_score - a.spam_score;
        case 'sender':
          return a.from_email.localeCompare(b.from_email);
        case 'date':
        default:
          return new Date(b.received_at).getTime() - new Date(a.received_at).getTime();
      }
    });

    onFilter(filtered);
  }, [searchTerm, filterType, sortBy, emails, onFilter]);

  const unreadCount = emails.filter((e) => !e.is_read).length;
  const spamCount = emails.filter((e) => e.is_spam || e.spam_score >= 5).length;
  const highRiskCount = emails.filter((e) => e.spam_score >= 7 || !e.is_sender_verified).length;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by sender, subject, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 text-sm"
        />
      </div>

      {/* Filter tabs and sort */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            All ({emails.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filterType === 'unread'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType('spam')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filterType === 'spam'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Spam ({spamCount})
          </button>
          <button
            onClick={() => setFilterType('high-risk')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filterType === 'high-risk'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            High Risk ({highRiskCount})
          </button>
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'spam-score' | 'sender')}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 text-sm"
        >
          <option value="date">Sort by: Date</option>
          <option value="spam-score">Sort by: Spam Score</option>
          <option value="sender">Sort by: Sender</option>
        </select>
      </div>
    </div>
  );
};

export default InboundRepliesFilter;
