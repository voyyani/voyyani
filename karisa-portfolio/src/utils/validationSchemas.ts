import { z } from 'zod';

// Contact Form Validation
export const contactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z.string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      'Please enter a valid phone number'
    )
    .refine(
      (val) => !val || val.length >= 10,
      'Phone number must be at least 10 digits'
    ),
  subject: z.string()
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .trim()
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message must be less than 5000 characters')
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Admin Reply Form Validation
export const replyFormSchema = z.object({
  submission_id: z.string().uuid('Invalid submission ID'),
  reply_message: z.string()
    .trim()
    .min(10, 'Reply must be at least 10 characters')
    .max(5000, 'Reply must be less than 5000 characters'),
  reply_type: z.enum(['manual', 'quick_reply', 'status_change']).default('manual'),
  template_id: z.string().optional()
});

export type ReplyFormData = z.infer<typeof replyFormSchema>;

// Submission Status Update
export const statusUpdateSchema = z.object({
  submission_id: z.string().uuid('Invalid submission ID'),
  status: z.enum(['new', 'in_progress', 'responded', 'closed']),
  notes: z.string().optional()
});

export type StatusUpdateData = z.infer<typeof statusUpdateSchema>;

// Notes Update
export const notesUpdateSchema = z.object({
  submission_id: z.string().uuid('Invalid submission ID'),
  notes: z.string()
    .trim()
    .max(2000, 'Notes must be less than 2000 characters')
});

export type NotesUpdateData = z.infer<typeof notesUpdateSchema>;
