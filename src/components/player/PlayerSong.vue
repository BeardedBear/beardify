<template>
  <template v-if="usePlayer().playerState.track_window.current_track.id">
    <div class="meta">
      <What />
      <Controls />
      <Device />
    </div>
    <SeekBar />
  </template>
  <Loader v-else />
</template>

<script lang="ts" setup>
import Loader from "../LoadingDots.vue";
import Device from "./device/DeviceIndex.vue";
import Controls from "./PlayerControls.vue";
import What from "./PlayerMetas.vue";
import { usePlayer } from "./PlayerStore";
import SeekBar from "./SeekBar.vue";
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.meta {
  align-items: center;
  display: flex;

  // grid-template-columns: 1fr auto 1fr;
  justify-content: space-between;
  padding: 0.9rem 1.2rem 0.5rem;
}

.options {
  text-align: right;
}
</style>
