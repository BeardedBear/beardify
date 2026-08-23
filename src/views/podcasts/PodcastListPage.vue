<template>
  <div v-if="!podcastsStore.list && !podcastsStore.myPodcasts.length" class="loader">
    <BdLoader />
  </div>
  <div v-else ref="scrollRef" class="podcasts" @scroll="onScroll">
    <PageFit>
      <div class="title">
        <h1 class="name font-bold">Podcasts</h1>
      </div>
      <div v-if="!podcastsStore.myPodcasts.length">
        <BdLoader />
      </div>
      <div v-else class="podcast-list">
        <PodcastCard
          v-for="(podcast, index) in podcastsStore.myPodcasts"
          :id="podcast.show.id"
          :key="index"
          :covers="podcast?.show.images"
        />
      </div>
    </PageFit>
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";
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
  padding: 2rem 2.2rem;
}

.podcast-list {
  display: grid;
  gap: 2rem;

  /* Was repeat(4, 1fr) with no breakpoint: four 55px columns at 390px wide. */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  margin-bottom: 2rem;
}

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;

  .name {
    flex: 1;
    font-size: var(--font-size-xl);
  }
}
</style>
