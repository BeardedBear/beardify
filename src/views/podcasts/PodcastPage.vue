<template>
  <div class="loader" v-if="!podcastsStore.podcast"><Loader /></div>
  <div class="podcast" v-else>
    <PageFit>
      <div class="title">
        <div class="name">{{ podcastsStore.podcast?.name }}</div>
        <PodcastFollowButton :podcast-id="props.id" v-if="podcastsStore.podcast" />
      </div>
      <div>
        <div :key="index" v-for="(episode, index) in podcastsStore.episodes">
          <PodcastEpisode :episode="episode" />
        </div>
      </div>
    </PageFit>
  </div>
</template>

<script lang="ts" setup>
import Loader from "@/components/ui/LoadingDots.vue";
import PageFit from "@/components/ui/PageFit.vue";
import PodcastEpisode from "@/components/podcast/PodcastEpisode.vue";
import PodcastFollowButton from "@/components/podcast/PodcastFollowButton.vue";
import { usePodcasts } from "@/views/podcasts/PodcastsStore";

const props = defineProps<{ id: string }>();
const podcastsStore = usePodcasts();

podcastsStore.clean().finally(() => {
  podcastsStore.getPodcast(props.id);
  podcastsStore.getPodcastEpisodes(`shows/${props.id}/episodes?limit=50`);
  podcastsStore.getFollowStatus(props.id);
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

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

    @include font-bold;
  }
}
</style>
