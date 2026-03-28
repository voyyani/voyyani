import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { replyFormSchema } from '../../utils/validationSchemas';
import { QUICK_REPLY_TEMPLATES, interpolateTemplate } from '../../utils/replyTemplates';
import ResponsiveModal from './ResponsiveModal';

const ReplyModal = ({ submission, onClose, onReplySent, client, isOpen = true }) => {
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
    console.log('[ReplyModal] onSubmit called with data:', data);
    console.log('[ReplyModal] Form validation passed');

    // Dismiss keyboard on mobile
    if (typeof window !== 'undefined' && document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.blur();
    }

    setIsSubmitting(true);
    try {
      // Get session and token
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      console.log('[ReplyModal] Session fetch - error:', sessionError, 'has token:', !!sessionData?.session?.access_token);

      if (sessionError || !sessionData?.session?.access_token) {
        throw new Error('Authentication failed. Please refresh and try again.');
      }

      const token = sessionData.session.access_token;
      console.log('[ReplyModal] Token received:', {
        length: token.length,
        prefix: token.substring(0, 50),
        suffix: token.substring(token.length - 20),
        parts: token.split('.').length,
      });

      // Call edge function to send reply
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const endpoint = `${supabaseUrl}/functions/v1/send-reply`;

      console.log('[ReplyModal] Sending request to:', endpoint);
      console.log('[ReplyModal] Token available:', !!token);
      console.log('[ReplyModal] Request payload:', data);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('[ReplyModal] Response status:', response.status);
      console.log('[ReplyModal] Response headers:', Array.from(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('[ReplyModal] Error response data:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.log('[ReplyModal] Error response text:', text);
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('[ReplyModal] Success response:', result);

      toast.success('Reply sent successfully!');
      reset();
      // Close modal and refresh on success
      setIsSubmitting(false);
      onReplySent();
      setTimeout(() => onClose(), 300);
    } catch (error) {
      console.error('[ReplyModal] Error sending reply:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reply. Please try again.';
      toast.error(errorMessage);
      setIsSubmitting(false);
      // Don't close modal on error - let user try again
    }
  };


  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      position="bottom"
      size="md"
      closeButton={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="px-4 sm:px-5 md:px-6 space-y-4 sm:space-y-6">
        {/* Quick Templates - Responsive grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3">
            Quick Templates
          </label>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(QUICK_REPLY_TEMPLATES).map(([category, templates]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2 capitalize">
                  {category}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="text-left p-2 sm:p-3 border border-white/10 rounded hover:border-[#61DAFB] hover:bg-[#61DAFB]/10 transition text-xs sm:text-sm text-gray-300 hover:text-white"
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reply Message - Responsive textarea */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <label htmlFor="reply_message" className="block text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-0">
              Your Reply *
            </label>
            <span className={`text-xs font-medium ${
              replyMessage.length >= 4900 ? 'text-red-400' : 'text-gray-500'
            }`}>
              {replyMessage.length}/5000
            </span>
          </div>
          <textarea
            {...register('reply_message', { required: true })}
            id="reply_message"
            rows={6}
            placeholder="Type your reply here..."
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border rounded-lg focus:outline-none focus:ring-2 resize-none text-white placeholder-gray-500 text-sm ${
              errors.reply_message
                ? 'border-red-500/50 focus:ring-red-500/50'
                : 'border-white/10 focus:ring-[#61DAFB]/50 focus:border-[#61DAFB]/50'
            }`}
          />
          {errors.reply_message && (
            <p className="mt-2 text-xs sm:text-sm text-red-400">{errors.reply_message.message}</p>
          )}
        </motion.div>

        {/* Original Message Reference - Collapsible */}
        <motion.details
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="group"
        >
          <summary className="cursor-pointer text-xs sm:text-sm font-semibold text-gray-300 hover:text-[#61DAFB] transition">
            Show original message
          </summary>
          <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-sm text-gray-300 whitespace-pre-wrap">
            {submission.message}
          </div>
        </motion.details>

        {/* Validation Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs sm:text-sm text-red-400 font-semibold mb-2">Please fix the following errors:</p>
            <ul className="space-y-1 text-xs sm:text-sm text-red-400">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {error.message || `Invalid ${field}`}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons - Full width on mobile, responsive heights */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col-reverse sm:flex-row gap-3 justify-end"
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 h-10 sm:h-11 border border-white/10 rounded-lg text-gray-300 font-medium hover:bg-white/5 transition text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className={`w-full sm:w-auto px-6 h-10 sm:h-11 rounded-lg font-semibold transition text-sm ${
              isSubmitting || Object.keys(errors).length > 0
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#61DAFB] to-[#005792] text-white hover:from-[#61DAFB]/90 hover:to-[#005792]/90'
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Reply'}
          </button>
        </motion.div>
      </form>
    </ResponsiveModal>
  );
};

export default ReplyModal;
