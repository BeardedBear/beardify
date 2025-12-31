<template>
  <template v-if="usePlayer().playerState.track_window.current_track.id">
    <div class="surface" @click.capture="onSurfaceClick">
      <div class="meta">
        <div class="area-metas"><What /></div>
        <div class="area-controls"><Controls /></div>
        <div class="area-device"><Device /></div>
      </div>
      <SeekBar />
    </div>
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

function onSurfaceClick(event: MouseEvent): void {
  // Only open the slide-up on touch devices (mobile)
  if (!isTouchDevice()) return;

  const target = (event?.target as HTMLElement) || null;
  if (!target) return;

  // Elements that should be allowed to handle the click themselves
  const interactiveSelector = 'button, a, input, textarea, select, .controls, .btns, .control-button, .area-device, .time, .progress-wrap, .progress, .seek, .bar';
  if (target.closest(interactiveSelector)) return;

  // We're in capture phase: prevent the click from reaching target handlers
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

.surface {
  @include responsive.mobile {
    cursor: pointer;
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
