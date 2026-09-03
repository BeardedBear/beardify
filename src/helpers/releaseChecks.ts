import { http } from "@/helpers/http";
import { hasSupabase, restUrl, SUPABASE_HEADERS } from "@/helpers/supabase";

/*
 * The listened ticks of the releases page, one row per user, shared across devices.
 *
 * A whole `checks` map per row rather than a row per ticked release: the map is a
 * few kilobytes at most — the page only ever holds three months of it — and one
 * upsert is cheaper than diffing two sets and issuing the inserts and deletes that
 * fall out of it.
 *
 * The table, to create once in the project:
 *
 *   create table release_checks (
 *     user_hash  text primary key,
 *     checks     jsonb not null default '{}'::jsonb,
 *     updated_at timestamptz not null default now()
 *   );
 *   alter table release_checks enable row level security;
 *   create policy "anon read"   on release_checks for select to anon using (true);
 *   create policy "anon insert" on release_checks for insert to anon with check (true);
 *   create policy "anon update" on release_checks for update to anon using (true) with check (true);
 *
 * ponytail: anon-writable, so the row key is the SHA-256 of the Spotify user id
 * rather than the id itself — a dump of the table is then a list of hashes and
 * album titles, with nothing tying a row to a person. Real per-user isolation needs
 * Supabase Auth; add it when the ticks are worth more than they are.
 */

const REST_URL = restUrl("release_checks");

/**
 * The stored ticks of a user, or null when there is nothing to read.
 *
 * Null and an empty map are different answers: an empty map is a user who has
 * unticked everything, and overwriting the local list with it is correct. Null is a
 * failed or unconfigured read, and the local list has to survive it.
 * @param userId - Spotify user id
 */
export async function getRemoteChecks(userId: string): Promise<null | Record<string, number>> {
  if (!hasSupabase() || !userId) return null;

  try {
    const rows = await http
      .get(`${REST_URL}?select=checks&user_hash=eq.${await userHash(userId)}`, { headers: SUPABASE_HEADERS })
      .json<{ checks: Record<string, number> }[]>();

    return rows[0]?.checks ?? null;
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error("Error fetching release checks:", error);
    return null;
  }
}

/**
 * Store the ticks of a user, replacing whatever the row held.
 *
 * ponytail: last write wins, whole map at a time. Two devices ticking different
 * albums within the same push window lose one set of ticks; merging would need a
 * per-tick log, which is a lot of machinery for a checkbox.
 * @param userId - Spotify user id
 * @param checks - The complete map to store
 */
export async function putRemoteChecks(userId: string, checks: Record<string, number>): Promise<void> {
  if (!hasSupabase() || !userId) return;

  try {
    await http.post(REST_URL, {
      headers: { ...SUPABASE_HEADERS, Prefer: "resolution=merge-duplicates" },
      json: { checks, updated_at: new Date().toISOString(), user_hash: await userHash(userId) },
    });
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error("Error saving release checks:", error);
  }
}

/** SHA-256 of the Spotify user id, hex — what the row is keyed on. */
async function userHash(userId: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(userId));

  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
