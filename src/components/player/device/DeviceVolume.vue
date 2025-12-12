<template>
  <div @click="onClick" @mousemove="onMove" @mouseleave="onLeave" class="volume" ref="refVolume">
    <div :style="{ width: playerStore.devices.activeDevice.volume_percent + '%' }" class="cursor" />
    <div :style="{ width: sliderPercent + '%' }" class="hover">
      <div class="perc">{{ previewVolume + "%" }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";

const refVolume = ref<HTMLDivElement | null>(null);
const sliderPercent = ref<number>(0); // 0..100 slider visual position
const previewVolume = computed<number>(() => sliderPercentToVolume(sliderPercent.value));
const playerStore = usePlayer();

const GAMMA = 2.2; // Curvature: slider -> perceived volume mapping (higher = more low-end range)

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function sliderPercentToVolume(p: number): number {
  const s = clamp(p) / 100;
  return Math.round(Math.pow(s, GAMMA) * 100);
}

function volumeToSliderPercent(v: number): number {
  const vol = clamp(v) / 100;
  return Math.round(Math.pow(vol, 1 / GAMMA) * 100);
}

// Ensure slider follows current device volume when device changes
onMounted(() => {
  sliderPercent.value = volumeToSliderPercent(playerStore.devices.activeDevice.volume_percent ?? 0);
});

// If volume changes externally, update the slider
watch(
  () => playerStore.devices.activeDevice.volume_percent,
  (val) => {
    sliderPercent.value = volumeToSliderPercent(val ?? 0);
  },
);

onUnmounted(() => {
  // nothing to cleanup (no global listeners)
});

function onMove(e: MouseEvent): void {
  const el = refVolume.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const pos = clamp(((e.clientX - rect.left) / rect.width) * 100);
  sliderPercent.value = Math.round(pos);
}

function onLeave(): void {
  // reset preview to current volume
  sliderPercent.value = volumeToSliderPercent(playerStore.devices.activeDevice.volume_percent ?? 0);
}

function onClick(): void {
  playerStore.setVolume(previewVolume.value);
}
</script>

<style lang="scss" scoped>
.volume {
  background-color: var(--bg-color-light);
  cursor: pointer;
  display: inline-block;
  font-size: 0.9rem;
  font-weight: bold;
  height: 1.7rem;
  position: relative;
  width: 6rem;

  &::before {
    background-color: var(--bg-color);
    clip-path: polygon(-10% -10%, 0 82%, 100% 0);
    content: "";
    inset: -0.1rem;
    position: absolute;
    z-index: 9;
  }

  .cursor {
    background-color: var(--primary-color);
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
  }

  .perc {
    pointer-events: none;
    position: absolute;
    right: 0;
    top: -1.2rem;
    transform: translateX(50%);
    z-index: 999;
  }

  .hover {
    background-color: var(--primary-color-lighter);
    bottom: 0;
    display: none;
    left: 0;
    opacity: 0.5;
    position: absolute;
    top: 0;
  }

  &:hover {
    .hover {
      display: block;
    }
  }
}
</style>
