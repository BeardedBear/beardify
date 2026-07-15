import { defineStore } from "pinia";

import { Artist } from "@/@types/Artist";
import { Image } from "@/@types/Image";
import { SearchFromAPI } from "@/@types/Search";
import { instance } from "@/api";
import { getTopArtistsByTag } from "@/helpers/lastfm";
import { resolveArtistByName } from "@/helpers/spotify";
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
  return artists.sort((a, b) => b.popularity - a.popularity);
}

function toGenreArtist(artist: Artist): GenreArtist {
  return { id: artist.id, images: artist.images, name: artist.name };
}

export const useGenre = defineStore("genre", {
  actions: {
    async getArtists(genre: string) {
      this.genre = genre;
      this.artists = [];
      this.loading = true;
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
    // into view or click). Caching and concurrent-call dedup live in
    // resolveArtistByName; this just applies the result to the store item.
    async resolveArtist(item: GenreArtist): Promise<null | string> {
      if (item.id) return item.id;

      const resolved = await resolveArtistByName(item.name);
      if (!resolved) return null;

      item.id = resolved.id;
      item.images = resolved.images;
      return resolved.id;
    },
  },

  state: (): GenrePageState => ({
    artists: [],
    genre: "",
    loading: false,
  }),
});
