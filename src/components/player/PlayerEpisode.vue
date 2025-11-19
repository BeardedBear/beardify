<template>
  <div class="meta">
    <What :cover-url="playerStore.currentFromSDK?.album.images[1].url" v-if="playerStore.currentFromSDK" />
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
import Loader from "@/components/ui/LoadingDots.vue";
import Device from "@/components/player/device/DeviceIndex.vue";
import Controls from "@/components/player/PlayerControls.vue";
import What from "@/components/player/PlayerMetas.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import SeekBar from "@/components/player/SeekBar.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;

.meta {
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  justify-content: space-between;
  padding: 0.9rem 1.2rem 0.5rem;
}
</style>
