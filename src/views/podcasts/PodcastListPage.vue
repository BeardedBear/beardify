<template>
  <div class="loader" v-if="!podcastsStore.list && !podcastsStore.myPodcasts.length">
    <Loader />
  </div>
  <div class="podcasts" v-else>
    <PageFit>
      <div class="title"><div class="name">Podcasts</div></div>
      <div v-if="!podcastsStore.myPodcasts.length"><Loader /></div>
      <div class="podcast-list" v-else>
        <PodcastCard
          :covers="podcast?.show.images"
          :id="podcast.show.id"
          :key="index"
          v-for="(podcast, index) in podcastsStore.myPodcasts"
        />
      </div>
    </PageFit>
  </div>
</template>

<script lang="ts" setup>
import Loader from "../../components/LoadingDots.vue";
import PageFit from "../../components/PageFit.vue";
import PodcastCard from "../../components/podcast/PodcastCard.vue";
import { usePodcasts } from "./PodcastsStore";

const podcastsStore = usePodcasts();
podcastsStore.clean().finally(() => {
  podcastsStore.getPodcasts();
  podcastsStore.getMyPodcasts("me/shows?limit=50");
});
</script>
<style lang="scss" scoped>
@use "../../assets/scss/colors" as colors;
@use "../../assets/scss/responsive" as responsive;

.loader {
  display: grid;
  place-content: center;
}

.podcasts {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  padding: 2rem 2.2rem;
}

.podcast-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 2rem;
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
</style>
