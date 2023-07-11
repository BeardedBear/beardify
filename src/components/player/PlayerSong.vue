<template>
  <div v-if="currentTrack" class="meta">
    <What />
    <Controls />
    <Device />
  </div>
  <Loader v-else />
  <SeekBar />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Loader from "../LoadingDots.vue";
import Controls from "./PlayerControls.vue";
import What from "./PlayerMetas.vue";
import { usePlayer } from "./PlayerStore";
import SeekBar from "./SeekBar.vue";
import Device from "./device/DeviceIndex.vue";

const playerStore = usePlayer();
const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);
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
