<template>
  <div v-if="!podcastsStore.podcast" class="loader"><Loader /></div>
  <div v-else>
    {{ podcastsStore.podcast?.name }}
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { usePodcasts } from "./PodcastsStore";
import Loader from "../../components/LoadingDots.vue";

const props = defineProps<{ id: string }>();
const podcastsStore = usePodcasts();

podcastsStore.clean().finally(() => {
  podcastsStore.getPodcast(props.id);
});
</script>

<style lang="scss" scoped>
.loader {
  display: grid;
  place-content: center;
}
</style>
