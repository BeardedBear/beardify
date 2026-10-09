<template>
  <div v-if="podcastsStore.loading" class="loader">
    <BdLoader />
  </div>
  <!--
    Every read used to swallow its error into a DEV-only console line, so a
    failed request left this page on the spinner above, forever and silently.
  -->
  <BdEmptyState
    v-else-if="podcastsStore.error || !podcastsStore.podcast"
    action-label="Try again"
    message="Spotify did not answer for this show."
    title="Could not load this podcast"
    @action="load()"
  >
    <template #icon><TriangleAlert :size="32" /></template>
  </BdEmptyState>
  <PageScroller v-else>
    <div class="podcast">
      <PodcastHeader />
      <div v-if="podcastsStore.episodesLoading && !podcastsStore.episodes.length" class="loader">
        <BdLoader />
      </div>
      <BdEmptyState
        v-else-if="!podcastsStore.episodes.length"
        message="This show has not published anything yet."
        title="No episode"
      >
        <template #icon><i class="icon-podcast" /></template>
      </BdEmptyState>
      <ul v-else class="episodes">
        <li v-for="episode in podcastsStore.episodes" :key="episode.id">
          <PodcastEpisode :episode="episode" />
        </li>
      </ul>
    </div>
  </PageScroller>
</template>

<script lang="ts" setup>
import { TriangleAlert } from "@lucide/vue";
import { BdEmptyState, BdLoader } from "bearded-ui";

import PodcastEpisode from "@/components/podcast/PodcastEpisode.vue";
import PodcastHeader from "@/components/podcast/PodcastHeader.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import { usePodcasts } from "@/views/podcasts/PodcastsStore";

const props = defineProps<{ id: string }>();
const podcastsStore = usePodcasts();

function load(): void {
  podcastsStore.clean().finally(() => {
    podcastsStore.getPodcast(props.id);
    podcastsStore.getPodcastEpisodes(props.id);
    podcastsStore.getFollowStatus(props.id);
  });
}

load();
</script>

<style scoped>

.podcast {
  margin: 0 auto;
  padding: var(--bd-space-6);
  width: 100%;
}

.episodes {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
