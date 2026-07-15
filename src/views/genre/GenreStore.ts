import { defineStore } from "pinia";

import { Artist } from "@/@types/Artist";
import { Image } from "@/@types/Image";
import { SearchFromAPI } from "@/@types/Search";
import { instance } from "@/api";
import { normalizeString } from "@/helpers/helper";
import { getTopArtistsByTag } from "@/helpers/lastfm";
import { cleanUrl } from "@/helpers/urls";

// Spotify id is unknown until the card is clicked: Last.fm gives names only,
// resolving all of them to Spotify artists up front would fire one search
// request per artist just to render a grid. `id`/`images` stay empty until
// resolveArtist() is called on click.
export interface GenreArtist {
  id: null | string;
  images: Image[];
  name: string;
}

export interface GenrePageState {
  artists: GenreArtist[];
  genre: string;
  loading: boolean;
}

// Spotify's artist genre metadata is sparse for niche/scene tags (e.g. "horror
// punk"), so the primary source is Last.fm's crowd-sourced tag data (better
// niche coverage). If Last.fm has no key configured or returns nothing, this
// falls back to Spotify's own genre: search filter, post-filtered client-side
// for precision — those results already carry a Spotify id, no click-resolve needed.
const MAX_PAGES = 6;

async function fetchPages(query: string): Promise<Artist[]> {
  const items: Artist[] = [];
  let url = `search?q=${encodeURIComponent(query)}&type=artist&limit=50`;
  for (let page = 0; page < MAX_PAGES / 2 && url; page++) {
    const { data } = await instance().get<SearchFromAPI>(url);
    items.push(...data.artists.items);
    url = data.artists.next ? cleanUrl(data.artists.next) : "";
  }
  return items;
}

async function getArtistsFromSpotifyGenreSearch(genre: string): Promise<GenreArtist[]> {
  const wanted = genre.toLowerCase();
  const results = await Promise.allSettled([
    fetchPages(`genre:"${genre}"`),
    fetchPages(`genre:${genre}`),
  ]);
  const all = [
    ...new Map(
      results
        .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
        .map((artist) => [artist.id, artist]),
    ).values(),
  ];
  if (import.meta.env.DEV) {
    results.forEach((result, index) => {
      if (result.status === "rejected") console.error(`genre search variant ${index} failed:`, result.reason);
    });
  }

  const exact = all.filter((artist) => artist.genres.some((g) => g.toLowerCase() === wanted));
  const partial = exact.length
    ? exact
    : all.filter((artist) => artist.genres.some((g) => {
        const genreLower = g.toLowerCase();
        return genreLower.includes(wanted) || wanted.includes(genreLower);
      }));
  return sortByPopularity(partial.length ? partial : all).map(toGenreArtist);
}

function sortByPopularity(artists: Artist[]): Artist[] {
  return [...artists].sort((a, b) => b.popularity - a.popularity);
}

function toGenreArtist(artist: Artist): GenreArtist {
  return { id: artist.id, images: artist.images, name: artist.name };
}

// resolveArtist() can be triggered twice for the same artist in quick succession
// (the scroll-into-view prefetch and a click landing before it resolves) — this
// dedupes concurrent calls so only one Spotify request goes out per artist name.
const pendingResolves = new Map<string, Promise<null | string>>();

// Short-lived cache of name -> resolved Spotify artist, so browsing overlapping
// genres (e.g. an artist tagged both "punk" and "horror punk") or navigating
// back to a genre already visited doesn't re-hit Spotify search for names
// already resolved in this session. Kept short (10min) rather than forever
// since it's an in-memory workaround for Last.fm's missing images, not a
// source of truth — a full reload always starts clean.
const RESOLVED_ARTIST_CACHE_TTL_MS = 10 * 60 * 1000;
const resolvedArtistCache = new Map<string, { expiresAt: number; id: string; images: Image[] }>();

function getCachedArtist(name: string): { id: string; images: Image[] } | null {
  const cached = resolvedArtistCache.get(normalizeString(name));
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    resolvedArtistCache.delete(normalizeString(name));
    return null;
  }
  return cached;
}

function setCachedArtist(name: string, id: string, images: Image[]): void {
  resolvedArtistCache.set(normalizeString(name), { expiresAt: Date.now() + RESOLVED_ARTIST_CACHE_TTL_MS, id, images });
}

export const useGenre = defineStore("genre", {
  actions: {
    async getArtists(genre: string) {
      this.genre = genre;
      this.artists = [];
      this.loading = true;
      pendingResolves.clear();
      try {
        // Last.fm's tag data has no real per-artist photos to offer: every artist
        // returned by tag.gettopartists carries the identical placeholder image
        // (hash 2a96cbd8b46e442fc41c2b86b821562f, verified by hitting the API
        // directly) — Last.fm deprecated real artist images around 2019. A real
        // photo only exists on the artist's resolved Spotify record, but resolving
        // every card up front to get one would mean one Spotify search per artist
        // just to render the grid — exactly the spam this whole approach exists to
        // avoid. So cards start with Beardify's default avatar and only resolve
        // (photo + id) lazily: when scrolled into view, or on click.
        const tagArtists = await getTopArtistsByTag(genre);
        if (tagArtists.length) {
          this.artists = tagArtists.map((name) => ({ id: null, images: [], name }));
          return;
        }
        this.artists = await getArtistsFromSpotifyGenreSearch(genre);
      } finally {
        this.loading = false;
      }
    },

    // Resolves a Last.fm-sourced entry to its Spotify artist on demand (scroll
    // into view or click), caching the result in place so it only ever runs once
    // per artist.
    async resolveArtist(item: GenreArtist): Promise<null | string> {
      if (item.id) return item.id;

      const cached = getCachedArtist(item.name);
      if (cached) {
        item.id = cached.id;
        item.images = cached.images;
        return cached.id;
      }

      const pending = pendingResolves.get(item.name);
      if (pending) return pending;

      const promise = (async (): Promise<null | string> => {
        try {
          const { data } = await instance().get<SearchFromAPI>(
            `search?q=${encodeURIComponent(item.name)}&type=artist&limit=3`,
          );
          const normalizedName = normalizeString(item.name);
          const match = data.artists.items.find((artist) => normalizeString(artist.name) === normalizedName)
            ?? data.artists.items[0]
            ?? null;
          if (!match) return null;

          setCachedArtist(item.name, match.id, match.images);
          const stored = this.artists.find((artist) => artist === item);
          if (stored) {
            stored.id = match.id;
            stored.images = match.images;
          }
          return match.id;
        } catch {
          return null;
        } finally {
          pendingResolves.delete(item.name);
        }
      })();
      pendingResolves.set(item.name, promise);
      return promise;
    },
  },

  state: (): GenrePageState => ({
    artists: [],
    genre: "",
    loading: false,
  }),
});
