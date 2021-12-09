<template>
  <div v-if="!podcastsStore.list && !podcastsStore.myPodcasts.length" class="loader"><Loader /></div>
  <div v-else class="podcasts">
    <div class="fit">
      <div class="title">
        <div class="name">PODCASTS</div>
      </div>
      <div class="heading sticky-heading">Mes podcasts</div>
      <div v-if="!podcastsStore.myPodcasts.length"><Loader /></div>
      <div v-else class="podcast-list">
        <PodcastCard
          v-for="(podcast, index) in podcastsStore.myPodcasts"
          :id="podcast.show.id"
          :key="index"
          :covers="podcast?.show.images"
          :name="podcast?.show.name"
        />
      </div>
      <div class="heading sticky-heading">Podcasts musique</div>
      <div v-if="!podcastsStore.list"><Loader /></div>
      <div v-else class="podcast-list">
        <PodcastCard
          v-for="(podcast, index) in podcastsStore.list?.shows"
          :id="podcast.id"
          :key="index"
          :covers="podcast?.images"
          :name="podcast?.name"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePodcasts } from "./PodcastsStore";
import PodcastCard from "../../components/podcast/PodcastCard.vue";
import Loader from "../../components/LoadingDots.vue";

const podcastsStore = usePodcasts();
podcastsStore.clean().finally(() => {
  podcastsStore.getPodcasts();
  podcastsStore.getMyPodcasts("me/shows?limit=50");
});
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

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
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;

  .name {
    flex: 1;
    font-size: 2rem;
    font-weight: bold;
  }
}

.fit {
  margin: 0 auto;
  max-width: 57rem;
}
</style>
