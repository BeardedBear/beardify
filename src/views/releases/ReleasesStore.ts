import { defineStore } from "pinia";

import { AlbumSimplified } from "@/@types/Album";
import { Artist } from "@/@types/Artist";
import { Paging } from "@/@types/Paging";
import { Release, ReleasesPage } from "@/@types/Releases";
import { instance } from "@/api";
import { searchMusicBrainzReleasesByTags } from "@/helpers/musicbrainz";
import {
  GENRE_FAMILIES,
  genreTerms,
  matchesTrackedTags,
  MAX_TRACKED_TAGS,
  mergeReleases,
  toRelease,
  toReleaseFromMusicBrainz,
} from "@/helpers/releases";
import { useCheckLiveAlbum, useCheckReissueAlbum } from "@/helpers/useCleanAlbums";

/** Spotify's ceiling for `?ids=` on the artists endpoint. */
const ID_BATCH = 50;
/** Page size for the Spotify listings; also Spotify's maximum. */
const PAGE_SIZE = 50;
/** `tag:new` hard-caps at 100 hits — verified against the API, a third page returns nothing. */
const FRESH_PAGES = 2;
/** Editorial feed depth. It never holds more than 100. */
const EDITORIAL_PAGES = 2;
/** MusicBrainz page size (its own maximum) and how many pages to walk. */
const MUSICBRAINZ_PAGE_SIZE = 100;
const MUSICBRAINZ_PAGES = 3;
/** How far back a release still counts as news. */
const RECENT_DAYS = 60;
/** How many tags to seed from the user's top artists. More widen the feed without costing a request. */
const SEEDED_TAGS = 6;
/** The feed moves on a weekly rhythm — refetching on every visit buys nothing. */
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export const useReleases = defineStore("releases", {
  actions: {
    /**
     * Rebuild the feed from every source.
     * @param force - Refetch even when the cached feed is still fresh
     */
    async getReleases(force = false) {
      const isFresh = this.fetchedAt !== null && Date.now() - this.fetchedAt < STALE_AFTER_MS;
      if (!force && isFresh && this.releases.length) return;

      this.error = false;
      this.loading = true;
      // Only seeded while the list is untouched: re-deriving would throw away a hand-picked list.
      if (!this.tagsCustom) this.tags = await deriveTags();

      /*
       * `allSettled`, not `all`: the three sources are independent and fail
       * independently — MusicBrainz in particular answers 503 under load often
       * enough to matter. Losing one should thin the feed, not blank the page; the
       * error state is for the case where nothing at all came back.
       */
      const results = await Promise.allSettled([fetchEditorial(), fetchFresh(), fetchMusicBrainz(this.tags)]);
      const lists = results.filter((result) => result.status === "fulfilled").map((result) => result.value);

      if (!lists.length) {
        if (import.meta.env.DEV) console.error("Error fetching releases:", results);
        this.error = true;
        this.loading = false;
        return;
      }

      // Live albums and reissues are re-uploaded constantly and would bury the actual releases.
      const merged = mergeReleases(lists).filter(
        (release) => !useCheckLiveAlbum(release.name) && !useCheckReissueAlbum(release.name),
      );

      // Genres have to be in place first: the Spotify rows carry none until annotate fills them.
      await annotate(merged);

      this.releases = merged.filter((release) => matchesTrackedTags(release, this.tags));
      this.fetchedAt = Date.now();
      this.loading = false;
    },

    /** Back to the genres inferred from the user's top artists. */
    async resetTags() {
      this.tagsCustom = false;
      this.tags = [];
      await this.getReleases(true);
    },

    setGenre(genre: null | string) {
      this.genre = this.genre === genre ? null : genre;
    },

    /**
     * Replace the tracked genres and rebuild the feed.
     *
     * One call per confirmed edit, not per chip: the dialog collects the whole list
     * and hands it over on validate. A refetch is ~11 requests plus MusicBrainz's
     * own one-second pacing, which is not something to spend on an intermediate
     * state the user is still editing.
     * @param tags - The genres to track, already normalized by the dialog
     */
    async setTags(tags: string[]) {
      const next = tags.slice(0, MAX_TRACKED_TAGS);
      const unchanged = next.length === this.tags.length && next.every((tag, index) => tag === this.tags[index]);

      this.tags = next;
      // Set even when the list matches the seeded one, so a later seeding pass cannot undo the choice.
      this.tagsCustom = true;
      if (!unchanged) await this.getReleases(true);
    },

    toggleCheck(key: string) {
      if (this.checks[key]) delete this.checks[key];
      else this.checks[key] = Date.now();
    },
  },

  getters: {
    /** Filter terms present in the feed, most common first — the sidebar list. */
    genreList(state): { count: number; name: string }[] {
      const counts = new Map<string, number>();
      for (const release of state.releases) {
        for (const term of release.terms) counts.set(term, (counts.get(term) ?? 0) + 1);
      }

      return [...counts.entries()]
        .map(([name, count]) => ({ count, name }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    },

    /** The feed as the list renders it: every sidebar filter applied. */
    visibleReleases(state): Release[] {
      return state.releases.filter((release) => {
        /*
         * Also applied at fetch time, and not redundantly: that pass keeps the
         * stored feed small, this one keeps what is on screen honest about a feed
         * persisted before the tracked list — or the filtering itself — changed.
         */
        if (!matchesTrackedTags(release, state.tags)) return false;
        if (state.albumsOnly && release.single) return false;
        if (state.genre && !release.terms.includes(state.genre)) return false;
        if (state.hideChecked && state.checks[release.key]) return false;
        return true;
      });
    },
  },

  /*
   * The ticks used to live on a third-party Directus instance that is gone, taking
   * the list with it. localStorage is the honest scope for them: they are one
   * person's "heard it" marks, and no part of the app needs them on another device.
   *
   * The feed rides along so the 6-hour window below survives a reload instead of
   * only applying within a single session. A few hundred rows is ~150 KB.
   */
  persist: {
    key: "beardify-releases",
    pick: ["albumsOnly", "checks", "fetchedAt", "genre", "hideChecked", "releases", "tags", "tagsCustom"],
  },

  state: (): ReleasesPage => ({
    albumsOnly: true,
    checks: {},
    error: false,
    fetchedAt: null,
    genre: null,
    hideChecked: false,
    loading: false,
    releases: [],
    tags: [],
    tagsCustom: false,
  }),
});

/**
 * Fills in genres and filter terms for the Spotify rows.
 *
 * Spotify never reports genres on an album, only on the artist, so without this
 * pass every Spotify-sourced row has an empty genre column. MusicBrainz rows arrive
 * already tagged and are skipped. Best-effort: a failure costs a column, not the page.
 * @param releases - Feed to annotate in place
 */
async function annotate(releases: Release[]): Promise<void> {
  const genresById = new Map<string, string[]>();
  const artistIds = [...new Set(releases.map((release) => release.artistId).filter(Boolean))];

  await Promise.all(
    batched(artistIds).map(async (ids) => {
      try {
        const { data } = await instance().get<{ artists: Artist[] }>(`artists?ids=${ids.join(",")}`);
        for (const artist of data.artists ?? []) {
          if (artist) genresById.set(artist.id, artist.genres ?? []);
        }
      } catch (error: unknown) {
        if (import.meta.env.DEV) console.error("Error fetching release genres:", error);
      }
    }),
  );

  for (const release of releases) {
    if (!release.genres.length) release.genres = genresById.get(release.artistId) ?? [];
    release.terms = genreTerms(release.genres);
  }
}

/**
 * Splits ids into batches Spotify will accept.
 */
function batched(ids: string[]): string[][] {
  const batches: string[][] = [];
  for (let index = 0; index < ids.length; index += ID_BATCH) batches.push(ids.slice(index, index + ID_BATCH));
  return batches;
}

/**
 * The genre tags to build the feed from, taken from the user's own listening.
 *
 * One request, not one per followed artist: `me/top/artists` is the taste signal,
 * and rolling its micro-genres up to broad families is what turns it into terms
 * MusicBrainz recognises. Falls back to the whole family list when Spotify has
 * nothing to say — a new account, or the endpoint refusing.
 */
async function deriveTags(): Promise<string[]> {
  try {
    const { data } = await instance().get<Paging<Artist>>("me/top/artists?limit=50&time_range=long_term");
    const counts = new Map<string, number>();

    for (const artist of data.items ?? []) {
      for (const family of new Set(genreTerms(artist.genres ?? []).filter(isFamily))) {
        counts.set(family, (counts.get(family) ?? 0) + 1);
      }
    }

    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([family]) => family);
    if (ranked.length) return ranked.slice(0, SEEDED_TAGS);
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error("Error deriving release tags:", error);
  }

  return GENRE_FAMILIES.slice(0, SEEDED_TAGS);
}

/**
 * Spotify's editorial "New Releases" shelf — curated, worldwide, always answers.
 */
async function fetchEditorial(): Promise<Release[]> {
  const releases: Release[] = [];

  for (let page = 0; page < EDITORIAL_PAGES; page++) {
    const { data } = await instance().get<{ albums: Paging<AlbumSimplified> }>(
      `browse/new-releases?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
    );
    releases.push(...data.albums.items.map((album) => toRelease(album, "editorial")));
    if (!data.albums.next) break;
  }

  return releases;
}

/*
 * `tag:new` is Spotify's only query that returns the *catalogue's* last two weeks
 * rather than an editor's pick. It hard-caps at 100 hits, so it widens the feed
 * without ever being the bulk of it.
 */
async function fetchFresh(): Promise<Release[]> {
  const releases: Release[] = [];

  for (let page = 0; page < FRESH_PAGES; page++) {
    const { data } = await instance().get<{ albums: Paging<AlbumSimplified> }>(
      `search?q=${encodeURIComponent("tag:new")}&type=album&limit=${PAGE_SIZE}`
      + `&offset=${page * PAGE_SIZE}&market=from_token`,
    );
    releases.push(...data.albums.items.map((album) => toRelease(album, "fresh")));
    if (!data.albums.next) break;
  }

  return releases;
}

/**
 * The source that makes this page worth opening.
 *
 * Spotify's own feeds are editorial and market-shaped — measured against the live
 * API, both come back entirely pop and urban, so a listener who follows metal or
 * rock sees neither a release nor a matching genre, and there is no query-side fix
 * (`genre:` returns nothing on an album search). MusicBrainz answers by community
 * tag instead, which means the whole taste-shaped feed costs three requests total
 * rather than one per followed artist.
 * @param tags - Genre tags to query with
 */
async function fetchMusicBrainz(tags: string[]): Promise<Release[]> {
  const releases: Release[] = [];
  const from = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);

  for (let page = 0; page < MUSICBRAINZ_PAGES; page++) {
    const hits = await searchMusicBrainzReleasesByTags(
      tags,
      from,
      to,
      MUSICBRAINZ_PAGE_SIZE,
      page * MUSICBRAINZ_PAGE_SIZE,
    );

    for (const hit of hits) {
      // Live records, demos and compilations all come back as primarytype:Album.
      if (hit["secondary-types"]?.length) continue;
      releases.push(toReleaseFromMusicBrainz(hit));
    }

    if (hits.length < MUSICBRAINZ_PAGE_SIZE) break;
  }

  return releases;
}

/**
 * Whether a term is one of the broad families, i.e. something MusicBrainz can be queried with.
 */
function isFamily(term: string): boolean {
  return GENRE_FAMILIES.includes(term);
}
