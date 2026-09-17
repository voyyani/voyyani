-- Admin live updates. The /admin pages subscribe to postgres_changes on these three
-- tables; a table outside the supabase_realtime publication never emits an event.
-- Idempotent: safe to re-run.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['submissions', 'submission_replies', 'inbound_replies'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- Realtime filters (submission_id=eq.…) need the full row identity on UPDATE.
ALTER TABLE public.submission_replies REPLICA IDENTITY FULL;
ALTER TABLE public.inbound_replies REPLICA IDENTITY FULL;

-- Task 10 depends on these two. schema.sql (verified 2026-09-17) has read/insert/update
-- for labels but no DELETE, and select/update for notification_settings but no INSERT —
-- so LabelsManager's delete and SettingsPage's upsert would both be refused by RLS.
DROP POLICY IF EXISTS "labels_delete_admin" ON public.labels;
CREATE POLICY "labels_delete_admin" ON public.labels
  FOR DELETE USING (public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin']));

DROP POLICY IF EXISTS "notification_settings_self_insert" ON public.notification_settings;
CREATE POLICY "notification_settings_self_insert" ON public.notification_settings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.has_any_role(ARRAY['admin', 'content_manager', 'owner', 'super_admin'])
  );
