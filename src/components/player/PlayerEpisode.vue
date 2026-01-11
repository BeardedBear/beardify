<template>
  <div class="surface" @click.capture="onSurfaceClick">
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
  </div>
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

function onSurfaceClick(event: MouseEvent): void {
  if (!isTouchDevice()) return;

  const target = (event?.target as HTMLElement) || null;
  if (!target) return;

  const interactiveSelector
    = "button, a, input, textarea, select, .controls, .btns, .control-button, .area-device, .time, .progress-wrap, .progress, .seek, .bar";
  if (target.closest(interactiveSelector)) return;

  // Prevent the event from reaching target listeners (we are on capture phase)
  event.preventDefault();
  event.stopPropagation();

  playerStore.openPanel();
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.meta {
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  justify-content: space-between;
  padding: 0.9rem 1.2rem 0.5rem;
}

.surface {
  @include responsive.mobile {
    cursor: pointer;
  }
}
</style>
