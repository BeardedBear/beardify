<template>
  <div :style="{ padding: '0 1.2rem' }">
    <div ref="progressWrap" class="progress-wrap">
      <div class="progress">
        <div
          v-if="playerStore.playerState"
          class="bar"
          :style="`width:${(currentTime / playerStore.playerState.duration) * 100}%`"
        />
        <div class="seek" :style="`width:${perc}%`">
          <div class="time">{{ time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useIntervalFn, useMouseInElement } from "@vueuse/core";
import { ref, watch, watchEffect } from "vue";
import { timecode } from "../../helpers/date";
import { usePlayer } from "./PlayerStore";

const progressWrap = ref<HTMLDivElement>();
const { elementX, elementWidth } = useMouseInElement(progressWrap);
const perc = ref<number>(0);
const time = ref<string>("");
const playerStore = usePlayer();
const currentTime = ref<number>(0);

watchEffect(() => {
  progressWrap.value?.addEventListener("mousemove", () => {
    perc.value = (elementX.value / elementWidth.value) * 100;
    const durationPerc = playerStore.playerState?.duration && (playerStore.playerState?.duration / 100) * perc.value;
    if (durationPerc) time.value = timecode(durationPerc);
  });

  progressWrap.value?.addEventListener("click", () => {
    const durationPerc = playerStore.playerState?.duration && (playerStore.playerState?.duration / 100) * perc.value;
    if (durationPerc) playerStore.seek(durationPerc);
  });
});

const freq = 200;
useIntervalFn(() => {
  if (!playerStore.playerState) return;
  if (!playerStore.playerState.paused) currentTime.value = currentTime.value + freq;
}, freq);

// TODO: optimize this, ERK
watch(
  () => playerStore.playerState,
  () => (currentTime.value = playerStore.playerState.position),
);

watch(
  () => playerStore.playerState.position,
  () => (currentTime.value = playerStore.playerState.position),
);
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

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
