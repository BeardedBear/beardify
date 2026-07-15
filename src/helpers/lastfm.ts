import { LastfmTagTopArtists } from "@/@types/Lastfm";
import { http } from "@/helpers/http";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY || "";

/**
 * Get the top artists for a genre/tag from Last.fm's crowd-sourced tag data.
 * Last.fm tags cover niche/scene genres (e.g. "horror punk") far more reliably
 * than Spotify's own artist genre metadata, which is sparse for anything but
 * broad genres.
 *
 * Note: Last.fm no longer serves real per-artist photos on this endpoint —
 * every artist for a given tag comes back with the identical placeholder
 * image (verified against the raw API response), so only names are worth
 * reading here; real photos come from resolving the artist on Spotify instead.
 * @param tag - The genre/tag to look up
 * @param limit - Max number of artist names to return
 * @returns Promise resolving to a list of artist names ranked by tag relevance (empty on error or no key)
 */
export async function getTopArtistsByTag(tag: string, limit = 30): Promise<string[]> {
  if (!LASTFM_API_KEY) return [];

  try {
    const data = await http
      .get(LASTFM_API_URL, {
        searchParams: {
          api_key: LASTFM_API_KEY,
          format: "json",
          limit,
          method: "tag.gettopartists",
          tag,
        },
      })
      .json<LastfmTagTopArtists>();

    return (data.topartists?.artist ?? []).map((artist) => artist.name);
  } catch {
    return [];
  }
}
