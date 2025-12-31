<template>
  <div :class="['volume-wrapper', { 'force-visible': forceMobile }]">
    <div @click="onClick" @mousemove="onMove" @mouseleave="onLeave" class="volume" ref="refVolume">
      <div :style="{ width: currentSliderPercent + '%' }" class="cursor" />
      <div :style="{ width: sliderPercent + '%' }" class="hover">
        <div class="perc">{{ previewVolume + "%" }}</div>
      </div>
    </div>
    <ButtonIndex no-default-class type="button" variant="nude" @click="toggleMute">
      <i :class="isMuted ? 'icon-volume-x' : 'icon-volume-2'" />
    </ButtonIndex>
  </div>
</template>

<script lang="ts" setup>
import { NotificationType } from "@/@types/Notification";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { notification } from "@/helpers/notifications";
import { clamp, sliderPercentToVolume, volumeToSliderPercent } from "@/helpers/volume";
import { computed, defineProps, onMounted, ref, watch } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";

const props = defineProps<{ forceMobile?: boolean }>();

const refVolume = ref<HTMLDivElement | null>(null);
const sliderPercent = ref<number>(0); // 0..100 slider visual position
const previewVolume = computed<number>(() => sliderPercentToVolume(sliderPercent.value));
const currentSliderPercent = computed<number>(() =>
  volumeToSliderPercent(playerStore.devices.activeDevice.volume_percent ?? 0),
);
const playerStore = usePlayer();
const previousVolume = ref<number | null>(null);
const oldDeviceVolume = ref<number | null>(null);
const currentDeviceVolume = computed(() => playerStore.devices.activeDevice.volume_percent ?? 0);
const isMuted = computed(() => playerStore.devices.activeDevice.volume_percent === 0);

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

function onMove(e: MouseEvent): void {
  const el = refVolume.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const pos = clamp(((e.clientX - rect.left) / rect.width) * 100);
  sliderPercent.value = Math.round(pos);
}

function getPercentFromEvent(e: MouseEvent | undefined): number | null {
  const el = refVolume.value;
  if (!e || !el) return null;
  const rect = el.getBoundingClientRect();
  const pos = clamp(((e.clientX - rect.left) / rect.width) * 100);
  return Math.round(pos);
}

function onLeave(): void {
  // reset preview to current volume
  sliderPercent.value = volumeToSliderPercent(currentDeviceVolume.value);
}

async function onClick(e?: MouseEvent): Promise<void> {
  const pos = getPercentFromEvent(e);
  if (pos !== null) {
    sliderPercent.value = pos;
  }
  await setVolumeOptimistic(previewVolume.value);
}

async function toggleMute(): Promise<void> {
  const current = playerStore.devices.activeDevice.volume_percent ?? 0;
  try {
    if (current === 0) {
      // unmute
      const to = previousVolume.value ?? 50;
      previousVolume.value = null;
      await setVolumeOptimistic(to);
    } else {
      // mute
      previousVolume.value = current;
      await setVolumeOptimistic(0);
    }
  } catch (err: any) {
    console.error("Failed to toggle mute:", err);
    // revert on failure
    if (oldDeviceVolume.value !== null) {
      playerStore.devices.activeDevice.volume_percent = oldDeviceVolume.value;
    }
    notification({ msg: "Failed to set volume", type: NotificationType.Error });
  } finally {
    oldDeviceVolume.value = null;
  }
}

/**
 * Set device volume with optimistic UI update and error revert.
 */
async function setVolumeOptimistic(volume: number): Promise<void> {
  oldDeviceVolume.value = currentDeviceVolume.value ?? 0;
  playerStore.devices.activeDevice.volume_percent = volume; // optimistic
  try {
    await playerStore.setVolume(volume);
  } catch (err: any) {
    console.error("Failed to set volume:", err);
    // revert UI on failure
    if (oldDeviceVolume.value !== null) {
      playerStore.devices.activeDevice.volume_percent = oldDeviceVolume.value;
    }
    notification({ msg: "Failed to set volume", type: NotificationType.Error });
  } finally {
    oldDeviceVolume.value = null;
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;

.volume-wrapper {
  align-items: center;
  display: flex;
  gap: 1rem;

  @include responsive.mobile {
    display: none;

    &.force-visible {
      display: flex;
    }
  }
}

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
    background-color: var(--primary-color-light);
    bottom: 0;
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
  }

  &:hover {
    .hover {
      opacity: 0.7;
    }
  }
}
</style>
