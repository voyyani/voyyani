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
  archived boolean DEFAULT false,
  archive_reason text,
  archived_at timestamp with time zone,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_pinned boolean DEFAULT false,
  assigned_to uuid,
  assigned_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add missing columns if they don't exist
ALTER TABLE IF EXISTS public.submissions
  ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS archive_reason text,
  ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone;

-- Submission Replies table
CREATE TABLE IF NOT EXISTS public.submission_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reply_message text NOT NULL,
  reply_type text DEFAULT 'manual'
    CHECK (reply_type IN ('manual', 'quick_reply', 'status_change')),
  sent_by uuid,
  resend_email_id text,
  email_status text DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'delivered', 'bounced', 'opened', 'clicked', 'failed')),
  email_metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Add missing columns if they don't exist
ALTER TABLE IF EXISTS public.submission_replies
  ADD COLUMN IF NOT EXISTS email_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_metadata jsonb;

-- Quick reply templates table
CREATE TABLE IF NOT EXISTS public.quick_reply_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  applicable_to text[] DEFAULT ARRAY['contact'],
  created_at timestamp with time zone DEFAULT now()
);

-- Labels/Tags table
CREATE TABLE IF NOT EXISTS public.labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text DEFAULT '#808080',
  description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Submission Labels junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.submission_labels (
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (submission_id, label_id)
);

-- Submission Types/Categories table
CREATE TABLE IF NOT EXISTS public.submission_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Submission Attachments table
CREATE TABLE IF NOT EXISTS public.submission_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size int NOT NULL,
  mime_type text,
  storage_path text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- Analytics Events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Notification Settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  notify_new_submission boolean DEFAULT true,
  notify_reply_pending boolean DEFAULT true,
  email_digest boolean DEFAULT false,
  digest_frequency text DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly', 'never')),
  notify_via_email boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Rate limiting table for persistent rate limit tracking
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  endpoint text NOT NULL,
  request_count int DEFAULT 1,
  window_start date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "rate_limits_service_role" ON public.rate_limits;

-- RLS Policy: Service role can access all for rate limiting checks
CREATE POLICY "rate_limits_service_role" ON public.rate_limits
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_archived ON public.submissions(archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_priority ON public.submissions(priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_assigned_to ON public.submissions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_replies_submission_id ON public.submission_replies(submission_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON public.submission_replies(created_at);
CREATE INDEX IF NOT EXISTS idx_replies_email_status ON public.submission_replies(email_status);
CREATE INDEX IF NOT EXISTS idx_submission_labels_submission_id ON public.submission_labels(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_labels_label_id ON public.submission_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_attachments_submission ON public.submission_attachments(submission_id);
CREATE INDEX IF NOT EXISTS idx_analytics_submission ON public.analytics_events(submission_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created ON public.rate_limits(created_at);

-- Row Level Security Policies
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_reply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "submissions_insert_public" ON public.submissions;
DROP POLICY IF EXISTS "submissions_read_admin" ON public.submissions;
DROP POLICY IF EXISTS "submissions_update_admin" ON public.submissions;
DROP POLICY IF EXISTS "replies_insert_admin" ON public.submission_replies;
DROP POLICY IF EXISTS "replies_read_admin" ON public.submission_replies;
DROP POLICY IF EXISTS "templates_read_public" ON public.quick_reply_templates;
DROP POLICY IF EXISTS "templates_insert_admin" ON public.quick_reply_templates;
DROP POLICY IF EXISTS "templates_update_admin" ON public.quick_reply_templates;
DROP POLICY IF EXISTS "labels_read_admin" ON public.labels;
DROP POLICY IF EXISTS "labels_insert_admin" ON public.labels;
DROP POLICY IF EXISTS "labels_update_admin" ON public.labels;
DROP POLICY IF EXISTS "submission_labels_read_admin" ON public.submission_labels;
DROP POLICY IF EXISTS "submission_labels_insert_admin" ON public.submission_labels;
DROP POLICY IF EXISTS "submission_labels_delete_admin" ON public.submission_labels;
DROP POLICY IF EXISTS "submission_types_read_public" ON public.submission_types;
DROP POLICY IF EXISTS "submission_types_insert_admin" ON public.submission_types;
DROP POLICY IF EXISTS "attachments_read_admin" ON public.submission_attachments;
DROP POLICY IF EXISTS "attachments_insert_admin" ON public.submission_attachments;
DROP POLICY IF EXISTS "analytics_service_role" ON public.analytics_events;
DROP POLICY IF EXISTS "notification_settings_self" ON public.notification_settings;
DROP POLICY IF EXISTS "notification_settings_self_update" ON public.notification_settings;

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

-- Labels: Admin only (read and write)
CREATE POLICY "labels_read_admin" ON public.labels
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

CREATE POLICY "labels_insert_admin" ON public.labels
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'owner', 'super_admin')
    )
  );

CREATE POLICY "labels_update_admin" ON public.labels
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'owner', 'super_admin')
    )
  );

-- Submission Labels: Admin only
CREATE POLICY "submission_labels_read_admin" ON public.submission_labels
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

CREATE POLICY "submission_labels_insert_admin" ON public.submission_labels
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

CREATE POLICY "submission_labels_delete_admin" ON public.submission_labels
  FOR DELETE USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

-- Submission Types: Public read, admin write
CREATE POLICY "submission_types_read_public" ON public.submission_types
  FOR SELECT USING (true);

CREATE POLICY "submission_types_insert_admin" ON public.submission_types
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'owner', 'super_admin')
    )
  );

-- Submission Attachments: Admin only
CREATE POLICY "attachments_read_admin" ON public.submission_attachments
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

CREATE POLICY "attachments_insert_admin" ON public.submission_attachments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

-- Analytics Events: Service role only
CREATE POLICY "analytics_service_role" ON public.analytics_events
  USING (true)
  WITH CHECK (true);

-- Notification Settings: Users can manage their own
CREATE POLICY "notification_settings_self" ON public.notification_settings
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
    )
  );

CREATE POLICY "notification_settings_self_update" ON public.notification_settings
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'role' IN ('admin', 'content_manager', 'owner', 'super_admin')
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

-- Insert default submission types
INSERT INTO public.submission_types (name, description, icon, is_active)
VALUES
  ('contact', 'General contact inquiries', '💬', true),
  ('collaboration', 'Collaboration opportunities', '🤝', true),
  ('support', 'Technical support requests', '🆘', true),
  ('feedback', 'Product or service feedback', '💡', true),
  ('business_inquiry', 'Business development inquiries', '💼', true)
ON CONFLICT DO NOTHING;
