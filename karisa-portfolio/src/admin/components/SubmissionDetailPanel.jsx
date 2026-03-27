import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ReplyModal from './ReplyModal';
import ConversationTimeline from './ConversationTimeline';
import ResponsiveModal from './ResponsiveModal';

const SubmissionDetailPanel = ({ submission, onClose, onRefresh, client }) => {
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [status, setStatus] = useState(submission.status);
  const [notes, setNotes] = useState(submission.notes || '');
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    fetchReplies();
  }, [submission.id]);

  const fetchReplies = async () => {
    try {
      const { data, error } = await client
        .from('submission_replies')
        .select('*')
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const { error } = await client
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', submission.id);

      if (error) throw error;
      setStatus(newStatus);
      toast.success('Status updated');
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      const { error } = await client
        .from('submissions')
        .update({ notes })
        .eq('id', submission.id);

      if (error) throw error;
      toast.success('Notes saved');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={true}
      onClose={onClose}
      size="lg"
      position="center"
      closeButton={false}
    >
      {/* Header - Responsive stacking */}
      <div className="border-b border-white/10 px-4 sm:px-5 md:px-6 py-4 sm:py-5 -mx-4 sm:-mx-5 md:-mx-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
            {submission.subject}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 line-clamp-2">
            From: {submission.name} ({submission.email})
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 -mt-2 sm:mt-0 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
          aria-label="Close panel"
        >
          <span className="text-2xl">✕</span>
        </button>
      </div>

      {/* Content - Grid responsive layout */}
      <div className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main content - Order 1 on mobile, 0 on desktop */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Original Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 md:p-5"
            >
              <h3 className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base">
                Original Message
              </h3>
              <p className="text-gray-200 whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                {submission.message}
              </p>
              <div className="mt-3 sm:mt-4 text-xs text-gray-500 space-y-1">
                <p>Submitted: {new Date(submission.created_at).toLocaleString()}</p>
                {submission.phone && <p>Phone: {submission.phone}</p>}
              </div>
            </motion.div>

            {/* Conversation Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-semibold text-white mb-3 text-sm sm:text-base">
                Conversation
              </h3>
              {loadingReplies ? (
                <p className="text-gray-400 text-sm">Loading replies...</p>
              ) : replies.length === 0 ? (
                <p className="text-gray-400 text-xs sm:text-sm">No replies yet</p>
              ) : (
                <ConversationTimeline
                  originalMessage={submission.message}
                  replies={replies}
                />
              )}
            </motion.div>

            {/* Reply Button - Full width on mobile */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsReplyModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#61DAFB] to-[#005792] text-white py-3 sm:py-3 rounded-lg font-semibold hover:from-[#61DAFB]/90 hover:to-[#005792]/90 transition text-sm sm:text-base h-10 sm:h-11"
            >
              Send Reply
            </motion.button>
          </div>

          {/* Sidebar - Repositioned below main on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4 sm:space-y-6 order-1 lg:order-2"
          >
            {/* Status */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#61DAFB]/50"
              >
                <option value="new" className="bg-[#0a1929]">New</option>
                <option value="in_progress" className="bg-[#0a1929]">In Progress</option>
                <option value="responded" className="bg-[#0a1929]">Responded</option>
                <option value="closed" className="bg-[#0a1929]">Closed</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                Internal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={4}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#61DAFB]/50 resize-none"
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="mt-2 w-full text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition h-9 sm:h-10"
              >
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 md:p-5">
              <h4 className="font-semibold text-white mb-2 sm:mb-3 text-sm">Details</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <p>
                  <span className="text-gray-400">Submitted:</span>{' '}
                  <span className="text-gray-200">{new Date(submission.created_at).toLocaleString()}</span>
                </p>
                <p>
                  <span className="text-gray-400">Replies:</span>{' '}
                  <span className="text-gray-200">{replies.length}</span>
                </p>
                {submission.responded_at && (
                  <p>
                    <span className="text-gray-400">First responded:</span>{' '}
                    <span className="text-gray-200">{new Date(submission.responded_at).toLocaleString()}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reply Modal */}
      {isReplyModalOpen && (
        <ReplyModal
          submission={submission}
          onClose={() => setIsReplyModalOpen(false)}
          onReplySent={() => {
            fetchReplies();
            handleStatusChange('responded');
          }}
          client={client}
        />
      )}
    </ResponsiveModal>
  );
};

export default SubmissionDetailPanel;
