import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Missing Supabase environment variables. Admin area is disabled; the public site is unaffected.'
  );
}

/**
 * `null` when the env vars are absent, rather than a broken client.
 *
 * This module previously called `createClient(supabaseUrl || '', supabaseAnonKey || '')`,
 * which throws "supabaseUrl is required." at import time. Because App.jsx imports this
 * at the top level, a missing env var white-screened the ENTIRE public portfolio —
 * hero, projects, contact and all — over a credential only the admin CRM needs.
 *
 * Callers must null-check. See App.jsx for the auth guards.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase;
