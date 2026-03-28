-- ============================================================
-- WORLD-CLASS INBOUND EMAIL SYSTEM MIGRATION
-- ============================================================
-- Purpose: Enable receiving and processing email replies from users
-- Email Format: reply+{submission_id}@voyani.tech
-- Features:
--   - Full email thread tracking (In-Reply-To, References headers)
--   - Attachment storage and management
--   - Spam detection and security validation
--   - Conversation timeline view (outbound + inbound)
--   - Auto-update submission status on reply
--   - Analytics integration
--   - Performance optimized with indexes
--   - RLS policies for security
-- ============================================================

-- ============================================================
-- TABLE: inbound_replies
-- Stores email replies received from users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inbound_replies (
  -- Primary identification
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,

  -- Email addresses (from/to)
  from_email text NOT NULL,
  from_name text,
  to_email text NOT NULL, -- The reply+{submission_id}@voyani.tech address used
  reply_to_email text, -- If user specified different Reply-To

  -- Email content
  subject text NOT NULL,
  body_html text,      -- Rich HTML version
  body_text text,      -- Plain text version
  body_preview text GENERATED ALWAYS AS (
    CASE
      WHEN body_text IS NOT NULL THEN
        left(regexp_replace(body_text, '\s+', ' ', 'g'), 200)
      ELSE
        left(regexp_replace(body_html, '<[^>]*>', '', 'g'), 200)
    END
  ) STORED,            -- Auto-generated preview (first 200 chars)

  -- Email threading headers (RFC 2822)
  message_id text UNIQUE NOT NULL, -- Unique identifier for this email
  in_reply_to text,                -- Message-ID this email replies to
  "references" text[],             -- Full thread chain of Message-IDs
  thread_id text,                  -- Computed thread identifier

  -- Resend integration
  resend_email_id text UNIQUE,     -- Resend's unique email ID
  resend_raw_payload jsonb,        -- Full webhook payload for debugging

  -- Processing workflow
  status text NOT NULL DEFAULT 'received' CHECK (status IN (
    'received',      -- Email received, queued for processing
    'processing',    -- Currently being processed
    'processed',     -- Successfully processed and stored
    'failed',        -- Processing failed (check processing_error)
    'spam',          -- Marked as spam by filters
    'quarantined',   -- Suspicious content, needs manual review
    'archived'       -- User archived this reply
  )),
  processing_error text,           -- Error details if processing failed
  processing_attempts int DEFAULT 0, -- Retry counter

  -- Spam & Security
  spam_score decimal(5,2),         -- Spam probability (0.00 - 10.00)
  is_spam boolean DEFAULT false,   -- Final spam determination
  spam_reasons text[],             -- Why this was marked as spam
  security_checks jsonb DEFAULT jsonb_build_object(
    'spf', 'unknown',
    'dkim', 'unknown',
    'dmarc', 'unknown',
    'tls', 'unknown'
  ),                               -- SPF, DKIM, DMARC, TLS validation results

  -- Source validation
  sender_ip_address inet,          -- IP address of sender
  sender_user_agent text,          -- Email client used
  is_sender_verified boolean DEFAULT false, -- Does sender match original submission?
  sender_verification_note text,   -- Why verification passed/failed

  -- Content metadata
  has_attachments boolean DEFAULT false,
  attachment_count int DEFAULT 0,
  total_attachment_size bigint DEFAULT 0, -- Total size in bytes
  contains_links boolean DEFAULT false,
  link_count int DEFAULT 0,

  -- Admin actions
  is_read boolean DEFAULT false,   -- Has admin read this?
  read_at timestamp with time zone,
  read_by uuid,                    -- Admin user who read it
  is_important boolean DEFAULT false,
  admin_notes text,                -- Private admin notes about this reply

  -- Timestamps
  received_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_email_addresses CHECK (
    from_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  CONSTRAINT valid_spam_score CHECK (spam_score IS NULL OR (spam_score >= 0 AND spam_score <= 10))
);

-- Table comments for documentation
COMMENT ON TABLE public.inbound_replies IS 'Stores email replies received from users via reply+{submission_id}@voyani.tech';
COMMENT ON COLUMN public.inbound_replies.message_id IS 'RFC 2822 Message-ID header for email threading';
COMMENT ON COLUMN public.inbound_replies."references" IS 'Array of Message-IDs showing full email thread ancestry';
COMMENT ON COLUMN public.inbound_replies.spam_score IS 'Calculated spam probability (0=clean, 10=definitely spam)';
COMMENT ON COLUMN public.inbound_replies.security_checks IS 'JSON object with SPF/DKIM/DMARC/TLS validation results';

-- ============================================================
-- TABLE: inbound_attachments
-- Stores file attachments from inbound emails
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inbound_attachments (
  -- Primary identification
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inbound_reply_id uuid NOT NULL REFERENCES public.inbound_replies(id) ON DELETE CASCADE,

  -- File metadata
  file_name text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  mime_type text NOT NULL,
  file_extension text GENERATED ALWAYS AS (
    lower(substring(file_name from '\.([^.]+)$'))
  ) STORED,

  -- Content identification
  content_id text,                 -- For inline images (CID references in HTML)
  content_disposition text DEFAULT 'attachment', -- 'attachment' or 'inline'
  is_inline boolean DEFAULT false, -- Is this embedded in email body?

  -- Storage location (Supabase Storage)
  storage_bucket text NOT NULL DEFAULT 'inbound-attachments',
  storage_path text NOT NULL UNIQUE, -- Path: {submission_id}/{reply_id}/{filename}
  public_url text,                 -- Public URL if file is made public

  -- Security & Safety
  is_safe boolean DEFAULT true,
  is_executable boolean GENERATED ALWAYS AS (
    lower(substring(file_name from '\.([^.]+)$')) IN ('exe', 'bat', 'cmd', 'sh', 'ps1', 'app', 'deb', 'rpm', 'dmg', 'pkg')
  ) STORED,
  virus_scan_status text DEFAULT 'pending' CHECK (virus_scan_status IN (
    'pending', 'clean', 'infected', 'suspicious', 'error'
  )),
  virus_scan_result jsonb,         -- Full scan results from antivirus
  virus_scan_at timestamp with time zone,

  -- Download tracking
  download_count int DEFAULT 0,
  last_downloaded_at timestamp with time zone,
  last_downloaded_by uuid,

  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size <= 26214400), -- Max 25MB per file
  CONSTRAINT valid_mime_type CHECK (mime_type ~* '^[a-z]+/[a-z0-9.-]+$')
);

