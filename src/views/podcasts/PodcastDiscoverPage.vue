<template>
  <div v-if="discoverStore.loading" class="loader">
    <BdLoader />
  </div>
  <BdEmptyState
    v-else-if="discoverStore.error"
    action-label="Try again"
    message="Spotify did not answer for this category."
    title="Could not load shows"
    @action="discoverStore.getCategoryShows(props.category)"
  >
    <template #icon><TriangleAlert :size="32" /></template>
  </BdEmptyState>
  <div v-else ref="scrollRef" class="discover" @scroll="onScroll">
    <div class="content">
      <router-link class="back" to="/podcasts/discover">
        <ChevronLeft :size="16" />
        Categories
      </router-link>
      <h1 class="title bd-font-bold">{{ categoryLabel }}</h1>
      <div v-if="discoverStore.shows.length" class="podcast-list">
        <PodcastCard
          v-for="show in discoverStore.shows"
          :id="show.id"
          :key="show.id"
          :covers="show.images"
          :episodes="show.total_episodes"
          :name="show.name"
          :publisher="show.publisher"
        />
      </div>
      <!-- Click into a show to subscribe — the detail page already carries the Follow button. -->
      <BdEmptyState
        v-else
        message="Spotify didn't return any show for this category."
        title="No podcast found"
      >
        <template #icon><i class="icon-podcast" /></template>
      </BdEmptyState>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ChevronLeft, TriangleAlert } from "@lucide/vue";
import { BdEmptyState, BdLoader } from "bearded-ui";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import PodcastCard from "@/components/podcast/PodcastCard.vue";
import { PODCAST_CATEGORIES } from "@/components/podcast/podcastCategories";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { usePodcastDiscover } from "@/views/podcasts/PodcastDiscoverStore";

const props = defineProps<{ category: string }>();
const discoverStore = usePodcastDiscover();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);

const categoryLabel = computed(
  () => PODCAST_CATEGORIES.find((c) => c.id === props.category)?.label ?? props.category,
);

watch(
  () => props.category,
  (category) => discoverStore.getCategoryShows(category),
  { immediate: true },
);
</script>

<style scoped>

.discover {
  animation: pop-content 1s ease both;
  overflow-y: auto;
}

.content {
  margin: 0 auto;
  padding: var(--bd-space-6);
  width: 100%;
}

.back {
  align-items: center;
  color: var(--bd-font-color-dark);
  display: inline-flex;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-1);
  text-decoration: none;

  &:hover {
    color: var(--bd-font-color);
  }
}

.title {
  font-size: var(--bd-font-size-xl);
  margin: var(--bd-space-2) 0 var(--bd-space-6);
}

.podcast-list {
  display: grid;
  gap: var(--bd-space-6);
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));

  @media (--mobile) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
