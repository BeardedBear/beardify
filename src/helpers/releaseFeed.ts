import { http } from "@/helpers/http";
import { hasSupabase, restUrl, SUPABASE_HEADERS } from "@/helpers/supabase";

/**
 * A row of the `releases` table, filled daily by the scrapers at
 * https://github.com/BeardedBear/scrap.
 *
 * Deliberately named after the table and not after a site: a row is one record, merged
 * from however many sites listed it, and a reader should not have to know which.
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
  /** The score out of 100, or null when no source published one. */
  rating: null | number;
  /**
   * The row's key upstream: "artist|album|month", normalized. Stable across runs and
   * unique in the table, which is what makes it usable as an id on this side. A site's
   * own id is not stored — it is unique per site and never across them, so it could
   * not survive the table taking more than one source.
   */
  release_key: string;
}

/** PostgREST's own ceiling is higher, but a two-month window is a few hundred rows. */
const MAX_ROWS = 1000;

const REST_URL = restUrl("releases");

/**
 * Releases published since `since`.
 *
 * The whole window, every genre in it: it runs to a few hundred rows, well inside the
 * cap above, and the page filters what it got. Selecting genres server-side only
 * bought a smaller payload that was never large, at the price of a feed that could
 * not show what it had not been told to ask for.
 *
 * Best-effort: a missing configuration or a failed request costs the feed, not the
 * page.
 * @param since - Oldest month to include, "YYYY-MM-DD"
 * @returns The matching rows, or an empty array
 */
export async function getFeedReleases(since: string): Promise<FeedRelease[]> {
  if (!hasSupabase()) return [];

  const params = new URLSearchParams({
    limit: String(MAX_ROWS),
    month: `gte.${since}`,
    order: "month.desc,rating.desc.nullslast",
    select: "release_key,artist,album,month,genres,rating,cover_url",
  });

  try {
    return await http.get(`${REST_URL}?${params}`, { headers: SUPABASE_HEADERS }).json<FeedRelease[]>();
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error("Error fetching release feed:", error);
    return [];
  }
}
