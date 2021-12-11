<template>
  <div class="meta">
    <What v-if="playerStore.currentFromSDK" :cover-url="playerStore.currentFromSDK?.album.images[1].url" />
    <Loader v-else />
    <Controls
      :duration="playerStore.currentFromSDK && playerStore.currentFromSDK.duration_ms"
      :progress="playerStore.currentPositionFromSDK"
    />
    <Device />
  </div>
  <SeekBar :duration="playerStore.currentFromSDK && playerStore.currentFromSDK.duration_ms" />
</template>

<script lang="ts" setup>
import Loader from "../LoadingDots.vue";
import Controls from "./Controls.vue";
import { usePlayer } from "./PlayerStore";
import SeekBar from "./SeekBar.vue";
import What from "./What.vue";
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
</style>
