import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ReplyModal from './ReplyModal';
import ConversationTimeline from './ConversationTimeline';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#0a1929] border border-white/10 rounded-lg shadow-2xl max-w-4xl w-full my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{submission.subject}</h2>
            <p className="text-sm text-gray-400 mt-1">From: {submission.name} ({submission.email})</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-3xl font-light"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-3 gap-6 p-6">
          {/* Main content */}
          <div className="col-span-2 space-y-6">
            {/* Original Message */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Original Message</h3>
              <p className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                {submission.message}
              </p>
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>Submitted: {new Date(submission.created_at).toLocaleString()}</p>
                {submission.phone && <p>Phone: {submission.phone}</p>}
              </div>
            </div>

            {/* Conversation Timeline */}
            <div>
              <h3 className="font-semibold text-white mb-3">Conversation</h3>
              {loadingReplies ? (
                <p className="text-gray-400">Loading replies...</p>
              ) : replies.length === 0 ? (
                <p className="text-gray-400 text-sm">No replies yet</p>
              ) : (
                <ConversationTimeline
                  originalMessage={submission.message}
                  replies={replies}
                />
              )}
            </div>

            {/* Reply Modal Button */}
            <button
              onClick={() => setIsReplyModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#61DAFB] to-[#005792] text-white py-3 rounded-lg font-semibold hover:from-[#61DAFB]/90 hover:to-[#005792]/90 transition"
            >
              Send Reply
            </button>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#61DAFB]/50"
              >
                <option value="new" className="bg-[#0a1929]">New</option>
                <option value="in_progress" className="bg-[#0a1929]">In Progress</option>
                <option value="responded" className="bg-[#0a1929]">Responded</option>
                <option value="closed" className="bg-[#0a1929]">Closed</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Internal Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={4}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#61DAFB]/50 resize-none"
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="mt-2 w-full text-sm bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-medium transition"
              >
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3">Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Submitted:</span> <span className="text-gray-200">{new Date(submission.created_at).toLocaleString()}</span></p>
                <p><span className="text-gray-400">Replies:</span> <span className="text-gray-200">{replies.length}</span></p>
                {submission.responded_at && (
                  <p><span className="text-gray-400">First responded:</span> <span className="text-gray-200">{new Date(submission.responded_at).toLocaleString()}</span></p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
    </motion.div>
  );
};

export default SubmissionDetailPanel;
