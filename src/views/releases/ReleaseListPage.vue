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
      <h1 class="name bd-font-bold">Releases</h1>
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
    <div class="body">
      <div class="side">
        <ReleaseSide />
      </div>
      <div ref="scrollRef" class="list" @scroll="onScroll">
        <BdEmptyState
          v-if="!releasesStore.visibleReleases.length"
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
import { ArrowUpDown, Disc3, RefreshCw, SlidersHorizontal, TriangleAlert } from "@lucide/vue";
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

.side {
  border-right: 1px solid var(--bd-bg-dark);
  overflow: auto;
  padding: 0 var(--bd-space-4) var(--bd-space-4);
  position: sticky;
  top: 0;
  width: 14rem;

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

.filters-button {
  @media (--tablet-up) {
    display: none;
  }
}

.name {
  font-size: var(--bd-font-size-xl);
  margin: 0;
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
