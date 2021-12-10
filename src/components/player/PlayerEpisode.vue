<template>
  <div class="meta">
    <What v-if="playerStore.currentFromSDK" :cover-url="playerStore.currentFromSDK?.album.images[1].url" />
    <div v-else></div>
    <Controls
      :duration="playerStore.currentFromSDK && playerStore.currentFromSDK.duration_ms"
      :progress="playerStore.currentPositionFromSDK"
    />
    <div class="options">
      <Volume />
      <Devices />
    </div>
  </div>
  <SeekBar :duration="playerStore.currentFromSDK && playerStore.currentFromSDK.duration_ms" />
</template>

<script lang="ts" setup>
import Controls from "./Controls.vue";
import Devices from "./Devices.vue";
import { usePlayer } from "./PlayerStore";
import SeekBar from "./SeekBar.vue";
import Volume from "./Volume.vue";
import What from "./What.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.meta {
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  justify-content: space-between;
  padding: 0.9rem 1.2rem;
}

.options {
  text-align: right;
}
</style>
