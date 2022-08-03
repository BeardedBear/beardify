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
import Controls from "./PlayerControls.vue";
import { usePlayer } from "./PlayerStore";
import SeekBar from "./SeekBar.vue";
import What from "./PlayerMetas.vue";
import Loader from "../LoadingDots.vue";
import Device from "./device/DeviceIndex.vue";
import { computed } from "vue";

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
