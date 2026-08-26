<template>
  <div v-if="!podcastsStore.podcast" class="loader">
    <BdLoader />
  </div>
  <div v-else ref="scrollRef" class="podcast" @scroll="onScroll">
    <PageFit>
      <div class="title">
        <h1 class="name bd-font-bold">
          {{ podcastsStore.podcast?.name }}
        </h1>
        <PodcastFollowButton v-if="podcastsStore.podcast" :podcast-id="props.id" />
      </div>
      <div>
        <div v-for="(episode, index) in podcastsStore.episodes" :key="index">
          <PodcastEpisode :episode="episode" />
        </div>
      </div>
    </PageFit>
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";
import { ref } from "vue";
import { useRoute } from "vue-router";

import PodcastEpisode from "@/components/podcast/PodcastEpisode.vue";
import PodcastFollowButton from "@/components/podcast/PodcastFollowButton.vue";
import PageFit from "@/components/ui/PageFit.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { usePodcasts } from "@/views/podcasts/PodcastsStore";

const props = defineProps<{ id: string }>();
const podcastsStore = usePodcasts();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);

podcastsStore.clean().finally(() => {
  podcastsStore.getPodcast(props.id);
  podcastsStore.getPodcastEpisodes(`shows/${props.id}/episodes?limit=50`);
  podcastsStore.getFollowStatus(props.id);
});
</script>

<style scoped>

.loader {
  display: grid;
  place-content: center;
}

.podcast {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  padding: var(--bd-space-6);
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
