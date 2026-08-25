<template>
  <div v-if="releasesStore.loading" class="loader">
    <BdLoader />
  </div>
  <BdEmptyState
    v-else-if="releasesStore.error"
    action-label="Try again"
    message="The releases feed is hosted separately from Spotify and is not answering right now."
    title="Could not load releases"
    @action="releasesStore.getReleases()"
  >
    <template #icon><i class="icon-warning" /></template>
  </BdEmptyState>
  <BdEmptyState
    v-else-if="!releasesStore.releases.length"
    message="Nothing has been published to the releases feed for the artists you follow."
    title="No releases yet"
  >
    <template #icon><i class="icon-album" /></template>
  </BdEmptyState>
  <div v-else class="releases">
    <div class="side">
      <ReleaseSide />
    </div>
    <div ref="scrollRef" class="list" @scroll="onScroll">
      <ReleaseList />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdEmptyState, BdLoader } from "bearded-ui";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

import ReleaseList from "@/components/releases/ReleaseList.vue";
import ReleaseSide from "@/components/releases/ReleaseSide.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { useAuth } from "@/views/auth/AuthStore";
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();
const authStore = useAuth();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);

watch(
  () => releasesStore.activeSlug,
  () => scrollRef.value?.scrollTo(0, 0),
);

watch(
  () => authStore.me,
  () => authStore.me && releasesStore.createReleasesCheckEntry(),
);

authStore.me && !releasesStore.checks && releasesStore.createReleasesCheckEntry();
!releasesStore.releases.length && releasesStore.getReleases();
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
  padding: 0 1rem 1rem;
  position: sticky;
  top: 0;
  width: 12rem;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
