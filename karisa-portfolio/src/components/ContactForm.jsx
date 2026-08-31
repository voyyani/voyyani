import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { trackFormSubmission } from '../utils/analytics';
import { contactFormSchema } from '../utils/validationSchemas';
import { getCSRFToken, clearCSRFToken } from '../utils/csrfTokens';

/**
 * Submission, validation, rate limiting, CSRF and the honeypot are unchanged from the
 * previous build — this pass restyled the form into the Kanga Sheet and did not touch
 * the pipeline behind it.
 *
 * One thing did change in the markup: the error icon is gone. It was a filled warning
 * glyph repeated four times whose only job was to say "this is an error", which the
 * word and the colour already say. What remains is the message.
 */

const ErrorNote = ({ id, children }) =>
  children ? (
    <p id={id} role="alert" className="mt-2 text-sm font-medium text-alarm">
      {children}
    </p>
  ) : null;

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [csrfToken, setCSRFToken] = useState('');
  const lastSubmitTime = useRef(0);
  const formRef = useRef(null);

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

  const message = watch('message', '');

  // Rate limiting: prevent spam submissions.
  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    const minTimeBetweenSubmits = 30000;

    if (timeSinceLastSubmit < minTimeBetweenSubmits && submitCount > 0) {
      const waitTime = Math.ceil((minTimeBetweenSubmits - timeSinceLastSubmit) / 1000);
      toast.error(`Please wait ${waitTime} seconds before submitting again`);
      return false;
    }

    if (submitCount >= 5) {
      toast.error('Maximum submission limit reached. Please refresh the page.');
      return false;
    }

    return true;
  };

  const onSubmit = async (data) => {
    if (!checkRateLimit()) return;

    // Read the honeypot through getValues(), NOT off `data`. `data` is the zodResolver's
    // parsed output and `contactFormSchema` has no `honeypot` key — zod strips unknown
    // keys, so `data.honeypot` was always undefined and this branch could never be taken.
    if (getValues('honeypot')) return;

    setIsSubmitting(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const endpoint = `${supabaseUrl}/functions/v1/send-notification`;

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

      toast.success("Message sent. I'll get back to you soon.");

      clearCSRFToken();
      setCSRFToken(getCSRFToken());

      lastSubmitTime.current = Date.now();
      setSubmitCount((prev) => prev + 1);

      trackFormSubmission('Contact Form', true);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
      trackFormSubmission('Contact Form', false);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send message. Please try again or email directly.';
      toast.error(errorMessage);

      if (window.Sentry) {
        window.Sentry.captureException(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Name <span className="text-alarm">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className="field"
            placeholder="Ngowa Karisa"
            {...register('name')}
          />
          <ErrorNote id="name-error">{errors.name?.message}</ErrorNote>
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            Email <span className="text-alarm">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="field"
            placeholder="you@organisation.org"
            {...register('email')}
          />
          <ErrorNote id="email-error">{errors.email?.message}</ErrorNote>
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="field-label">
          Subject <span className="text-alarm">*</span>
        </label>
        <select
          id="subject"
          aria-invalid={errors.subject ? 'true' : 'false'}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
          className="field"
          {...register('subject')}
        >
          <option value="">Select a subject…</option>
          <option value="Project Inquiry">Project Inquiry</option>
          <option value="Collaboration">Collaboration Opportunity</option>
          <option value="Job Opportunity">Job Opportunity</option>
          <option value="Speaking Engagement">Speaking Engagement</option>
          <option value="Consultation">Consultation</option>
          <option value="Other">Other</option>
        </select>
        <ErrorNote id="subject-error">{errors.subject?.message}</ErrorNote>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="message" className="field-label">
            Message <span className="text-alarm">*</span>
          </label>
          <span className="tabular mb-2 text-sm text-mark-500">{message.length}/1000</span>
        </div>
        <textarea
          id="message"
          rows="7"
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
          className="field resize-y"
          placeholder="What are you building, who uses it, and what does it have to survive?"
          {...register('message')}
        />
        <ErrorNote id="message-error">{errors.message?.message}</ErrorNote>
      </div>

      {/* Honeypot: hidden from people, visible to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="honeypot">Leave this field empty</label>
        <input id="honeypot" type="text" tabIndex="-1" autoComplete="off" {...register('honeypot')} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className="btn-pindo w-full py-4 disabled:cursor-not-allowed disabled:bg-cloth-400 disabled:text-mark-700"
        aria-label={isSubmitting ? 'Sending message' : 'Send message'}
      >
        {isSubmitting ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sending…
          </>
        ) : (
          <>
            Send message
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>

      <p className="text-sm text-mark-600">
        Usually answered within one working day, from Nairobi (UTC+3).
      </p>
    </form>
  );
};

export default ContactForm;
