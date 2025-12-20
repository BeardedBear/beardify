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
import Device from "@/components/player/device/DeviceIndex.vue";
import Controls from "@/components/player/PlayerControls.vue";
import What from "@/components/player/PlayerMetas.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import SeekBar from "@/components/player/SeekBar.vue";
import Loader from "@/components/ui/LoadingDots.vue";
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.meta {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 0.9rem 1.2rem 0.5rem;

  @include responsive.mobile {
    align-items: stretch;
    flex-direction: column;
    gap: 1rem;
    padding: 0.8rem;
  }
}

.options {
  text-align: right;
}
</style>
