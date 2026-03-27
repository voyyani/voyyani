import React from 'react';
import { motion } from 'framer-motion';

const ConversationTimeline = ({ originalMessage, replies }) => {
  const getReplyTypeLabel = (type) => {
    const labels = {
      'manual': '✏️ Manual Reply',
      'quick_reply': '⚡ Quick Reply',
      'status_change': '📋 Status Update',
    };
    return labels[type] || type;
  };

  const getReplyTypeColor = (type) => {
    const colors = {
      'manual': 'border-l-blue-400',
      'quick_reply': 'border-l-amber-400',
      'status_change': 'border-l-purple-400',
    };
    return colors[type] || 'border-l-gray-400';
  };

  const getReplyTypeBg = (type) => {
    const bgColors = {
      'manual': 'bg-blue-500/10',
      'quick_reply': 'bg-amber-500/10',
      'status_change': 'bg-purple-500/10',
    };
    return bgColors[type] || 'bg-gray-500/10';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Original Message - Responsive padding and sizing */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative pl-4 sm:pl-6 border-l-4 border-l-[#61DAFB]"
      >
        <div className="absolute -left-3 top-0 w-5 h-5 sm:w-6 sm:h-6 bg-[#61DAFB] rounded-full border-4 border-[#0a1929]" />
        <div className="bg-[#61DAFB]/10 border border-[#61DAFB]/30 p-3 sm:p-4 md:p-5 rounded-lg">
          <p className="text-xs font-semibold text-[#61DAFB] uppercase mb-2 sm:mb-3">
            Original Message
          </p>
          <p className="text-gray-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
            {originalMessage}
          </p>
        </div>
      </motion.div>

      {/* Replies - Responsive */}
      {replies.map((reply, index) => (
        <motion.div
          key={reply.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative pl-4 sm:pl-6 border-l-4 ${getReplyTypeColor(reply.reply_type)}`}
        >
          <div
            className={`absolute -left-3 top-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-4 border-[#0a1929] ${
              reply.reply_type === 'manual' ? 'bg-blue-400' :
              reply.reply_type === 'quick_reply' ? 'bg-amber-400' :
              'bg-purple-400'
            }`}
          />

          <div className={`${getReplyTypeBg(reply.reply_type)} border border-white/10 p-3 sm:p-4 md:p-5 rounded-lg`}>
            {/* Header - Responsive flex direction */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
              <p className="text-xs font-semibold text-gray-300">
                {getReplyTypeLabel(reply.reply_type)}
              </p>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {new Date(reply.created_at).toLocaleString()}
              </span>
            </div>

            {/* Message content - Responsive text sizing */}
            <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
              {reply.reply_message}
            </p>

            {/* Email ID badge - Responsive padding */}
            {reply.resend_email_id && (
              <p className="text-xs text-gray-500 mt-2 sm:mt-3 p-2 bg-white/5 rounded italic">
                Email ID: {reply.resend_email_id}
              </p>
            )}
          </div>
        </motion.div>
      ))}

      {/* Empty state - Responsive */}
      {replies.length === 0 && (
        <p className="text-center text-gray-500 text-xs sm:text-sm py-6 sm:py-8">
          No replies yet
        </p>
      )}
    </div>
  );
};

export default ConversationTimeline;
