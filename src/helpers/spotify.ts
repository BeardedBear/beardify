import { Artist } from "@/@types/Artist";
import { Image } from "@/@types/Image";
import { SearchFromAPI } from "@/@types/Search";
import { instance } from "@/api";
import { normalizeString } from "@/helpers/helper";

export interface ResolvedSpotifyArtist {
  id: string;
  images: Image[];
}

// Short-lived cache of name -> resolved Spotify artist, so repeated lookups
// for the same artist (e.g. across overlapping genre tags, or revisiting a
// genre page) don't re-hit Spotify search. Kept short (10min) rather than
// forever since it's a lookup cache, not a source of truth — a full reload
// always starts clean.
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; value: ResolvedSpotifyArtist }>();

// Dedupes concurrent lookups for the same name (e.g. a scroll-into-view
// prefetch and a click landing before it resolves) so only one Spotify
// request goes out per name.
const pending = new Map<string, Promise<null | ResolvedSpotifyArtist>>();

/**
 * Resolve a bare artist name to its Spotify artist (id + images), matching
 * the exact normalized name when possible and falling back to the top search
 * result otherwise. Results are cached and concurrent calls deduped.
 * @param name - The artist name to search for
 * @returns Promise resolving to the matched artist, or null if none found
 */
export async function resolveArtistByName(name: string): Promise<null | ResolvedSpotifyArtist> {
  const key = normalizeString(name);

  const cached = cache.get(key);
  if (cached) {
    if (cached.expiresAt >= Date.now()) return cached.value;
    cache.delete(key);
  }

  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const promise = (async (): Promise<null | ResolvedSpotifyArtist> => {
    try {
      const { data } = await instance().get<SearchFromAPI>(
        `search?q=${encodeURIComponent(name)}&type=artist&limit=3`,
      );
      const match = data.artists.items.find((artist) => normalizeString(artist.name) === key)
        ?? data.artists.items[0]
        ?? null;
      if (!match) return null;

      const resolved = toResolvedArtist(match);
      cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value: resolved });
      return resolved;
    } catch {
      return null;
    } finally {
      pending.delete(key);
    }
  })();
  pending.set(key, promise);
  return promise;
}

function toResolvedArtist(artist: Artist): ResolvedSpotifyArtist {
  return { id: artist.id, images: artist.images };
}
