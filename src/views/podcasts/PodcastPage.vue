<template>
  <div v-if="!podcastsStore.podcast" class="loader"><Loader /></div>
  <div v-else class="podcast">
    <div class="fit">
      <div class="title">
        <div class="name">{{ podcastsStore.podcast?.name }}</div>
      </div>
      <div>
        <!-- {{ podcastsStore.episodes }} -->
        <div v-for="(episode, index) in podcastsStore.episodes" :key="index">
          <PodcastEpisode :episode="episode" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { usePodcasts } from "./PodcastsStore";
import Loader from "../../components/LoadingDots.vue";
import PodcastEpisode from "../../components/podcast/PodcastEpisode.vue";

const props = defineProps<{ id: string }>();
const podcastsStore = usePodcasts();

podcastsStore.clean().finally(() => {
  podcastsStore.getPodcast(props.id);
  podcastsStore.getPodcastEpisodes(`shows/${props.id}/episodes?limit=50`);
});
</script>

<style lang="scss" scoped>
.loader {
  display: grid;
  place-content: center;
}

.podcast {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  padding: 2rem 2.2rem;
}

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;

  .name {
    flex: 1;
    font-size: 2.5rem;
    font-weight: bold;
  }
}

.fit {
  margin: 0 auto;
  max-width: 57rem;
}
</style>
