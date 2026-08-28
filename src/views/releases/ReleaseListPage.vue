<template>
  <div v-if="releasesStore.loading" class="loader">
    <BdLoader />
  </div>
  <BdEmptyState
    v-else-if="releasesStore.error"
    action-label="Try again"
    message="Spotify did not answer for either of the release feeds."
    title="Could not load releases"
    @action="releasesStore.getReleases(true)"
  >
    <template #icon><TriangleAlert :size="32" /></template>
  </BdEmptyState>
  <BdEmptyState
    v-else-if="!releasesStore.releases.length"
    action-label="Refresh"
    message="No release matched the tracked genres. Widen them, or try again later."
    title="No releases yet"
    @action="releasesStore.getReleases(true)"
  >
    <template #icon><Disc3 :size="32" /></template>
  </BdEmptyState>
  <div v-else class="releases">
    <div class="side">
      <ReleaseSide />
    </div>
    <div ref="scrollRef" class="list" @scroll="onScroll">
      <div class="toolbar">
        <div class="fetched">Updated {{ fetchedLabel }}</div>
        <BdButton size="small" @click="releasesStore.getReleases(true)">
          <RefreshCw :size="14" />
          Refresh
        </BdButton>
      </div>
      <BdEmptyState
        v-if="!releasesStore.visibleReleases.length"
        message="No release matches the current filters."
        title="Nothing here"
      >
        <template #icon><Disc3 :size="32" /></template>
      </BdEmptyState>
      <ReleaseList v-else />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Disc3, RefreshCw, TriangleAlert } from "@lucide/vue";
import { BdButton, BdEmptyState, BdLoader } from "bearded-ui";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import ReleaseList from "@/components/releases/ReleaseList.vue";
import ReleaseSide from "@/components/releases/ReleaseSide.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);

// Time, not date: the feed is refetched several times a day, so "28 Aug" says nothing.
const fetchedLabel = computed(() =>
  new Date(releasesStore.fetchedAt ?? Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
);

watch(
  () => [releasesStore.genre, releasesStore.albumsOnly],
  () => scrollRef.value?.scrollTo(0, 0),
);

releasesStore.getReleases();
</script>

<style scoped>
.releases {
  animation: pop-content 1s ease both;
  display: flex;
  overflow: hidden;
}

.list {
  flex: 1;
  overflow: auto;
}

.side {
  overflow: auto;
  padding: 0 var(--bd-space-4) var(--bd-space-4);
  position: sticky;
  top: 0;
  width: 14rem;
}

.toolbar {
  align-items: center;
  display: flex;
  gap: var(--bd-space-3);
  justify-content: flex-end;
  padding: var(--bd-space-4) var(--bd-space-6) 0;
}

.fetched {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
}

.loader {
  display: grid;
  place-content: center;
}
</style>
