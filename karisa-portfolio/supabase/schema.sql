-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'contact',
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_progress', 'responded', 'closed')),
  notes text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Submission Replies table
CREATE TABLE IF NOT EXISTS public.submission_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reply_message text NOT NULL,
  reply_type text DEFAULT 'manual'
    CHECK (reply_type IN ('manual', 'quick_reply', 'status_change')),
  sent_by uuid,
  resend_email_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Quick reply templates table
CREATE TABLE IF NOT EXISTS public.quick_reply_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  applicable_to text[] DEFAULT ARRAY['contact'],
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_email ON public.submissions(email);
CREATE INDEX idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX idx_replies_submission_id ON public.submission_replies(submission_id);
CREATE INDEX idx_replies_created_at ON public.submission_replies(created_at);

-- Row Level Security Policies
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_reply_templates ENABLE ROW LEVEL SECURITY;

-- Submissions: Anyone can insert (from contact form), authenticated admins can read/update
CREATE POLICY "submissions_insert_public" ON public.submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "submissions_read_admin" ON public.submissions
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

CREATE POLICY "submissions_update_admin" ON public.submissions
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

-- Submission Replies: Only authenticated admins can access
CREATE POLICY "replies_insert_admin" ON public.submission_replies
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

CREATE POLICY "replies_read_admin" ON public.submission_replies
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

-- Quick reply templates: Public read (for form hints), admin write
CREATE POLICY "templates_read_public" ON public.quick_reply_templates
  FOR SELECT USING (true);

CREATE POLICY "templates_insert_admin" ON public.quick_reply_templates
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'owner', 'super_admin')
    )
  );

CREATE POLICY "templates_update_admin" ON public.quick_reply_templates
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'owner', 'super_admin')
    )
  );

-- Insert default quick reply templates
INSERT INTO public.quick_reply_templates (category, title, content, applicable_to)
VALUES
  ('acknowledgement', 'Thank you', 'Thank you for reaching out, {name}! I appreciate your interest in {subject}. I will review your message and get back to you shortly.', ARRAY['contact']),
  ('acknowledgement', 'Message received', 'Hi {name},

I have received your message and will respond within 24-48 hours.

Best regards', ARRAY['contact']),
  ('information', 'Need more info', 'Thank you for your inquiry, {name}. To better assist you, could you please provide more details about {subject}?', ARRAY['contact']),
  ('collaboration', 'Very interested', 'Hi {name},

Thank you for reaching out about {subject}. I am very interested in exploring this opportunity further. Let''s discuss more details.', ARRAY['contact'])
ON CONFLICT DO NOTHING;
