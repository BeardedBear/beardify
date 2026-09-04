<template>
  <div v-if="releasesStore.loading" class="loader">
    <BdLoader />
  </div>
  <BdEmptyState
    v-else-if="releasesStore.error"
    action-label="Try again"
    message="The release feed did not answer."
    title="Could not load releases"
    @action="releasesStore.getReleases(true)"
  >
    <template #icon><TriangleAlert :size="32" /></template>
  </BdEmptyState>
  <BdEmptyState
    v-else-if="!releasesStore.releases.length"
    action-label="Refresh"
    message="The feed came back empty. Try again in a moment."
    title="No releases yet"
    @action="releasesStore.getReleases(true)"
  >
    <template #icon><Disc3 :size="32" /></template>
  </BdEmptyState>
  <div v-else class="releases">
    <div class="toolbar">
      <div class="heading">
        <h1 class="name bd-font-bold">Releases</h1>
        <!--
          One denominator. This used to read "N shown · M listened", two numbers
          off two different sets, and the second was pinned to 0 for as long as
          "Hide listened" was on — the toggle appeared to erase the progress it
          was measuring.
        -->
        <div class="counts">{{ releasesStore.checkedCount }} of {{ releasesStore.genreFiltered.length }} listened</div>
      </div>
      <div class="tools">
        <BdTooltip :content="`Feed refreshed every 6 hours. Last update ${fetchedLabel}.`" bare>
          <div class="fetched">Updated {{ fetchedLabel }}</div>
        </BdTooltip>
        <BdButton
          class="filters-button"
          size="small"
          variant="border"
          @click="dialogStore.open({ type: 'releaseFilters' })"
        >
          <SlidersHorizontal :size="14" />
          Filters
        </BdButton>
        <BdTooltip bare content="Sort releases by editorial rating">
          <BdButton
            :active="releasesStore.sortRating"
            label="Sort releases by editorial rating"
            size="small"
            variant="border"
            @click="releasesStore.toggleSortRating()"
          >
            <ArrowUpDown :size="14" />
            Rating
          </BdButton>
        </BdTooltip>
        <BdButton size="small" @click="releasesStore.getReleases(true)">
          <RefreshCw :size="14" />
          Refresh
        </BdButton>
      </div>
    </div>
    <!-- The filter column is ~25 tab stops and precedes the feed in the DOM. -->
    <a class="skip-link" href="#release-feed">Skip to releases</a>
    <div class="body">
      <div class="side">
        <ReleaseSide />
      </div>
      <div id="release-feed" ref="scrollRef" class="list" @scroll="onScroll">
        <!--
          Two ways to end up with an empty feed, and only one of them is a
          mistake. Ticking off the last unheard release is the task completed —
          answering that with "Nothing here / No release matches the current
          filters" and a button that undoes the work makes the reward for
          finishing indistinguishable from an error.
        -->
        <BdEmptyState
          v-if="caughtUp"
          action-label="Show listened"
          message="Nothing unheard in the last 60 days."
          title="Caught up"
          @action="releasesStore.hideChecked = false"
        >
          <template #icon><CheckCheck :size="32" /></template>
        </BdEmptyState>
        <BdEmptyState
          v-else-if="!releasesStore.visibleReleases.length"
          action-label="Clear filters"
          message="No release matches the current filters."
          title="Nothing here"
          @action="releasesStore.clearFilters()"
        >
          <template #icon><Disc3 :size="32" /></template>
        </BdEmptyState>
        <ReleaseList v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowUpDown, CheckCheck, Disc3, RefreshCw, SlidersHorizontal, TriangleAlert } from "@lucide/vue";
import { BdButton, BdEmptyState, BdLoader, BdTooltip } from "bearded-ui";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { useDialog } from "@/components/dialog/DialogStore";
import ReleaseList from "@/components/releases/ReleaseList.vue";
import ReleaseSide from "@/components/releases/ReleaseSide.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();
const dialogStore = useDialog();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);

/*
 * Empty because the week is done, not because the filters are too tight: the
 * listened gate is the only thing holding anything back, and there was something
 * to hold back in the first place.
 */
const caughtUp = computed(
  () =>
    !releasesStore.visibleReleases.length
    && releasesStore.hideChecked
    && !releasesStore.genres.length
    && releasesStore.releases.length > 0,
);

// Time, not date: the feed is refetched several times a day, so "28 Aug" says nothing.
const fetchedLabel = computed(() =>
  new Date(releasesStore.fetchedAt ?? Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
);

watch(
  () => releasesStore.genres,
  () => scrollRef.value?.scrollTo(0, 0),
);

releasesStore.getReleases();
</script>

<style scoped>
.releases {
  animation: pop-content 1s ease both;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

@media (prefers-reduced-motion: reduce) {
  .releases {
    animation: none;
  }
}

.body {
  display: flex;
  flex: 1;
  min-height: 0;

  @media (--tablet-down) {
    flex-direction: column;
  }
}

.list {
  flex: 1;
  overflow: auto;
}

/* No `position: sticky` here: .side is stretched to its containing block's
   height and .body is not a scroll container, so there is no range to stick
   within — it scrolls its own overflow instead, which is what was wanted. */
.side {
  border-right: 1px solid var(--bd-bg-dark);
  overflow: auto;
  padding: 0 var(--bd-space-4) var(--bd-space-4);
  scrollbar-gutter: stable;
  width: 17rem;

  /* Mobile: the filter column is moved into a dialog, opened from the toolbar. */
  @media (--tablet-down) {
    display: none;
  }
}

.toolbar {
  align-items: center;
  background-color: var(--bd-bg-darker);
  border-bottom: 1px solid var(--bd-bg-dark);
  display: flex;
  gap: var(--bd-space-3);
  justify-content: space-between;
  padding: var(--bd-space-3) var(--bd-space-6);

  @media (--mobile) {
    flex-wrap: wrap;
    padding: var(--bd-space-3) var(--bd-space-4);
  }
}

/*
 * Hidden exactly where .side reappears, and not one pixel earlier. Paired with
 * --tablet-up (>= 768px) against .side's --tablet-down (<= 1024px), the two
 * hid each other across 768-1024px: the filter column was gone and the only
 * button that opens it as a dialog was gone with it, so the entire filter and
 * month-navigation panel had no reachable trigger on a landscape tablet or a
 * narrowed desktop window.
 */
.filters-button {
  @media (--desktop-up) {
    display: none;
  }
}

.name {
  font-size: var(--bd-font-size-xl);
  margin: 0;
}

/* Baseline, not centre: the count reads as a subtitle of the title it sits beside. */
.heading {
  align-items: baseline;
  display: flex;
  gap: var(--bd-space-3);
}

.counts {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  white-space: nowrap;
}

.tools {
  align-items: center;
  display: flex;
  gap: var(--bd-space-2);
  white-space: nowrap;
}

.fetched {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  margin-inline-end: var(--bd-space-2);

  /* A spare timestamp is noise in a phone header that is already tight. */
  @media (--mobile) {
    display: none;
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
