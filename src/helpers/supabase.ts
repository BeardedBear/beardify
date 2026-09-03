/*
 * Shared Supabase REST plumbing.
 *
 * The anon key is meant to be public — it identifies the project, and each table's
 * RLS policy is what actually grants access. The service role key, which bypasses
 * RLS, lives in the scraper's environment and nowhere near this bundle.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const SUPABASE_HEADERS = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };

/** Whether the project is configured at all. Every caller degrades to nothing when it is not. */
export function hasSupabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * The REST endpoint of one table.
 * @param table - Table name as PostgREST exposes it
 */
export function restUrl(table: string): string {
  return `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/${table}`;
}
