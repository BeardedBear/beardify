import { defineStore } from "pinia";

import { Artist } from "@/@types/Artist";
import { Paging } from "@/@types/Paging";
import { Release, ReleasesPage } from "@/@types/Releases";
import { instance } from "@/api";
import { getFeedGenres, getFeedReleases } from "@/helpers/releaseFeed";
import {
  GENRE_FAMILIES,
  genreTerms,
  MAX_TRACKED_TAGS,
  mergeReleases,
  toReleaseFromFeed,
} from "@/helpers/releases";
import { useCheckLiveAlbum, useCheckReissueAlbum } from "@/helpers/useCleanAlbums";

/** How far back a release still counts as news. */
const RECENT_DAYS = 60;
/** How many tags to seed from the user's top artists. More widen the feed without costing a request. */
const SEEDED_TAGS = 6;
/** The feed moves on a weekly rhythm — refetching on every visit buys nothing. */
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

/*
 * Shape version of a persisted `Release`. Bump it whenever a field is added or its
 * meaning changes.
 *
 * The feed lives in localStorage for six hours, so a build that adds a field meets
 * rows written without it — and reading one is not a missing value but a crash:
 * `rating.toFixed()` on undefined, `terms.includes()` on undefined. Every reader
 * guarding every field is whack-a-mole; discarding a cache the current code cannot
 * read costs one refetch and nothing else.
 */
const FEED_VERSION = 7;

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

      const rows = await fetchFeed(this.tags);

      /*
       * An empty answer is a failure here, not a quiet result. With a single source
       * there is nothing left to thin the feed with, so a network error, a missing
       * Supabase configuration or an RLS refusal all arrive as zero rows — and
       * rendering that as "no releases this month" would hide a broken page.
       */
      if (!rows.length) {
        this.error = true;
        this.loading = false;
        return;
      }

      // Live albums and reissues are re-uploaded constantly and would bury the actual releases.
      const merged = mergeReleases([rows]).filter(
        (release) => !useCheckLiveAlbum(release.name) && !useCheckReissueAlbum(release.name),
      );

      // The scrapers classify every row, so this only derives the terms the sidebar reads.
      for (const release of merged) release.terms = genreTerms(release.genres);

      this.releases = merged;
      this.fetchedAt = Date.now();
      this.loading = false;
    },

    /**
     * The genres the table knows, for the tracking dialog's autocomplete.
     *
     * Fetched once and kept: the vocabulary is the scraper's editorial genre list and
     * changes about never, while the dialog can be opened repeatedly in a session.
     */
    async loadGenreVocabulary(): Promise<string[]> {
      if (!this.genreVocabulary.length) this.genreVocabulary = await getFeedGenres();

      return this.genreVocabulary;
    },

    /** Mark a batch of releases as listened, leaving the already-checked ones alone. */
    markHeard(keys: string[]) {
      for (const key of keys) {
        if (!this.checks[key]) this.checks[key] = Date.now();
      }
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

    toggleSortRating() {
      this.sortRating = !this.sortRating;
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

    /*
     * The feed as the list renders it.
     *
     * No genre gate here any more: every source is now selected by genre in its own
     * query: the feed is fetched with a genre overlap filter, so a second pass here
     * could only ever return true. The gate that used to live here existed to hold
     * back Spotify's editorial listings, which took no genre argument and are gone.
     */
    visibleReleases(state): Release[] {
      return state.releases.filter((release) => {
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
    /*
     * `checks`, `tags` and the filters are the user's own and survive the version
     * gate; only the feed and its timestamp are dropped, so the next visit refetches
     * rather than rendering rows the current code cannot read.
     */
    afterHydrate: ({ store }) => {
      const releases = store as unknown as ReleasesPage;
      if (releases.feedVersion === FEED_VERSION) return;

      releases.releases = [];
      releases.fetchedAt = null;
      releases.feedVersion = FEED_VERSION;
    },
    key: "beardify-releases",
    pick: [
      "checks",
      "feedVersion",
      "fetchedAt",
      "genre",
      "genreVocabulary",
      "hideChecked",
      "releases",
      "sortRating",
      "tags",
      "tagsCustom",
    ],
  },

  state: (): ReleasesPage => ({
    checks: {},
    error: false,
    /*
     * Zero, not FEED_VERSION, and that is the whole point of the gate.
     *
     * Hydration patches the stored keys over this state and leaves the rest alone,
     * so a payload written before this field existed keeps whatever default sits
     * here. Defaulting to the current version made every such cache look current —
     * the gate passed, the stale feed stayed, and nothing was ever refetched. A
     * value no stored payload can carry is what makes "absent" mean "too old".
     */
    feedVersion: 0,
    fetchedAt: null,
    genre: null,
    genreVocabulary: [],
    hideChecked: false,
    loading: false,
    releases: [],
    sortRating: false,
    tags: [],
    tagsCustom: false,
  }),
});

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
 * The scraped release feed, held in Supabase and refreshed nightly by
 * https://github.com/BeardedBear/scrap.
 *
 * It exists because every other source classifies a release only once somebody has
 * curated it, which takes months — so the newest records, the ones this page is for,
 * arrive with no genre at all. The scrapers read sites that file each release under
 * an editor-chosen genre on day one. One request, filtered and indexed server-side.
 * @param tags - Tracked genres, applied as an array overlap in the query
 */
async function fetchFeed(tags: string[]): Promise<Release[]> {
  /*
   * Widened to the first of the window's month, not the window's own start. That
   * column always holds the first of a month, so asking for `>= 2026-06-29` would
   * compare against `2026-06-01` and drop the whole of June — a third of the window,
   * silently.
   */
  const rows = await getFeedReleases(`${windowStart().slice(0, 7)}-01`, tags);

  return rows
    .map(toReleaseFromFeed)
    .filter((release) => !useCheckLiveAlbum(release.name) && !useCheckReissueAlbum(release.name));
}

/**
 * Whether a term is one of the broad families, i.e. something MusicBrainz can be queried with.
 */
function isFamily(term: string): boolean {
  return GENRE_FAMILIES.includes(term);
}

/** The oldest date still counted as news, as "YYYY-MM-DD". */
function windowStart(): string {
  return new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
