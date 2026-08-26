<template>
  <div v-if="!podcastsStore.list && !podcastsStore.myPodcasts.length" class="loader">
    <BdLoader />
  </div>
  <div v-else ref="scrollRef" class="podcasts" @scroll="onScroll">
    <PageFit>
      <div class="title">
        <h1 class="name bd-font-bold">Podcasts</h1>
      </div>
      <BdEmptyState
        v-if="!podcastsStore.myPodcasts.length"
        message="Follow a show on Spotify and it will show up here."
        title="You do not follow any podcast"
      >
        <template #icon><i class="icon-podcast" /></template>
      </BdEmptyState>
      <div v-else class="podcast-list">
        <PodcastCard
          v-for="(podcast, index) in podcastsStore.myPodcasts"
          :id="podcast.show.id"
          :key="index"
          :covers="podcast?.show.images"
          :name="podcast.show.name"
        />
      </div>
    </PageFit>
  </div>
</template>

<script lang="ts" setup>
import { BdEmptyState, BdLoader } from "bearded-ui";
import { ref } from "vue";
import { useRoute } from "vue-router";

import PodcastCard from "@/components/podcast/PodcastCard.vue";
import PageFit from "@/components/ui/PageFit.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { usePodcasts } from "@/views/podcasts/PodcastsStore";

const podcastsStore = usePodcasts();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);
podcastsStore.clean().finally(() => {
  podcastsStore.getPodcasts();
  podcastsStore.getMyPodcasts("me/shows?limit=50");
});
</script>
<style scoped>

.loader {
  display: grid;
  place-content: center;
}

.podcasts {
  animation: pop-content 1s ease both;
  overflow-y: auto;
  padding: var(--bd-space-6);
}

.podcast-list {
  display: grid;
  gap: var(--bd-space-6);

  /* Was repeat(4, 1fr) with no breakpoint: four 55px columns at 390px wide. */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  margin-bottom: var(--bd-space-6);
}

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--bd-space-6);

  .name {
    flex: 1;
    font-size: var(--bd-font-size-xl);
  }
}
</style>
