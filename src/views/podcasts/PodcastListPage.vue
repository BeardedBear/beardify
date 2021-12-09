<template>
  <div class="podcasts">
    <div class="title">
      <div class="name">PODCASTS</div>
    </div>

    <div class="list">
      <PodcastCard
        v-for="(podcast, index) in podcastsStore.list"
        :id="podcast.id"
        :key="index"
        :covers="podcast.images"
        :name="podcast.name"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePodcasts } from "./PodcastsStore";
import PodcastCard from "../../components/podcast/PodcastCard.vue";

const podcastsStore = usePodcasts();
podcastsStore.getPodcasts();
</script>
<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.podcasts {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  padding: 2rem 2.2rem;
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
</style>
