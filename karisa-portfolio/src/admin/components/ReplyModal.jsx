import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { replyFormSchema } from '../../utils/validationSchemas';
import { QUICK_REPLY_TEMPLATES, interpolateTemplate } from '../../utils/replyTemplates';

const ReplyModal = ({ submission, onClose, onReplySent, client }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(replyFormSchema),
    defaultValues: {
      submission_id: submission.id,
      reply_type: 'manual',
    },
  });

  const replyMessage = watch('reply_message', '');

  const handleTemplateSelect = (template) => {
    const interpolated = interpolateTemplate(template.content, {
      name: submission.name,
      subject: submission.subject,
    });
    setValue('reply_message', interpolated);
    setValue('reply_type', 'quick_reply');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Call edge function to send reply
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const endpoint = `${supabaseUrl}/functions/v1/send-reply`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await client.auth.getSession()).data?.session?.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reply');
      }

      toast.success('Reply sent successfully!');
      reset();
      onClose();
      onReplySent();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to send reply'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[60] flex items-end backdrop-blur"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-[#0a1929] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-lg shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0a1929] border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Reply to {submission.name}</h2>
            <p className="text-sm text-gray-400">Re: {submission.subject}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl font-light"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Quick Templates */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Quick Templates</label>
            <div className="space-y-2">
              {Object.entries(QUICK_REPLY_TEMPLATES).map(([category, templates]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2 capitalize">{category}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className="text-left p-2 border border-white/10 rounded hover:border-[#61DAFB] hover:bg-[#61DAFB]/10 transition text-sm text-gray-300 hover:text-white"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="reply_message" className="block text-sm font-semibold text-white">
                Your Reply *
              </label>
              <span className={`text-xs font-medium ${
                replyMessage.length >= 4900 ? 'text-red-400' : 'text-gray-500'
              }`}>
                {replyMessage.length}/5000
              </span>
            </div>
            <textarea
              {...register('reply_message')}
              id="reply_message"
              rows={8}
              placeholder="Type your reply here..."
              className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:outline-none focus:ring-2 resize-none text-white placeholder-gray-500 ${
                errors.reply_message
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : 'border-white/10 focus:ring-[#61DAFB]/50 focus:border-[#61DAFB]/50'
              }`}
            />
            {errors.reply_message && (
              <p className="mt-2 text-sm text-red-400">{errors.reply_message.message}</p>
            )}
          </div>

          {/* Original Message Reference */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-gray-300 hover:text-[#61DAFB] transition">
              Show original message
            </summary>
            <div className="mt-3 p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
              {submission.message}
            </div>
          </details>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-lg text-gray-300 font-medium hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                isSubmitting
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#61DAFB] to-[#005792] text-white hover:from-[#61DAFB]/90 hover:to-[#005792]/90'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReplyModal;
