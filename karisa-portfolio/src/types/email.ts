export type SubmissionStatus = 'new' | 'in_progress' | 'responded' | 'closed';
export type SubmissionType = 'contact';
export type ReplyType = 'manual' | 'quick_reply' | 'status_change';

export interface Submission {
  id: string;
  type: SubmissionType;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: SubmissionStatus;
  notes?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionReply {
  id: string;
  submission_id: string;
  reply_message: string;
  reply_type: ReplyType;
  sent_by?: string;
  resend_email_id?: string;
  created_at: string;
}

export interface QuickReplyTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
  applicable_to: string[];
  created_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ReplyFormData {
  submission_id: string;
  reply_message: string;
  reply_type: ReplyType;
  template_id?: string;
}

export interface SendNotificationPayload {
  type: SubmissionType;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SendReplyPayload {
  submission_id: string;
  reply_message: string;
  reply_type: ReplyType;
  template_id?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
