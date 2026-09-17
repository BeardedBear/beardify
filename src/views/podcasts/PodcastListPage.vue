<template>
  <div v-if="podcastsStore.loading" class="loader">
    <BdLoader />
  </div>
  <BdEmptyState
    v-else-if="podcastsStore.error"
    action-label="Try again"
    message="Spotify did not answer for your followed shows."
    title="Could not load podcasts"
    @action="load()"
  >
    <template #icon><TriangleAlert :size="32" /></template>
  </BdEmptyState>
  <!--
    A failed request and a genuinely empty library used to render the same
    spinner, because the loader was gated on an unrelated hardcoded show
    instead of on this page's own fetch.
  -->
  <BdEmptyState
    v-else-if="!podcastsStore.myPodcasts.length"
    message="Follow a show on Spotify and it will show up here."
    title="You do not follow any podcast"
  >
    <template #icon><i class="icon-podcast" /></template>
  </BdEmptyState>
  <PageScroller v-else>
    <div class="podcasts">
      <div class="title">
        <h1 class="name bd-font-bold">Podcasts</h1>
        <div class="counts">{{ podcastsStore.myPodcasts.length }} followed</div>
      </div>
      <div class="podcast-list">
        <PodcastCard
          v-for="podcast in podcastsStore.myPodcasts"
          :id="podcast.show.id"
          :key="podcast.show.id"
          :covers="podcast.show.images"
          :episodes="podcast.show.total_episodes"
          :name="podcast.show.name"
          :publisher="podcast.show.publisher"
        />
      </div>
    </div>
  </PageScroller>
</template>

<script lang="ts" setup>
import { TriangleAlert } from "@lucide/vue";
import { BdEmptyState, BdLoader } from "bearded-ui";

import PodcastCard from "@/components/podcast/PodcastCard.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import { usePodcasts } from "@/views/podcasts/PodcastsStore";

const podcastsStore = usePodcasts();

function load(): void {
  podcastsStore.clean().finally(() => podcastsStore.getMyPodcasts());
}

load();
</script>
<style scoped>

.podcasts {
  margin: 0 auto;
  padding: var(--bd-space-6);
  width: 100%;
}

.podcast-list {
  display: grid;
  gap: var(--bd-space-6);

  /* Was repeat(4, 1fr) with no breakpoint: four 55px columns at 390px wide. */
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  margin-bottom: var(--bd-space-6);

  /* Deux colonnes au minimum : 10rem plus le gap de 1.5rem n'en tiennent qu'une. */
  @media (--mobile) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.title {
  align-items: baseline;
  display: flex;
  gap: var(--bd-space-4);
  margin-bottom: var(--bd-space-6);

  .name {
    font-size: var(--bd-font-size-xl);
  }

  .counts {
    color: var(--bd-font-color-dark);
    font-size: var(--bd-font-size-sm);
  }
}
</style>
