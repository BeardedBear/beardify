import { http } from "@/helpers/http";

/**
 * A row of the `releases` table, filled daily by the scrapers at
 * https://github.com/BeardedBear/scrap.
 *
 * Deliberately named after the table and not after a site: the table takes several
 * sources, each identified by its `source` column, and a reader should not have to
 * know which one a row came from.
 */
export interface FeedRelease {
  album: string;
  artist: string;
  /** Artwork URL, built by whichever scraper wrote the row, or null when it has none. */
  cover_url: null | string;
  /** Lowercased, space-separated, e.g. ["metal", "post metal"]. Usually several. */
  genres: string[];
  /** First of the month, "YYYY-MM-01" — the sources state no day. */
  month: string;
  /** The source's score out of 5, or null when it publishes none. */
  rating: null | number;
  /** Which scraper wrote the row. Kept so a row can be traced back to its site. */
  source: string;
  source_id: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
/*
 * The anon key is meant to be public — it identifies the project, and the table's
 * RLS policy is what actually grants access (select only, for anon). The service
 * role key, which bypasses RLS, lives in the scraper's environment and nowhere near
 * this bundle.
 */
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/** PostgREST's own ceiling is higher, but a genre-filtered window never approaches this. */
const MAX_ROWS = 1000;

/**
 * Every genre the table actually uses, sorted.
 *
 * The autocomplete has to suggest what the table holds and nothing else. The feed is
 * filtered by an overlap against this column, so offering a genre no scraper has ever
 * written — a term from some external vocabulary, say — would look like a valid
 * choice and quietly match nothing.
 *
 * One request, and the whole column at that — PostgREST cannot flatten an array
 * column server-side without a database function, and a listing window is a few tens
 * of kilobytes. The caller caches it.
 * @returns The distinct genres, or an empty array on failure
 */
export async function getFeedGenres(): Promise<string[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  try {
    const rows = await http
      .get(`${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/releases?select=genres&limit=${MAX_ROWS}`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      })
      .json<{ genres: string[] }[]>();

    return [...new Set(rows.flatMap((row) => row.genres ?? []))].sort();
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error("Error fetching feed genres:", error);
    return [];
  }
}

/**
 * Releases published since `since`, restricted to the tracked genres.
 *
 * The genre filter runs server-side as an array overlap (`genres=ov.{…}`), which the
 * table's GIN index serves directly — fetching the whole window and filtering in the
 * browser would move thousands of rows to discard most of them. With no tags the
 * window comes back whole, matching the "track nothing, filter nothing" rule the
 * feed follows elsewhere.
 *
 * Best-effort like every other source: a missing configuration or a failed request
 * costs this source, not the page.
 * @param since - Oldest month to include, "YYYY-MM-DD"
 * @param tags - Tracked genres; empty means no genre restriction
 * @returns The matching rows, or an empty array
 */
export async function getFeedReleases(since: string, tags: string[]): Promise<FeedRelease[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  const params = new URLSearchParams({
    limit: String(MAX_ROWS),
    month: `gte.${since}`,
    order: "month.desc,rating.desc.nullslast",
    select: "source,source_id,artist,album,month,genres,rating,cover_url",
  });

  /*
   * Braces and commas are PostgREST array syntax and must survive unencoded; a genre
   * containing either would break the filter, so those are dropped rather than
   * escaped — a tag like that matches nothing upstream anyway.
   */
  if (tags.length) {
    const list = tags.map((tag) => `"${tag.replace(/["{},\\]/g, "")}"`).join(",");
    params.set("genres", `ov.{${list}}`);
  }

  try {
    return await http
      .get(`${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/releases?${params}`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      })
      .json<FeedRelease[]>();
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error("Error fetching release feed:", error);
    return [];
  }
}
