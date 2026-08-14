import { LastfmArtistTopAlbums, LastfmTagTopArtists } from "@/@types/Lastfm";
import { getDisplayName } from "@/helpers/groupAlbumVariants";
import { normalizeString } from "@/helpers/helper";
import { http } from "@/helpers/http";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY || "";

/**
 * Rank an artist's albums by Last.fm playcount — i.e. what listeners actually
 * play, which is the only public signal for "start with this one". Spotify's
 * API exposes no popularity on simplified album objects, so a per-album lookup
 * there would mean one extra request per release.
 *
 * Names go through `getDisplayName` + `normalizeString` so they can be matched
 * against Spotify titles: Last.fm often carries an edition suffix Spotify lacks
 * ("L'Enfant Sauvage (Special Edition)"), on top of punctuation/casing drift.
 * @param artistName - Artist name as known to Spotify
 * @param limit - Max number of albums to rank
 * @param signal - Abort signal, cancelled on artist-page navigation
 * @returns Map of normalized album name → rank (1 = most played), empty on error or no key
 */
export async function getTopAlbumRanks(
  artistName: string,
  limit = 10,
  signal?: AbortSignal,
): Promise<Map<string, number>> {
  if (!LASTFM_API_KEY || !artistName) return new Map();

  try {
    const data = await http
      .get(LASTFM_API_URL, {
        searchParams: {
          api_key: LASTFM_API_KEY,
          artist: artistName,
          autocorrect: 1,
          format: "json",
          limit,
          method: "artist.gettopalbums",
        },
        signal,
      })
      .json<LastfmArtistTopAlbums>();

    // Last.fm files unmatched scrobbles under a literal "(null)" album.
    const names = (data.topalbums?.album ?? [])
      .map((album) => normalizeString(getDisplayName(album.name)))
      .filter((name) => name !== "" && name !== "null");

    // Stripping edition suffixes can collapse two entries onto one title — the
    // first occurrence is the better-played one, so it keeps the rank.
    const ranks = new Map<string, number>();
    names.forEach((name) => {
      if (!ranks.has(name)) ranks.set(name, ranks.size + 1);
    });

    return ranks;
  } catch {
    return new Map();
  }
}

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
