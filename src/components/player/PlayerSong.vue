<template>
  <template v-if="usePlayer().playerState.track_window.current_track.id">
    <div class="meta" @click.stop="openSlideUp">
      <div class="area-metas"><What /></div>
      <div class="area-controls"><Controls /></div>
      <div class="area-device"><Device /></div>
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
import { isTouchDevice } from "@/helpers/isTouchDevice";

const playerStore = usePlayer();

function openSlideUp(): void {
  // Only open the slide-up on touch devices (mobile)
  if (!isTouchDevice()) return;

  playerStore.openPanel();
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.meta {
  align-items: center;
  display: grid;
  gap: 1rem;
  grid-template-areas: "metas controls device";
  grid-template-columns: 1fr auto 1fr;
  padding: 0.9rem 1.2rem 0.5rem;

  @include responsive.mobile {
    cursor: pointer; /* make it clear it's tappable on mobile */
    gap: 0.5rem;
    grid-template-areas: "controls metas device";
    grid-template-columns: auto 1fr auto;
    padding: 0.8rem;
  }
}

.area-metas {
  grid-area: metas;
  min-width: 0;
}

.area-controls {
  grid-area: controls;
}

.area-device {
  grid-area: device;
}

.options {
  text-align: right;
}
</style>
