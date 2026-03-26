-- Admin RLS role-claim fix
-- Run this in Supabase SQL Editor to align admin policies with app/user metadata roles.

CREATE OR REPLACE FUNCTION public.jwt_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT lower(
    coalesce(
      auth.jwt() ->> 'user_role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() ->> 'role',
      ''
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT auth.role() = 'authenticated'
    AND public.jwt_role() = ANY(allowed_roles);
$$;

DROP POLICY IF EXISTS "submissions_read_admin" ON public.submissions;
DROP POLICY IF EXISTS "submissions_update_admin" ON public.submissions;
DROP POLICY IF EXISTS "replies_insert_admin" ON public.submission_replies;
DROP POLICY IF EXISTS "replies_read_admin" ON public.submission_replies;
DROP POLICY IF EXISTS "templates_insert_admin" ON public.quick_reply_templates;
DROP POLICY IF EXISTS "templates_update_admin" ON public.quick_reply_templates;
DROP POLICY IF EXISTS "labels_read_admin" ON public.labels;
DROP POLICY IF EXISTS "labels_insert_admin" ON public.labels;
DROP POLICY IF EXISTS "labels_update_admin" ON public.labels;
DROP POLICY IF EXISTS "submission_labels_read_admin" ON public.submission_labels;
DROP POLICY IF EXISTS "submission_labels_insert_admin" ON public.submission_labels;
DROP POLICY IF EXISTS "submission_labels_delete_admin" ON public.submission_labels;
DROP POLICY IF EXISTS "submission_types_insert_admin" ON public.submission_types;
DROP POLICY IF EXISTS "attachments_read_admin" ON public.submission_attachments;
DROP POLICY IF EXISTS "attachments_insert_admin" ON public.submission_attachments;
DROP POLICY IF EXISTS "notification_settings_self" ON public.notification_settings;
DROP POLICY IF EXISTS "notification_settings_self_update" ON public.notification_settings;

CREATE POLICY "submissions_read_admin" ON public.submissions
  FOR SELECT USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "submissions_update_admin" ON public.submissions
  FOR UPDATE USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "replies_insert_admin" ON public.submission_replies
  FOR INSERT WITH CHECK (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "replies_read_admin" ON public.submission_replies
  FOR SELECT USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "templates_insert_admin" ON public.quick_reply_templates
  FOR INSERT WITH CHECK (
    public.has_any_role(ARRAY['admin', 'owner', 'super_admin'])
  );

CREATE POLICY "templates_update_admin" ON public.quick_reply_templates
  FOR UPDATE USING (
    public.has_any_role(ARRAY['admin', 'owner', 'super_admin'])
  );

CREATE POLICY "labels_read_admin" ON public.labels
  FOR SELECT USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "labels_insert_admin" ON public.labels
  FOR INSERT WITH CHECK (
    public.has_any_role(ARRAY['admin', 'owner', 'super_admin'])
  );

CREATE POLICY "labels_update_admin" ON public.labels
  FOR UPDATE USING (
    public.has_any_role(ARRAY['admin', 'owner', 'super_admin'])
  );

CREATE POLICY "submission_labels_read_admin" ON public.submission_labels
  FOR SELECT USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "submission_labels_insert_admin" ON public.submission_labels
  FOR INSERT WITH CHECK (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "submission_labels_delete_admin" ON public.submission_labels
  FOR DELETE USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "submission_types_insert_admin" ON public.submission_types
  FOR INSERT WITH CHECK (
    public.has_any_role(ARRAY['admin', 'owner', 'super_admin'])
  );

CREATE POLICY "attachments_read_admin" ON public.submission_attachments
  FOR SELECT USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "attachments_insert_admin" ON public.submission_attachments
  FOR INSERT WITH CHECK (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "notification_settings_self" ON public.notification_settings
  FOR SELECT USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );

CREATE POLICY "notification_settings_self_update" ON public.notification_settings
  FOR UPDATE USING (
    public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );
