import { useDebounceFn } from "@vueuse/core";
import { defineStore } from "pinia";

import { GenreGroup, MonthGroup, Release, ReleasesPage } from "@/@types/Releases";
import { getRemoteChecks, putRemoteChecks } from "@/helpers/releaseChecks";
import { getFeedReleases } from "@/helpers/releaseFeed";
import {
  genreTerms,
  groupByMonth,
  groupGenres,
  matchesRating,
  mergeReleases,
  monthLabel,
  pruneChecks,
  toReleaseFromFeed,
} from "@/helpers/releases";
import { useCheckLiveAlbum, useCheckReissueAlbum } from "@/helpers/useCleanAlbums";
import { useAuth } from "@/views/auth/AuthStore";

/** How far back a release still counts as news. */
const RECENT_DAYS = 60;
/** The feed moves on a weekly rhythm — refetching on every visit buys nothing. */
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;
/*
 * Ticking a row is a click, and a batch is a click that ticks a whole month. Waiting
 * out a short quiet period turns a run of them into one upsert.
 */
const PUSH_DEBOUNCE_MS = 2000;

/** The score scale the sources publish on, and so the range control's two ends. */
const RATING_BOUNDS: [number, number] = [0, 100];

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

// Built outside the store so the timer survives across calls.
let debouncedPush: null | ReturnType<typeof useDebounceFn> = null;

