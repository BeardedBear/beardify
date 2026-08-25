<template>
  <div class="seek-bar">
    <div ref="progressWrap" class="progress-wrap">
      <div class="progress">
        <div v-if="playerStore.playerState" :style="{ transform: `scaleX(${playedRatio})` }" class="bar" />
        <div :style="`width:${perc}%`" class="seek">
          <div class="time font-bold">
            {{ time }}
          </div>
        </div>
      </div>
      <!--
        Same trick as the volume wedge: the bar is painted, the range handles
        input. It replaces a mouse-only click listener on a div, so the position
        is now reachable with arrow keys and by touch — including on the phone,
        where seeking used to be switched off entirely.
      -->
      <input
        :value="currentTime"
        :aria-valuetext="`${timecode(currentTime)} of ${timecode(playerStore.playerState?.duration)}`"
        :max="playerStore.playerState?.duration || 0"
        aria-label="Seek"
        class="range"
        min="0"
        step="1000"
        type="range"
        @change="onCommit"
        @input="onScrub"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useIntervalFn, useMouseInElement } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";
import { timecode } from "@/helpers/date";

const progressWrap = ref<HTMLDivElement>();

const { elementWidth, elementX } = useMouseInElement(progressWrap);
const perc = ref<number>(0);
const time = ref<string>("");
const playerStore = usePlayer();
const currentTime = ref<number>(0);

// Scrubbing only moves the painted bar; the seek request goes out on release.
const onScrub = (e: Event): void => {
  currentTime.value = Number((e.target as HTMLInputElement).value);
};

const onCommit = (e: Event): void => {
  const target = Number((e.target as HTMLInputElement).value);
  currentTime.value = target;
  playerStore.seek(target);
};

// The hover read-out stays mouse-only by design: it previews a position you
// have not committed to, which only means something with a pointer.
const handleMouseMove = (): void => {
  perc.value = (elementX.value / elementWidth.value) * 100;
  const durationPerc = playerStore.playerState?.duration && (playerStore.playerState?.duration / 100) * perc.value;
  if (durationPerc) time.value = timecode(durationPerc);
};

onMounted(() => progressWrap.value?.addEventListener("mousemove", handleMouseMove));
onUnmounted(() => progressWrap.value?.removeEventListener("mousemove", handleMouseMove));

const playedRatio = computed(() => {
  const duration = playerStore.playerState?.duration;
  return duration ? Math.min(currentTime.value / duration, 1) : 0;
});

const freq = 200;
useIntervalFn(() => {
  if (!playerStore.playerState) return;
  // ponytail: clamp so a stale "playing" state can't run the timer past the track length
  if (!playerStore.playerState.paused) {
    currentTime.value = Math.min(currentTime.value + freq, playerStore.playerState.duration);
  }
}, freq);

watch(
  () => playerStore.playerState.position,
  (newPosition) => {
    if (Math.abs(newPosition - currentTime.value) > 1500) currentTime.value = newPosition;
  },
);
</script>

<style scoped>

@keyframes pop-seek {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.seek-bar {
  padding: 0 1.2rem;

  @media (--mobile) {
    padding: 0 0.8rem;
  }
}

.progress {
  background: var(--bg-color-light);
  border-radius: 1rem;
  flex: 1;
  height: 0.2rem;
  position: relative;

  .seek {
    animation: pop-seek 0.5s ease 0s both;
    background-color: var(--bg-color-lighter);
    border-radius: 1rem;
    bottom: 0;
    display: none;
    left: 0;
    opacity: 0.5;
    pointer-events: none;
    position: absolute;
    top: 0;

    .time {
      background: var(--primary-color);
      border-radius: 0.3rem;
      bottom: calc(100% + 0.4rem);
      color: var(--font-color-light);
      font-size: var(--font-size-sm);
      padding: 0.1rem 0.4rem;
      pointer-events: none;
      position: absolute;
      right: 0;
      transform: translateX(50%);
    }
  }

  /*
   * scaleX, not a width transition. The position ticks every 200ms and the old
   * version re-ran a layout pass each time — for the whole length of every
   * track, on a component that is always on screen. A transform is composited
   * instead, so the same movement costs no layout at all.
   */
  .bar {
    background: var(--primary-color);
    border-radius: 1rem;
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    transform-origin: left center;
    transition: transform linear 0.2s;
    width: 100%;
  }
}

.progress-wrap {
  padding: 0.3rem 0 0.8rem;
  position: relative;

  &:hover {
    .seek {
      display: block;
    }
  }

  /* The rail is 0.2rem tall; the target you can actually hit is the whole row. */
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
    z-index: 2;
  }

  &:has(.range:focus-visible) {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  @media (pointer: coarse) {
    padding: 0.9rem 0 1.4rem;
  }
}
</style>
