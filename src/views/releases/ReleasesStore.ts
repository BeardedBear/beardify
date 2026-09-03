import { useDebounceFn } from "@vueuse/core";
import { defineStore } from "pinia";

import { MonthGroup, Release, ReleasesPage } from "@/@types/Releases";
import { getRemoteChecks, putRemoteChecks } from "@/helpers/releaseChecks";
import { getFeedReleases } from "@/helpers/releaseFeed";
import { groupByMonth, mergeReleases, pruneChecks, toReleaseFromFeed } from "@/helpers/releases";
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
      if (!state.genres.length) return state.releases;

      // Any of them, not all: two genres selected reads as "either".
      return state.releases.filter((release) => state.genres.some((genre) => release.terms.includes(genre)));
    },

    /**
     * Filter terms present in the feed, most common first — the sidebar list.
     *
     * Counted over `listenFiltered` rather than the whole feed, so a row saying
     * 23 can actually deliver 23 rows. Not over `visibleReleases`: a facet count
     * has to answer "how many if I pick this", which the genre gate would have
     * already answered for it.
     */
    genreList(): { count: number; name: string }[] {
      const counts = new Map<string, number>();
      for (const release of this.listenFiltered) {
        for (const term of release.terms) counts.set(term, (counts.get(term) ?? 0) + 1);
      }

      return [...counts.entries()]
        .map(([name, count]) => ({ count, name }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    },

    /** The feed with the listened gate applied and nothing else — what the facet counts are measured on. */
    listenFiltered(state): Release[] {
      if (!state.hideChecked) return state.releases;

      return state.releases.filter((release) => !state.checks[release.key]);
    },

    /**
     * The feed grouped into months — and nothing finer. The listing this feed
     * comes from groups by month and never states a day, so day headings would
     * all read "exact date unknown"; a heading per group saying the same thing
     * is noise.
     *
     * Read by both the list and the side rail.
     * A getter rather than a computed in each: the grouping also sorts every
     * month, and the rail exists precisely to jump between the headings the
     * list renders — two passes could disagree about what months there are.
     */
    monthGroups(): MonthGroup[] {
      return groupByMonth(this.visibleReleases, this.checks, this.sortRating);
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
    pick: ["feedVersion", "fetchedAt", "genres", "hideChecked", "releases", "sortRating"],
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
    loading: false,
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
