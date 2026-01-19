import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Zod validation schema
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  subject: z.string()
    .min(3, 'Subject must be at least 3 characters')
    .max(100, 'Subject must be less than 100 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  honeypot: z.string().max(0, 'Bot detected'), // Honeypot field
});

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const lastSubmitTime = useRef(0);
  const formRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(contactSchema),
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

    // Allow max 3 submissions per session
    if (submitCount >= 3) {
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

    // Check honeypot
    if (data.honeypot) {
      console.log('Bot detected');
      return;
    }

    setIsSubmitting(true);

    try {
      // EmailJS Configuration
      // Replace these with your actual EmailJS credentials
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

      // Send email via EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: data.name,
          from_email: data.email,
          subject: data.subject,
          message: data.message,
          to_name: 'Karisa',
          to_email: 'karisa@thebikecollector.info', // Your email
        },
        publicKey
      );

      // Success handling
      toast.success('Message sent successfully! I\'ll get back to you soon.');
      
      // Update rate limiting
      lastSubmitTime.current = Date.now();
      setSubmitCount((prev) => prev + 1);

      // Track event (if analytics is set up)
      if (window.gtag) {
        window.gtag('event', 'form_submission', {
          event_category: 'Contact',
          event_label: 'Contact Form',
        });
      }

      // Reset form
      reset();
    } catch (error) {
      console.error('EmailJS Error:', error);
      
      // Error handling
      if (error.text) {
        toast.error(`Failed to send message: ${error.text}`);
      } else {
        toast.error('Failed to send message. Please try again or email directly.');
      }

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
            className="block text-sm font-medium text-gray-200"
          >
            Name <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`w-full px-4 py-3 bg-[#0a1929]/50 border rounded-lg 
              focus:outline-none focus:ring-2 transition-all duration-200
              text-gray-100 placeholder-gray-500
              ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-[#005792]/30 focus:ring-[#61DAFB]/50 focus:border-[#61DAFB]'
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
            className="block text-sm font-medium text-gray-200"
          >
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`w-full px-4 py-3 bg-[#0a1929]/50 border rounded-lg 
              focus:outline-none focus:ring-2 transition-all duration-200
              text-gray-100 placeholder-gray-500
              ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-[#005792]/30 focus:ring-[#61DAFB]/50 focus:border-[#61DAFB]'
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
            className="block text-sm font-medium text-gray-200"
          >
            Subject <span className="text-red-400">*</span>
          </label>
          <input
            id="subject"
            type="text"
            aria-invalid={errors.subject ? 'true' : 'false'}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
            className={`w-full px-4 py-3 bg-[#0a1929]/50 border rounded-lg 
              focus:outline-none focus:ring-2 transition-all duration-200
              text-gray-100 placeholder-gray-500
              ${
                errors.subject
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-[#005792]/30 focus:ring-[#61DAFB]/50 focus:border-[#61DAFB]'
              }`}
            placeholder="Project inquiry"
            {...register('subject')}
          />
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
              className="block text-sm font-medium text-gray-200"
            >
              Message <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-gray-400">
              {message.length}/1000
            </span>
          </div>
          <textarea
            id="message"
            rows="6"
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : undefined}
            className={`w-full px-4 py-3 bg-[#0a1929]/50 border rounded-lg 
              focus:outline-none focus:ring-2 transition-all duration-200
              text-gray-100 placeholder-gray-500 resize-none
              ${
                errors.message
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-[#005792]/30 focus:ring-[#61DAFB]/50 focus:border-[#61DAFB]'
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
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white
            transition-all duration-200 flex items-center justify-center gap-2
            ${
              isSubmitting || !isValid
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[#61DAFB] to-[#005792] hover:shadow-lg hover:shadow-[#61DAFB]/20'
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
        <p className="text-sm text-gray-400 text-center">
          I typically respond within 24 hours
        </p>
      </form>
    </div>
  );
};

export default ContactForm;
