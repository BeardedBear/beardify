<template>
  <div :style="{ padding: '0 1.2rem' }">
    <div ref="progressWrap" class="progress-wrap">
      <div class="progress">
        <div v-if="duration" class="bar" :style="`width:${(currentTime / duration) * 100}%`" />
        <div class="seek" :style="`width:${perc}%`">
          <div class="time">{{ time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, watch, defineProps } from "vue";
import { timecode } from "../../helpers/date";
import { usePlayer } from "./PlayerStore";
import { useIntervalFn, useMouseInElement } from "@vueuse/core";
import { syncOfficialSpotifyClient } from "../../helpers/getSpotifyPlayerState";

const progressWrap = ref<HTMLDivElement>();
const { elementX, elementWidth } = useMouseInElement(progressWrap);
const perc = ref<number | null | undefined>(0);
const time = ref<string>("");
const playerStore = usePlayer();
const currentTime = ref<number>(0);
const props = defineProps<{
  duration: number | null;
}>();

watchEffect(() => {
  progressWrap.value?.addEventListener("mousemove", () => {
    const positionInPercent = (elementX.value / elementWidth.value) * 100;
    perc.value = positionInPercent;
    const durationPerc = props.duration && (props.duration / 100) * positionInPercent;
    if (durationPerc) time.value = timecode(durationPerc);
  });

  progressWrap.value?.addEventListener("click", () => {
    const positionInPercent = (elementX.value / elementWidth.value) * 100;
    const durationPerc = props.duration && (props.duration / 100) * positionInPercent;
    if (durationPerc) playerStore.seek(durationPerc);
  });
});

useIntervalFn(() => {
  if (playerStore.currentlyPlaying.is_playing) currentTime.value = currentTime.value + 1000;
  props.duration && currentTime.value > props.duration && syncOfficialSpotifyClient();
}, 1000);

watch(
  () => playerStore.currentlyPlaying.progress_ms,
  () => (currentTime.value = playerStore.currentlyPlaying.progress_ms),
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
      border: 1px solid var(--primary-color-light);
      border-radius: 0.4rem;
      bottom: calc(100% + 0.4rem);
      color: color.change(white, $alpha: 0.8);
      font-size: 0.9rem;
      padding: 0.2rem 0.6rem;
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
    transition: all ease 0.2s;
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
