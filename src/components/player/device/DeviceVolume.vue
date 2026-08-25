<template>
  <div :class="['volume-wrapper', { 'force-visible': forceMobile }]">
    <div ref="refVolume" class="volume font-bold" @mouseleave="onLeave" @mousemove="onMove">
      <div :style="{ width: currentSliderPercent + '%' }" class="cursor" />
      <div :style="{ width: sliderPercent + '%' }" class="hover">
        <div class="perc">
          {{ previewVolume + "%" }}
        </div>
      </div>
      <!--
        The wedge above is painted by divs and a clip-path, so the control that
        actually handles input is a real range sitting invisibly on top of it.
        That buys arrow keys, Home/End, drag, and a correct announced value from
        the platform, none of which the old click-on-a-div version had.
      -->
      <input
        :value="sliderPercent"
        :aria-valuetext="`${previewVolume}%`"
        aria-label="Volume"
        class="range"
        max="100"
        min="0"
        step="1"
        type="range"
        @change="onCommit"
        @input="onScrub"
      />
    </div>
    <IconButton
      v-if="!forceMobile"
      class="mute"
      :icon="isMuted ? 'volume-x' : 'volume-2'"
      :label="isMuted ? 'Unmute' : 'Mute'"
      :pressed="isMuted"
      @click="toggleMute"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";

import { NotificationType } from "@/@types/Notification";
import { usePlayer } from "@/components/player/PlayerStore";
import IconButton from "@/components/ui/IconButton.vue";
import { notification } from "@/helpers/notifications";
import { clamp, sliderPercentToVolume, volumeToSliderPercent } from "@/helpers/volume";

defineProps<{ forceMobile?: boolean }>();

const refVolume = ref<HTMLDivElement | null>(null);
const sliderPercent = ref<number>(0); // 0..100 slider visual position
const previewVolume = computed<number>(() => sliderPercentToVolume(sliderPercent.value));
const currentSliderPercent = computed<number>(() =>
  volumeToSliderPercent(playerStore.devices.activeDevice.volume_percent ?? 0),
);
const playerStore = usePlayer();
const previousVolume = ref<null | number>(null);
const oldDeviceVolume = ref<null | number>(null);
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

// The request goes out once the value settles, so a drag across the bar is one
// call to Spotify instead of one per pixel.
async function onCommit(e: Event): Promise<void> {
  sliderPercent.value = Number((e.target as HTMLInputElement).value);
  await setVolumeOptimistic(previewVolume.value);
}

function onLeave(): void {
  // reset preview to current volume
  sliderPercent.value = volumeToSliderPercent(currentDeviceVolume.value);
}

function onMove(e: MouseEvent): void {
  const el = refVolume.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const pos = clamp(((e.clientX - rect.left) / rect.width) * 100);
  sliderPercent.value = Math.round(pos);
}

// Dragging and arrow keys meanwhile only move the painted wedge.
function onScrub(e: Event): void {
  sliderPercent.value = Number((e.target as HTMLInputElement).value);
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
    if (import.meta.env.DEV) console.error("Failed to set volume:", err);
    // revert UI on failure
    if (oldDeviceVolume.value !== null) {
      playerStore.devices.activeDevice.volume_percent = oldDeviceVolume.value;
    }
    notification({ msg: "Failed to set volume", type: NotificationType.Error });
  } finally {
    oldDeviceVolume.value = null;
  }
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
    if (import.meta.env.DEV) console.error("Failed to toggle mute:", err);
    // revert on failure
    if (oldDeviceVolume.value !== null) {
      playerStore.devices.activeDevice.volume_percent = oldDeviceVolume.value;
    }
    notification({ msg: "Failed to set volume", type: NotificationType.Error });
  } finally {
    oldDeviceVolume.value = null;
  }
}
</script>

<style scoped>

.mute {
  background-color: transparent;
  border: 0;
  color: var(--font-color);
  cursor: pointer;
  opacity: 0.5;
  padding: 0.5rem 0.6rem;

  &:hover {
    opacity: 1;
  }
}

.volume-wrapper {
  align-items: center;
  display: flex;
  gap: 1rem;

  @media (--mobile) {
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
  font-size: var(--font-size-sm);
  height: 1.7rem;
  position: relative;
  width: 6rem;

  @media (--mobile) {
    width: 10rem;
  }

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

  .range {
    appearance: none;
    background: transparent;
    cursor: pointer;
    height: 100%;
    inset: 0;
    margin: 0;
    opacity: 0;
    position: absolute;
    width: 100%;
    z-index: 10;
  }

  &:hover {
    .hover {
      opacity: 0.7;
    }
  }

  /*
   * The range itself is transparent, so its focus ring would be too. Draw it on
   * the wedge instead — otherwise tabbing to the volume lands on nothing
   * visible.
   */
  &:has(.range:focus-visible) {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;

    .hover {
      opacity: 0.7;
    }
  }
}
</style>
