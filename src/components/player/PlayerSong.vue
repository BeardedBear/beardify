<template>
  <div class="meta">
    <What
      v-if="playerStore.currentlyPlaying.item"
      :cover-url="playerStore.currentlyPlaying.item?.album.images[1].url"
    />
    <Loader v-else />
    <Controls
      :duration="playerStore.currentlyPlaying.item && playerStore.currentlyPlaying.item.duration_ms"
      :progress="playerStore.currentlyPlaying.progress_ms"
    />
    <Device />
  </div>
  <SeekBar :duration="playerStore.currentlyPlaying.item && playerStore.currentlyPlaying.item.duration_ms" />
</template>

<script lang="ts" setup>
import Controls from "./Controls.vue";
import { usePlayer } from "./PlayerStore";
import SeekBar from "./SeekBar.vue";
import What from "./What.vue";
import Loader from "../LoadingDots.vue";
import Device from "./device/Device.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.meta {
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  justify-content: space-between;
  padding: 0.9rem 1.2rem 0.5rem;
}

.options {
  text-align: right;
}
</style>
