import React from 'react';

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
    <div className="space-y-6">
      {/* Original Message */}
      <div className="relative pl-6 border-l-4 border-l-[#61DAFB]">
        <div className="absolute -left-3 top-0 w-6 h-6 bg-[#61DAFB] rounded-full border-4 border-[#0a1929]"></div>
        <div className="bg-[#61DAFB]/10 border border-[#61DAFB]/30 p-4 rounded-lg">
          <p className="text-xs font-semibold text-[#61DAFB] uppercase mb-2">Original Message</p>
          <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
            {originalMessage}
          </p>
        </div>
      </div>

      {/* Replies */}
      {replies.map((reply) => (
        <div
          key={reply.id}
          className={`relative pl-6 border-l-4 ${getReplyTypeColor(reply.reply_type)}`}
        >
          <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border-4 border-[#0a1929] ${
            reply.reply_type === 'manual' ? 'bg-blue-400' :
            reply.reply_type === 'quick_reply' ? 'bg-amber-400' :
            'bg-purple-400'
          }`}></div>

          <div className={`${getReplyTypeBg(reply.reply_type)} border border-white/10 p-4 rounded-lg`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-300">
                {getReplyTypeLabel(reply.reply_type)}
              </p>
              <span className="text-xs text-gray-500">
                {new Date(reply.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {reply.reply_message}
            </p>
            {reply.resend_email_id && (
              <p className="text-xs text-gray-500 mt-2">
                Email ID: {reply.resend_email_id}
              </p>
            )}
          </div>
        </div>
      ))}

      {replies.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-4">No replies yet</p>
      )}
    </div>
  );
};

export default ConversationTimeline;