export const useReleases = defineStore("releases", {
  actions: {
    /** Recovery from a dead filter combo: back to the full, unfiltered feed. */
    clearFilters() {
      this.genres = [];
      this.hideChecked = false;
      this.hideUnrated = false;
      this.ratingRange = [...RATING_BOUNDS];
    },

    /**
     * Fill in the genres of a row the scrapers filed without any, from what Spotify
     * knows about its artist — two thirds of the feed arrives bare, and a row with no
     * chips is a row no sidebar filter can ever reach.
     *
     * Written onto the row rather than kept beside it so the terms are rebuilt with
     * it: the chips, the facet counts and the filter all read `terms`, and a chip the
     * filter did not know about would hide its own row when clicked. A row that
     * already has genres keeps them — the scrapers name the record, Spotify only ever
     * names the artist.
     * @param key - The release key the hover lookup answered for
     * @param genres - The artist genres Spotify returned, possibly none
     */
    enrichGenres(key: string, genres: string[]) {
      const release = this.releases.find((item) => item.key === key);
      if (!release || release.genres.length || !genres.length) return;

      release.genres = genres;
      release.terms = genreTerms(genres);
    },

    /**
     * Rebuild the feed from every source.
     * @param force - Refetch even when the cached feed is still fresh
     */
    async getReleases(force = false) {
      /*
       * Started before the freshness gate and awaited after the feed: a revisit that
       * skips the refetch must still pick up what another device ticked, and the two
       * reads share no data — awaiting this one first only added a round trip to the
       * page load.
       */
      const checks = this.syncChecks();

      const isFresh = this.fetchedAt !== null && Date.now() - this.fetchedAt < STALE_AFTER_MS;
      if (!force && isFresh && this.releases.length) return checks;

      this.error = false;
      this.loading = true;

      try {
        const rows = await fetchFeed();

        /*
         * An empty answer is a failure here, not a quiet result. With a single source
         * there is nothing left to thin the feed with, so a network error, a missing
         * Supabase configuration or an RLS refusal all arrive as zero rows — and
         * rendering that as "no releases this month" would hide a broken page.
         */
        if (!rows.length) {
          this.error = true;
          return;
        }

        this.releases = mergeReleases(rows);
        this.fetchedAt = Date.now();
      } finally {
        this.loading = false;
      }

      await checks;
    },

    /** Mark a batch of releases as listened, leaving the already-checked ones alone. */
    markHeard(keys: string[]) {
      for (const key of keys) {
        if (!this.checks[key]) this.checks[key] = Date.now();
      }

      this.pushChecks();
    },

    /**
     * Store the ticks for the account, once the clicking has stopped.
     *
     * Fire and forget: nothing waits on the upsert, and a failed one costs the
     * sharing between devices — the tick itself is already on screen.
     */
    pushChecks() {
      if (!debouncedPush) {
        debouncedPush = useDebounceFn(() => {
          const userId = useAuth().me?.id;
          if (userId) void putRemoteChecks(userId, { ...this.checks });
        }, PUSH_DEBOUNCE_MS);
      }

      debouncedPush();
    },

    /**
     * Adopt the ticks stored for the account, so every device shows the same list.
     *
     * The remote row wins outright rather than being merged into the local one: an
     * untick is the absence of a key, and a union would resurrect every row unticked
     * on another device. A read that fails or finds no row leaves the local list be.
     */
    async syncChecks() {
      const userId = useAuth().me?.id;
      if (!userId) return;

      const remote = await getRemoteChecks(userId);
      if (!remote) return;

      const kept = pruneChecks(remote);

      this.checks = kept;
      // Written back only when the pruning actually dropped something, so a plain read
      // does not turn into a write on every visit.
      if (Object.keys(kept).length !== Object.keys(remote).length) this.pushChecks();
    },

    toggleCheck(key: string) {
      if (this.checks[key]) delete this.checks[key];
      else this.checks[key] = Date.now();

      this.pushChecks();
    },

    /**
     * Add or remove a genre from the filter.
     *
     * A fresh array rather than a mutation: the page watches this to scroll back to
     * the top, and an in-place push leaves the reference — and so the watcher —
     * untouched.
     * @param genre - The term as the sidebar and the row chips spell it
     */
    toggleGenre(genre: string) {
      this.genres = this.genres.includes(genre)
        ? this.genres.filter((selected) => selected !== genre)
        : [...this.genres, genre];
    },

    toggleSortRating() {
      this.sortRating = !this.sortRating;
    },
  },

  getters: {
    /**
     * How many of the releases under the current genre filter are ticked off.
     *
     * Counted over `genreFiltered`, not `visibleReleases`: the latter drops every
     * ticked row when "Hide listened" is on, so this used to read 0 for as long
     * as the toggle was set — the one progress number on the page, zeroing out
     * at the exact moment progress was being made, with the checkbox that caused
     * it rendered one line above.
     */
    checkedCount(): number {
      return this.genreFiltered.filter((release) => this.checks[release.key]).length;
    },

    /**
     * The feed with the genre gate applied and nothing else.
     *
     * Split out because it is the honest denominator for progress: how much
     * there is to get through in what you are currently looking at. Counting
     * against `visibleReleases` cannot say that — it has already removed the
     * rows being counted.
     */
    genreFiltered(state): Release[] {
      if (!state.genres.length) return this.ratingFiltered;

      // Any of them, not all: two genres selected reads as "either".
      return this.ratingFiltered.filter((release) => state.genres.some((genre) => release.terms.includes(genre)));
    },

    /**
     * Filter terms present in the feed, most common first — the sidebar list.
     *
     * Ordered on the whole feed and counted on what is left, which are two
     * different numbers on purpose. The count has to answer "how many rows if I
     * pick this", so it is measured over `listenFiltered` — over the whole feed
     * a row saying 23 could not deliver 23 rows once "Hide listened" was on.
     * The *order* must not answer that: sorting by the live count would re-rank
     * the sidebar on every tick, so the list a user is reading reshuffles under
     * the pointer while they work through it. Frequency across the feed never
     * moves, so neither does a row.
     *
     * Not over `visibleReleases` either: the genre gate would have pre-answered
     * the very question the facet count exists to ask.
     */
    genreList(state): { count: number; name: string }[] {
      const total = new Map<string, number>();
      for (const release of state.releases) {
        for (const term of release.terms) total.set(term, (total.get(term) ?? 0) + 1);
      }

      const remaining = new Map<string, number>();
      for (const release of this.listenFiltered) {
        for (const term of release.terms) remaining.set(term, (remaining.get(term) ?? 0) + 1);
      }

      return [...total.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([name]) => ({ count: remaining.get(name) ?? 0, name }));
    },

    /**
     * The same facets as `genreList`, arranged as families and their micro-genres.
     *
     * A derivation of that list, not a second count: both levels are terms the feed
     * already carries, so the numbers are the ones the flat list showed and picking a
     * family still means "this genre and everything under it".
     */
    genreTree(): GenreGroup[] {
      return groupGenres(this.genreList);
    },

    /** The feed with the listened gate applied and nothing else — what the facet counts are measured on. */
    listenFiltered(state): Release[] {
      if (!state.hideChecked) return this.ratingFiltered;

      return this.ratingFiltered.filter((release) => !state.checks[release.key]);
    },

    /**
     * The feed grouped into months — and nothing finer. The listing this feed
     * comes from groups by month and never states a day, so day headings would
     * all read "exact date unknown"; a heading per group saying the same thing
     * is noise.
     *
     * A getter rather than a computed in each: the grouping also sorts every
     * month, and the rail exists precisely to jump between the headings the
     * list renders — two passes could disagree about what months there are.
     */
    monthGroups(): MonthGroup[] {
      return groupByMonth(this.visibleReleases, this.checks, this.sortRating);
    },

    /**
     * Every month the feed covers, with how many releases each one still shows.
     *
     * Deliberately not `monthGroups`: that holds only the months with something
     * left in them, so driving the rail from it deletes a row the moment a
     * filter empties its month — the navigation rearranges itself exactly when
     * it is being used to navigate. The months a feed covers are a property of
     * the feed, not of the current filter, so the rail keeps them all and lets
     * the empty ones go inert.
     */
    monthNav(state): { count: number; label: string }[] {
      const shown = new Map(this.monthGroups.map((group) => [group.label, group.releases.length]));

      /*
       * Keyed by timestamp rather than by adjacency, so the order is
       * first-appearance rather than a bet on the feed arriving sorted, and two
       * distinct months can never collapse into one row.
       */
      const months = new Map<number, string>();
      for (const release of state.releases) {
        if (!months.has(release.timestamp)) months.set(release.timestamp, monthLabel(release.timestamp));
      }

      return [...months.values()].map((label) => ({ count: shown.get(label) ?? 0, label }));
    },

    /**
     * The feed with the score gates applied — the base every other gate composes on.
     *
     * Underneath the genre and listened gates rather than beside them, so the facet
     * counts and the progress denominator are both measured on rows the score filter
     * has already kept. A sidebar promising 23 rows that the range then withholds is
     * the bug this ordering prevents.
     */
    ratingFiltered(state): Release[] {
      const [low, high] = state.ratingRange;
      if (!state.hideUnrated && low === RATING_BOUNDS[0] && high === RATING_BOUNDS[1]) return state.releases;

      return state.releases.filter((release) => matchesRating(release, state.hideUnrated, state.ratingRange));
    },

    /** The feed as the list renders it: both gates, composed rather than re-tested. */
    visibleReleases(state): Release[] {
      if (!state.hideChecked) return this.genreFiltered;

      return this.genreFiltered.filter((release) => !state.checks[release.key]);
    },
  },

  /*
   * The ticks are not in here: they live in Supabase, keyed on the account, and a
   * local copy could only ever contradict it — a row unticked on the phone would
   * come back ticked on the desktop until the sync answered, which is the bug the
   * sharing was added to fix.
   *
   * The feed itself stays so the 6-hour window below survives a reload instead of
   * only applying within a single session. A few hundred rows is ~150 KB.
   */
  persist: {
    /*
     * The filters are the user's own and survive the version gate; only the feed and
     * its timestamp are dropped, so the next visit refetches rather than rendering
     * rows the current code cannot read.
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
      "feedVersion",
      "fetchedAt",
      "genres",
      "hideChecked",
      "hideUnrated",
      "ratingRange",
      "releases",
      "sortRating",
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
    genres: [],
    hideChecked: false,
    hideUnrated: false,
    loading: false,
    ratingRange: [...RATING_BOUNDS],
    releases: [],
    sortRating: false,
  }),
});

/**
 * The scraped release feed, held in Supabase and refreshed nightly by
 * https://github.com/BeardedBear/scrap.
 *
 * It exists because every other source classifies a release only once somebody has
 * curated it, which takes months — so the newest records, the ones this page is for,
 * arrive with no genre at all. The scrapers read sites that file each release under
 * an editor-chosen genre on day one.
 *
 * The whole window, unfiltered: it runs to a few hundred rows, so selecting genres
 * server-side saved nothing and cost a second vocabulary request, a taste-derivation
 * request, and a genre list that could only ever show what was already tracked. The
 * sidebar filters what came back instead, on honest counts.
 */
async function fetchFeed(): Promise<Release[]> {
  const rows = await getFeedReleases(windowStart());

  return rows
    .map(toReleaseFromFeed)
    .filter((release) => !useCheckLiveAlbum(release.name) && !useCheckReissueAlbum(release.name));
}

/**
 * The oldest month still counted as news, as "YYYY-MM-01".
 *
 * The first of the window's month, not the window's own start: the `month` column
 * always holds the first of a month, so asking for `>= 2026-06-29` would compare
 * against `2026-06-01` and drop the whole of June — a third of the window, silently.
 */
function windowStart(): string {
  return `${new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 7)}-01`;
}