COMMENT ON TABLE public.inbound_attachments IS 'File attachments from inbound email replies';
COMMENT ON COLUMN public.inbound_attachments.content_id IS 'Content-ID for inline images referenced in HTML email body';
COMMENT ON COLUMN public.inbound_attachments.is_executable IS 'Auto-detected: whether file is potentially executable (security risk)';
COMMENT ON COLUMN public.inbound_attachments.storage_path IS 'Unique path in Supabase Storage bucket';

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Inbound Replies Indexes
CREATE INDEX IF NOT EXISTS idx_inbound_replies_submission
  ON public.inbound_replies(submission_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbound_replies_from_email
  ON public.inbound_replies(from_email, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbound_replies_status
  ON public.inbound_replies(status, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbound_replies_spam
  ON public.inbound_replies(is_spam, spam_score DESC)
  WHERE is_spam = true;

CREATE INDEX IF NOT EXISTS idx_inbound_replies_unread
  ON public.inbound_replies(is_read, received_at DESC)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_inbound_replies_message_id
  ON public.inbound_replies(message_id);

CREATE INDEX IF NOT EXISTS idx_inbound_replies_thread
  ON public.inbound_replies(thread_id, received_at DESC)
  WHERE thread_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inbound_replies_resend_id
  ON public.inbound_replies(resend_email_id)
  WHERE resend_email_id IS NOT NULL;

-- Full-text search on email body
CREATE INDEX IF NOT EXISTS idx_inbound_replies_body_search
  ON public.inbound_replies USING gin(to_tsvector('english', coalesce(body_text, '')));

-- Inbound Attachments Indexes
CREATE INDEX IF NOT EXISTS idx_inbound_attachments_reply
  ON public.inbound_attachments(inbound_reply_id);

CREATE INDEX IF NOT EXISTS idx_inbound_attachments_unsafe
  ON public.inbound_attachments(is_safe, virus_scan_status)
  WHERE is_safe = false OR virus_scan_status != 'clean';

CREATE INDEX IF NOT EXISTS idx_inbound_attachments_mime_type
  ON public.inbound_attachments(mime_type);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function: Extract submission_id from reply email address
-- Example: reply+550e8400-e29b-41d4-a716-446655440000@voyani.tech -> uuid
CREATE OR REPLACE FUNCTION public.extract_submission_id_from_email(email_address text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  submission_id_str text;
BEGIN
  -- Match pattern: reply+{uuid}@domain.tld
  submission_id_str := substring(email_address FROM 'reply\+([a-f0-9-]{36})@');

  IF submission_id_str IS NULL THEN
    RETURN NULL;
  END IF;

  -- Validate UUID format and cast
  BEGIN
    RETURN submission_id_str::uuid;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$;

COMMENT ON FUNCTION public.extract_submission_id_from_email IS
  'Extracts submission UUID from reply+{id}@voyani.tech email addresses';

-- Function: Generate thread ID from message references
-- Creates consistent thread identifier from email headers
CREATE OR REPLACE FUNCTION public.generate_thread_id(
  p_message_id text,
  p_in_reply_to text,
  p_references text[]
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Use the oldest Message-ID in the chain as thread ID
  IF p_references IS NOT NULL AND array_length(p_references, 1) > 0 THEN
    RETURN p_references[1]; -- First reference is the root
  ELSIF p_in_reply_to IS NOT NULL THEN
    RETURN p_in_reply_to;
  ELSE
    RETURN p_message_id; -- This is the start of a new thread
  END IF;
END;
$$;

COMMENT ON FUNCTION public.generate_thread_id IS
  'Generates consistent thread identifier from email Message-ID headers';

-- Function: Calculate spam score based on multiple factors
CREATE OR REPLACE FUNCTION public.calculate_spam_score(
  p_security_checks jsonb,
  p_subject text,
  p_body_text text,
  p_from_email text,
  p_sender_verified boolean
)
RETURNS decimal
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  score decimal := 0.0;
  suspicious_patterns text[] := ARRAY[
    'viagra', 'cialis', 'lottery', 'winner', 'congratulations',
    'click here', 'act now', 'limited time', 'free money', 'get rich',
    'nigerian prince', 'inheritance', 'wire transfer', 'western union'
  ];
  pattern text;
BEGIN
  -- SPF failure: +2.0
  IF (p_security_checks->>'spf') = 'fail' THEN
    score := score + 2.0;
  END IF;

  -- DKIM failure: +2.0
  IF (p_security_checks->>'dkim') = 'fail' THEN
    score := score + 2.0;
  END IF;

  -- DMARC failure: +1.5
  IF (p_security_checks->>'dmarc') = 'fail' THEN
    score := score + 1.5;
  END IF;

  -- Sender not verified: +1.0
  IF NOT p_sender_verified THEN
    score := score + 1.0;
  END IF;

  -- Suspicious keywords in subject/body: +0.5 per match (max +3.0)
  FOREACH pattern IN ARRAY suspicious_patterns LOOP
    IF lower(p_subject || ' ' || coalesce(p_body_text, '')) LIKE '%' || pattern || '%' THEN
      score := score + 0.5;
      EXIT WHEN score >= 10.0; -- Cap at 10.0
    END IF;
  END LOOP;

  -- ALL CAPS subject (shouting): +1.0
  IF length(p_subject) > 10 AND p_subject = upper(p_subject) THEN
    score := score + 1.0;
  END IF;

  -- Excessive exclamation marks: +0.5
  IF (length(p_subject) - length(replace(p_subject, '!', ''))) > 2 THEN
    score := score + 0.5;
  END IF;

  -- Clamp score to [0, 10]
  RETURN LEAST(10.0, GREATEST(0.0, score));
END;
$$;

COMMENT ON FUNCTION public.calculate_spam_score IS
  'Calculates spam probability score (0-10) based on multiple heuristics';

-- Function: Verify sender matches original submission
CREATE OR REPLACE FUNCTION public.verify_sender_email(
  p_submission_id uuid,
  p_from_email text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  original_email text;
BEGIN
  SELECT email INTO original_email
  FROM public.submissions
  WHERE id = p_submission_id;

  IF original_email IS NULL THEN
    RETURN false;
  END IF;

  -- Case-insensitive comparison
  RETURN lower(original_email) = lower(p_from_email);
END;
$$;

COMMENT ON FUNCTION public.verify_sender_email IS
  'Verifies that inbound reply sender matches original submission email';

-- ============================================================
-- TRIGGERS: Auto-update logic
-- ============================================================

-- Trigger Function: Update submission status when inbound reply arrives
CREATE OR REPLACE FUNCTION public.handle_inbound_reply_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update submission status to show user has replied
  UPDATE public.submissions
  SET
    status = CASE
      WHEN status = 'new' THEN 'in_progress'
      WHEN status = 'responded' THEN 'in_progress' -- User responded back
      ELSE status -- Keep 'closed' or other statuses
    END,
    updated_at = now()
  WHERE id = NEW.submission_id
    AND status IN ('new', 'responded'); -- Only update if not closed

  RETURN NEW;
END;
$$;

-- Trigger: Apply status update on new inbound reply
CREATE TRIGGER trigger_inbound_reply_update_submission
  AFTER INSERT ON public.inbound_replies
  FOR EACH ROW
  WHEN (NEW.status = 'processed' AND NEW.is_spam = false)
  EXECUTE FUNCTION public.handle_inbound_reply_trigger();

COMMENT ON TRIGGER trigger_inbound_reply_update_submission ON public.inbound_replies IS
  'Auto-updates submission status to in_progress when user replies';

-- Trigger Function: Set thread_id on insert
CREATE OR REPLACE FUNCTION public.set_thread_id_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.thread_id IS NULL THEN
    NEW.thread_id := public.generate_thread_id(
      NEW.message_id,
      NEW.in_reply_to,
      NEW."references"
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_thread_id
  BEFORE INSERT ON public.inbound_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_thread_id_trigger();

-- Trigger Function: Update attachment count in inbound_replies
CREATE OR REPLACE FUNCTION public.update_attachment_metadata_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.inbound_replies
    SET
      has_attachments = true,
      attachment_count = attachment_count + 1,
      total_attachment_size = total_attachment_size + NEW.file_size
    WHERE id = NEW.inbound_reply_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.inbound_replies
    SET
      attachment_count = GREATEST(0, attachment_count - 1),
      total_attachment_size = GREATEST(0, total_attachment_size - OLD.file_size),
      has_attachments = (attachment_count - 1) > 0
    WHERE id = OLD.inbound_reply_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_update_attachment_metadata
  AFTER INSERT OR DELETE ON public.inbound_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_attachment_metadata_trigger();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_inbound_replies_updated_at
  BEFORE UPDATE ON public.inbound_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_inbound_attachments_updated_at
  BEFORE UPDATE ON public.inbound_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ANALYTICS INTEGRATION
-- ============================================================

-- Trigger Function: Log analytics event for inbound replies
CREATE OR REPLACE FUNCTION public.log_inbound_reply_analytics_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.analytics_events (submission_id, event_type, event_data)
  VALUES (
    NEW.submission_id,
    CASE
      WHEN NEW.is_spam THEN 'inbound_reply_spam'
      WHEN NEW.status = 'failed' THEN 'inbound_reply_failed'
      ELSE 'inbound_reply_received'
    END,
    jsonb_build_object(
      'inbound_reply_id', NEW.id,
      'from_email', NEW.from_email,
      'has_attachments', NEW.has_attachments,
      'attachment_count', NEW.attachment_count,
      'spam_score', NEW.spam_score,
      'is_spam', NEW.is_spam,
      'sender_verified', NEW.is_sender_verified,
      'status', NEW.status
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_inbound_reply_analytics
  AFTER INSERT ON public.inbound_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.log_inbound_reply_analytics_trigger();

COMMENT ON TRIGGER trigger_log_inbound_reply_analytics ON public.inbound_replies IS
  'Logs analytics events for all inbound replies (tracking, spam detection, failures)';

-- ============================================================
-- VIEWS: Conversation Timeline
-- ============================================================

-- View: Combined conversation timeline (outbound + inbound)
CREATE OR REPLACE VIEW public.submission_conversation_timeline AS
SELECT
  s.id as submission_id,
  s.email as user_email,
  s.name as user_name,
  s.subject as original_subject,
  s.status as submission_status,
  s.created_at as submission_created_at,

  -- Count statistics
  (SELECT COUNT(*) FROM public.submission_replies WHERE submission_id = s.id) as outbound_count,
  (SELECT COUNT(*) FROM public.inbound_replies WHERE submission_id = s.id AND is_spam = false) as inbound_count,
  (SELECT COUNT(*) FROM public.inbound_replies WHERE submission_id = s.id AND is_read = false AND is_spam = false) as unread_inbound_count,

  -- Latest activity timestamps
  GREATEST(
    s.created_at,
    (SELECT MAX(created_at) FROM public.submission_replies WHERE submission_id = s.id),
    (SELECT MAX(received_at) FROM public.inbound_replies WHERE submission_id = s.id)
  ) as last_activity_at,

  -- Latest message preview
  COALESCE(
    (SELECT body_preview FROM public.inbound_replies WHERE submission_id = s.id ORDER BY received_at DESC LIMIT 1),
    (SELECT left(reply_message, 200) FROM public.submission_replies WHERE submission_id = s.id ORDER BY created_at DESC LIMIT 1),
    left(s.message, 200)
  ) as latest_message_preview,

  -- Aggregated messages (for detailed view)
  (
    SELECT json_agg(
      json_build_object(
        'type', 'outbound',
        'id', sr.id,
        'message', sr.reply_message,
        'sent_by', sr.sent_by,
        'email_status', sr.email_status,
        'timestamp', sr.created_at
      ) ORDER BY sr.created_at
    )
    FROM public.submission_replies sr
    WHERE sr.submission_id = s.id
  ) as outbound_messages,

  (
    SELECT json_agg(
      json_build_object(
        'type', 'inbound',
        'id', ir.id,
        'from_email', ir.from_email,
        'from_name', ir.from_name,
        'subject', ir.subject,
        'body_html', ir.body_html,
        'body_text', ir.body_text,
        'body_preview', ir.body_preview,
        'has_attachments', ir.has_attachments,
        'attachment_count', ir.attachment_count,
        'is_spam', ir.is_spam,
        'is_read', ir.is_read,
        'timestamp', ir.received_at
      ) ORDER BY ir.received_at
    )
    FROM public.inbound_replies ir
    WHERE ir.submission_id = s.id AND ir.is_spam = false
  ) as inbound_messages

FROM public.submissions s;

COMMENT ON VIEW public.submission_conversation_timeline IS
  'Unified view of submission conversations with outbound and inbound messages aggregated';

-- View: Spam quarantine (for admin review)
CREATE OR REPLACE VIEW public.inbound_spam_quarantine AS
SELECT
  ir.id,
  ir.submission_id,
  s.name as submission_name,
  s.email as expected_sender,
  ir.from_email as actual_sender,
  ir.subject,
  ir.body_preview,
  ir.spam_score,
  ir.spam_reasons,
  ir.security_checks,
  ir.is_sender_verified,
  ir.received_at,
  ir.created_at
FROM public.inbound_replies ir
JOIN public.submissions s ON s.id = ir.submission_id
WHERE ir.is_spam = true OR ir.status = 'quarantined'
ORDER BY ir.spam_score DESC, ir.received_at DESC;

COMMENT ON VIEW public.inbound_spam_quarantine IS
  'All inbound replies flagged as spam or quarantined for admin review';

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.inbound_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbound_attachments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "inbound_replies_admin_all" ON public.inbound_replies;
DROP POLICY IF EXISTS "inbound_replies_service_role" ON public.inbound_replies;
DROP POLICY IF EXISTS "inbound_attachments_admin_all" ON public.inbound_attachments;
DROP POLICY IF EXISTS "inbound_attachments_service_role" ON public.inbound_attachments;

-- Policy: Admin users can access all inbound replies
CREATE POLICY "inbound_replies_admin_all" ON public.inbound_replies
  FOR ALL USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

-- Policy: Service role has full access (for webhook processing)
CREATE POLICY "inbound_replies_service_role" ON public.inbound_replies
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- Policy: Admin users can access all attachments
CREATE POLICY "inbound_attachments_admin_all" ON public.inbound_attachments
  FOR ALL USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

-- Policy: Service role has full access
CREATE POLICY "inbound_attachments_service_role" ON public.inbound_attachments
  FOR ALL USING (
    auth.role() = 'service_role'
  );

-- ============================================================
-- UTILITY FUNCTIONS FOR ADMIN
-- ============================================================

-- Function: Mark inbound reply as read
CREATE OR REPLACE FUNCTION public.mark_inbound_reply_read(
  p_reply_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.inbound_replies
  SET
    is_read = true,
    read_at = now(),
    read_by = COALESCE(p_user_id, auth.uid())
  WHERE id = p_reply_id;
END;
$$;

COMMENT ON FUNCTION public.mark_inbound_reply_read IS
  'Marks an inbound reply as read by admin user';

-- Function: Get conversation statistics
CREATE OR REPLACE FUNCTION public.get_submission_conversation_stats(p_submission_id uuid)
RETURNS TABLE (
  outbound_count bigint,
  inbound_count bigint,
  total_messages bigint,
  avg_response_time_hours numeric,
  has_unread_inbound boolean,
  last_activity_at timestamptz
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.submission_replies WHERE submission_id = p_submission_id),
    (SELECT COUNT(*) FROM public.inbound_replies WHERE submission_id = p_submission_id AND is_spam = false),
    (
      (SELECT COUNT(*) FROM public.submission_replies WHERE submission_id = p_submission_id) +
      (SELECT COUNT(*) FROM public.inbound_replies WHERE submission_id = p_submission_id AND is_spam = false)
    ),
    (
      SELECT AVG(EXTRACT(EPOCH FROM (ir.received_at - sr.created_at)) / 3600)
      FROM public.submission_replies sr
      JOIN public.inbound_replies ir ON ir.submission_id = sr.submission_id
      WHERE sr.submission_id = p_submission_id
        AND ir.received_at > sr.created_at
    ),
    EXISTS(
      SELECT 1 FROM public.inbound_replies
      WHERE submission_id = p_submission_id
        AND is_read = false
        AND is_spam = false
    ),
    GREATEST(
      (SELECT MAX(created_at) FROM public.submission_replies WHERE submission_id = p_submission_id),
      (SELECT MAX(received_at) FROM public.inbound_replies WHERE submission_id = p_submission_id)
    );
END;
$$;

COMMENT ON FUNCTION public.get_submission_conversation_stats IS
  'Returns detailed statistics for a submission conversation';

-- ============================================================
-- INITIAL DATA & CONFIGURATION
-- ============================================================

-- Insert example spam patterns (can be customized)
CREATE TABLE IF NOT EXISTS public.spam_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text NOT NULL UNIQUE,
  pattern_type text NOT NULL CHECK (pattern_type IN ('keyword', 'regex', 'domain')),
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  score_weight decimal(3,1) DEFAULT 0.5,
  is_active boolean DEFAULT true,
  description text,
  created_at timestamp with time zone DEFAULT now()
);

COMMENT ON TABLE public.spam_patterns IS
  'Configurable spam detection patterns (keywords, regex, domains)';

INSERT INTO public.spam_patterns (pattern, pattern_type, severity, score_weight, description)
VALUES
  ('viagra|cialis|levitra', 'regex', 'high', 2.0, 'Pharmaceutical spam'),
  ('lottery winner|you won|prize money', 'regex', 'high', 2.0, 'Lottery/prize scams'),
  ('nigerian prince|wire transfer|western union', 'regex', 'high', 3.0, 'Financial scams'),
  ('click here now|act now|limited time offer', 'regex', 'medium', 1.0, 'Urgency tactics'),
  ('free money|get rich|earn from home', 'regex', 'medium', 1.5, 'Money scams')
ON CONFLICT (pattern) DO NOTHING;

-- Enable RLS on spam_patterns
ALTER TABLE public.spam_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spam_patterns_admin_read" ON public.spam_patterns
  FOR SELECT USING (
    public.has_any_role(ARRAY['admin', 'owner', 'super_admin'])
  );

CREATE POLICY "spam_patterns_admin_write" ON public.spam_patterns
  FOR ALL USING (
    public.has_any_role(ARRAY['admin', 'owner', 'super_admin'])
  );

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '✅ Inbound Email System Migration Complete!';
  RAISE NOTICE '📧 Email Format: reply+{submission_id}@voyani.tech';
  RAISE NOTICE '🔒 RLS Policies: Enabled for admins and service role';
  RAISE NOTICE '📊 Views Created: submission_conversation_timeline, inbound_spam_quarantine';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   1. Deploy Supabase Edge Function: handle-inbound-email';
  RAISE NOTICE '   2. Configure Resend webhook to point to edge function';
  RAISE NOTICE '   3. Create Supabase Storage bucket: inbound-attachments';
  RAISE NOTICE '   4. Update send-reply function to include reply_to header';
END $$;
