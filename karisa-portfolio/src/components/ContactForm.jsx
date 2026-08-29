import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { trackFormSubmission } from '../utils/analytics';
import { contactFormSchema } from '../utils/validationSchemas';
import { getCSRFToken, clearCSRFToken } from '../utils/csrfTokens';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [csrfToken, setCSRFToken] = useState('');
  const lastSubmitTime = useRef(0);
  const formRef = useRef(null);

  // Initialize CSRF token on mount
  useEffect(() => {
    setCSRFToken(getCSRFToken());
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    getValues,
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    mode: 'onChange',
  });

  // Watch form values for character count
  const message = watch('message', '');

  // Rate limiting: Prevent spam submissions
  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    const minTimeBetweenSubmits = 30000; // 30 seconds

    if (timeSinceLastSubmit < minTimeBetweenSubmits && submitCount > 0) {
      const waitTime = Math.ceil((minTimeBetweenSubmits - timeSinceLastSubmit) / 1000);
      toast.error(`Please wait ${waitTime} seconds before submitting again`);
      return false;
    }

    // Allow max 5 submissions per session
    if (submitCount >= 5) {
      toast.error('Maximum submission limit reached. Please refresh the page.');
      return false;
    }

    return true;
  };

  const onSubmit = async (data) => {
    // Check rate limiting
    if (!checkRateLimit()) {
      return;
    }

    // Check honeypot.
    //
    // Read through getValues(), NOT off `data`. `data` is the zodResolver's parsed
    // output, and `contactFormSchema` has no `honeypot` key — zod strips unknown keys,
    // so `data.honeypot` was always undefined and this branch could never be taken.
    // The honeypot field was decorative and blocked nothing. getValues() reads
    // react-hook-form's own field state, which does include it.
    if (getValues('honeypot')) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get Supabase endpoint from env
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const endpoint = `${supabaseUrl}/functions/v1/send-notification`;

      // Send to Supabase Edge Function
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          type: 'contact',
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          subject: data.subject,
          message: data.message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }

      // Success handling
      toast.success('Message sent successfully! I\'ll get back to you soon.');

      // Clear old token and generate new one
      clearCSRFToken();
      setCSRFToken(getCSRFToken());

      // Update rate limiting
      lastSubmitTime.current = Date.now();
      setSubmitCount((prev) => prev + 1);

      // Track successful form submission
      trackFormSubmission('Contact Form', true);

      // Reset form
      reset();
    } catch (error) {
      console.error('Form submission error:', error);

      // Track failed form submission
      trackFormSubmission('Contact Form', false);

      // Error handling
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to send message. Please try again or email directly.';
      toast.error(errorMessage);

      // Track error (if error monitoring is set up)
      if (window.Sentry) {
        window.Sentry.captureException(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* Name Field */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-ink-50"
          >
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`w-full px-4 py-3 bg-ink-900/50 border  
              focus:outline-none focus:ring-2 transition-all duration-200
              text-ink-50 placeholder-ink-400
              ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-ink-800 focus:ring-signal/50 focus:border-signal'
              }`}
            placeholder="John Doe"
            {...register('name')}
          />
          <AnimatePresence mode="wait">
            {errors.name && (
              <motion.p
                id="name-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400 flex items-center gap-1"
                role="alert"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.name.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-ink-50"
          >
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`w-full px-4 py-3 bg-ink-900/50 border  
              focus:outline-none focus:ring-2 transition-all duration-200
              text-ink-50 placeholder-ink-400
              ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-ink-800 focus:ring-signal/50 focus:border-signal'
              }`}
            placeholder="john@example.com"
            {...register('email')}
          />
          <AnimatePresence mode="wait">
            {errors.email && (
              <motion.p
                id="email-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400 flex items-center gap-1"
                role="alert"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-ink-50"
          >
            Subject <span className="text-red-400">*</span>
          </label>
          <select
            id="subject"
            aria-invalid={errors.subject ? 'true' : 'false'}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            className={`w-full px-4 py-3 bg-ink-900/50 border 
              focus:outline-none focus:ring-2 transition-all duration-200
              text-ink-50
              ${
                errors.subject
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-ink-800 focus:ring-signal/50 focus:border-signal'
              }`}
            {...register('subject')}
          >
            <option value="">Select a subject...</option>
            <option value="Project Inquiry">Project Inquiry</option>
            <option value="Collaboration">Collaboration Opportunity</option>
            <option value="Job Opportunity">Job Opportunity</option>
            <option value="Speaking Engagement">Speaking Engagement</option>
            <option value="Consultation">Consultation</option>
            <option value="Other">Other</option>
          </select>
          <AnimatePresence mode="wait">
            {errors.subject && (
              <motion.p
                id="subject-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400 flex items-center gap-1"
                role="alert"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.subject.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-ink-50"
            >
              Message <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-ink-300">
              {message.length}/1000
            </span>
          </div>
          <textarea
            id="message"
            rows="6"
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : undefined}
            className={`w-full px-4 py-3 bg-ink-900/50 border  
              focus:outline-none focus:ring-2 transition-all duration-200
              text-ink-50 placeholder-ink-400 resize-none
              ${
                errors.message
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-ink-800 focus:ring-signal/50 focus:border-signal'
              }`}
            placeholder="Tell me about your project..."
            {...register('message')}
          />
          <AnimatePresence mode="wait">
            {errors.message && (
              <motion.p
                id="message-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400 flex items-center gap-1"
                role="alert"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.message.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Honeypot Field (hidden from users, visible to bots) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="honeypot">Leave this field empty</label>
          <input
            id="honeypot"
            type="text"
            tabIndex="-1"
            autoComplete="off"
            {...register('honeypot')}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !isValid}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className={`w-full py-4 px-6  font-semibold text-ink-50
            transition-all duration-200 flex items-center justify-center gap-2
            ${
              isSubmitting || !isValid
                ? 'bg-ink-700 cursor-not-allowed opacity-50'
                : 'bg-signal text-ink-950 hover:bg-signal-hover'
            }`}
          aria-label={isSubmitting ? 'Sending message' : 'Send message'}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send Message
            </>
          )}
        </motion.button>

        {/* Info Text */}
        <p className="text-sm text-ink-300 text-center">
          I typically respond within 24 hours
        </p>
      </form>
    </div>
  );
};

export default ContactForm;
