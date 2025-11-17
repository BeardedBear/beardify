<template>
  <div :style="{ padding: '0 1.2rem' }">
    <div class="progress-wrap" ref="progressWrap">
      <div class="progress">
        <div
          :style="`width:${(currentTime / playerStore.playerState.duration) * 100}%`"
          class="bar"
          v-if="playerStore.playerState"
        />
        <div :style="`width:${perc}%`" class="seek">
          <div class="time">{{ time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useIntervalFn, useMouseInElement } from "@vueuse/core";
import { onMounted, onUnmounted, ref, watch } from "vue";

import { timecode } from "../../helpers/date";
import { usePlayer } from "./PlayerStore";

const progressWrap = ref<HTMLDivElement>();
const { elementWidth, elementX } = useMouseInElement(progressWrap);
const perc = ref<number>(0);
const time = ref<string>("");
const playerStore = usePlayer();
const currentTime = ref<number>(0);

const handleMouseMove = (): void => {
  perc.value = (elementX.value / elementWidth.value) * 100;
  const durationPerc = playerStore.playerState?.duration && (playerStore.playerState?.duration / 100) * perc.value;
  if (durationPerc) time.value = timecode(durationPerc);
};

const handleClick = (): void => {
  const durationPerc = playerStore.playerState?.duration && (playerStore.playerState?.duration / 100) * perc.value;
  if (durationPerc) playerStore.seek(durationPerc);
};

onMounted(() => {
  progressWrap.value?.addEventListener("mousemove", handleMouseMove);
  progressWrap.value?.addEventListener("click", handleClick);
});

onUnmounted(() => {
  progressWrap.value?.removeEventListener("mousemove", handleMouseMove);
  progressWrap.value?.removeEventListener("click", handleClick);
});

const freq = 200;
useIntervalFn(() => {
  if (!playerStore.playerState) return;
  if (!playerStore.playerState.paused) currentTime.value = currentTime.value + freq;
}, freq);

// Optimized: single watch on position instead of duplicate watchers
watch(
  () => playerStore.playerState.position,
  (newPosition) => (currentTime.value = newPosition),
);
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/scss/colors" as colors;

@keyframes pop-seek {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
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
    background-color: color.change(white, $alpha: 0.2);
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
      color: color.change(white, $alpha: 0.8);
      font-size: 0.9rem;
      font-weight: bold;
      padding: 0.1rem 0.4rem;
      pointer-events: none;
      position: absolute;
      right: 0;
      transform: translateX(50%);
    }
  }

  .bar {
    background: var(--primary-color);
    border-radius: 1rem;
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
  }
}

.progress-wrap {
  padding: 0.3rem 0 0.8rem;

  &:hover {
    .seek {
      display: block;
    }
  }
}
</style>
