<template>
  <div ref="panelRef" class="search-panel" @keydown="onKeydown">
    <SearchInput />

    <!--
      Collections and playlists come first, and from memory: the sidebar store
      already holds them, so this strip answers on the first keystroke while the
      four network columns are still in flight. It is also the only place the
      product's own headline object — a Collection — was findable from search at
      all; until now you had to know it lived in a different box entirely.
    -->
    <SearchCollections />

    <!--
      Results replace themselves after the request lands, with nothing said. The
      live region announces the counts once they settle; `polite` so it waits
      for a pause rather than cutting across whatever is being read.
    -->
    <p aria-live="polite" class="visually-hidden">{{ resultSummary }}</p>
    <BdEmptyState
      v-if="searchStore.failed"
      action-label="Try again"
      message="Spotify did not answer. Your connection or its service may be down."
      title="Search failed"
      @action="searchStore.search()"
    >
      <template #icon><i class="icon-warning" /></template>
    </BdEmptyState>
    <div v-else class="results">
      <SearchArtists class="col-artists" />
      <SearchAlbums class="col-albums" />
      <!-- Wrapped: two components cannot share one grid area without overlapping. -->
      <div class="col-tail">
        <SearchSongs />
        <SearchPodcasts />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdEmptyState } from "bearded-ui";
import { computed, ref } from "vue";

import SearchAlbums from "@/components/search/SearchAlbums.vue";
import SearchArtists from "@/components/search/SearchArtists.vue";
import SearchCollections from "@/components/search/SearchCollections.vue";
import SearchInput from "@/components/search/SearchInput.vue";
import { nextPosition } from "@/components/search/searchNavigation";
import SearchPodcasts from "@/components/search/SearchPodcasts.vue";
import SearchSongs from "@/components/search/SearchSongs.vue";
import { useSearch } from "@/components/search/SearchStore";

/*
 * No Escape listener here any more. BdDialog is a native <dialog>, which closes
 * on Escape by itself and routes that through DialogWrap's `isClosing` guard —
 * the hand-rolled one bypassed the guard and spent an API request on the way
 * out, because it called `reset()`, which used to re-run the search.
 */
const searchStore = useSearch();
const panelRef = ref<HTMLElement | null>(null);

/*
 * Arrow navigation reads the DOM rather than mirroring it in state.
 *
 * The columns render whatever the store holds, at their own pace; a parallel
 * index would drift the moment one of them changed shape. Querying the marked
 * hits at keypress costs nothing at this size and cannot disagree with what is
 * on screen. `nextPosition` owns the arithmetic and is tested on its own.
 */
const COLUMN_SELECTORS = [".col-artists", ".col-albums", ".col-tail"];

function columnsOf(panel: HTMLElement): HTMLElement[][] {
  return COLUMN_SELECTORS.map((selector) =>
    [...(panel.querySelector(selector)?.querySelectorAll<HTMLElement>("[data-search-hit]") ?? [])]);
}

function onKeydown(event: KeyboardEvent): void {
  const key = event.key;

  /*
   * Enter is deliberately not handled here.
   *
   * A link and a button turn Enter into a click, but the browser dispatches
   * that click *after* the keydown finishes — so closing the dialog from here
   * tore the element out of the DOM before its own handler ever ran, and Enter
   * appeared to do nothing at all. Each hit already closes from its own
   * `@click`; the only one that cannot is the album card, whose activation is
   * a keydown, and SearchAlbums closes that one itself.
   */

  if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "ArrowLeft" && key !== "ArrowRight") return;

  const panel = panelRef.value;
  if (!panel) return;

  const columns = columnsOf(panel);
  const active = document.activeElement as HTMLElement | null;

  /*
   * Left/Right inside the field belong to the caret, not to us — otherwise you
   * cannot move through your own query to fix a typo.
   */
  const inField = !!active?.closest("input, textarea");
  if (inField && key !== "ArrowDown") return;

  let current: { column: number; index: number } | null = null;
  columns.forEach((hits, column) => {
    const index = hits.findIndex((hit) => hit === active || hit.contains(active));
    if (index !== -1) current = { column, index };
  });

  const target = nextPosition(columns.map((hits) => hits.length), current, key);
  event.preventDefault();

  if (target === null) {
    panel.querySelector<HTMLElement>("input")?.focus();
    return;
  }
  columns[target.column]?.[target.index]?.focus();
}

const resultSummary = computed(() => {
  if (!searchStore.query.length) return "";
  if (searchStore.loading) return "Searching";
  if (searchStore.failed) return "Search failed";

  const { albums, artists, podcasts, tracks } = searchStore;
  const total = artists.length + albums.length + tracks.length + podcasts.length;
  if (!total) return "No results";

  return `${artists.length} artists, ${albums.length} albums, ${tracks.length} songs, `
    + `${podcasts.length} podcasts`;
});
</script>

<style scoped>
/*
 * Named `search-panel`, not `search`: SearchInput's root is also `.search`, and
 * a child component's root element carries its parent's scope id too — so the
 * rules below were landing on it as well. It inherited `flex: 1` and stretched
 * to fill the dialog, opening a dead gap under the field and stranding the
 * clear button at `top: 50%` in the middle of it.
 */
.search-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;

  /*
   * `min-height: 0` is what lets this shrink below its content inside the
   * dialog's column flex. Without it the panel never scrolled here — the whole
   * dialog body did, taking the search field off screen with it.
   */
  min-height: 0;
  padding: 1rem;
}

/*
 * Two tiers, not four equal columns. This app is navigated by album, so Albums
 * takes the width; Songs and Podcasts are the tail and sit on a narrow rail.
 * The old `0.9fr 1fr 0.8fr 0.8fr` gave four types the same weight and read as
 * "nothing here is the answer".
 */

/*
 * Three independent scrollers rather than one on `.results`.
 *
 * Stacked in a shared scroller, the tail rail (six songs plus four podcasts) is
 * taller than the album grid beside it, so reaching the podcasts scrolled
 * Artists and Albums off the top — you lost the columns you came for to see the
 * ones you didn't. Scrolling each column in place keeps all three on screen and
 * lets any one of them be long.
 */
.col-artists,
.col-albums,
.col-tail {
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
}

.col-artists {
  grid-area: artists;
}

.col-albums {
  grid-area: albums;
}

.col-tail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  grid-area: tail;
  min-width: 0;
}

.results {
  display: grid;
  flex: 1;
  font-size: var(--font-size-sm);
  gap: 1.5rem;
  grid-template-areas: "artists albums tail";
  grid-template-columns: 1fr 1.6fr 0.9fr;
  min-height: 0;
  overflow: hidden;

  @media (--tablet-down) {
    grid-template-areas:
      "artists albums"
      "tail tail";
    grid-template-columns: 1fr 1.4fr;
  }

  @media (--mobile) {
    gap: 1.5rem;
    grid-template-areas:
      "artists"
      "albums"
      "tail";
    grid-template-columns: 1fr;
  }
}
</style>
