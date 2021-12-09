<template>
  <div ref="refProgress" class="progress">
    <div v-if="currentTime && duration" class="bar" :style="`width:${(currentTime / duration) * 100}%`" />
    <div class="seek" :style="`width:${perc}%`">
      <div class="time">{{ time }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, watch, defineProps } from "vue";
import { timecode } from "../../helpers/date";
import { usePlayer } from "./PlayerStore";
import { useIntervalFn } from "@vueuse/core";
import { syncOfficialSpotifyClient } from "../../helpers/getSpotifyPlayerState";

const refProgress = ref();
const perc = ref();
const time = ref();
const playerStore = usePlayer();
const currentTime = ref<number>(0);

const props = defineProps<{
  duration: number | undefined;
}>();

watchEffect(() => {
  refProgress.value?.addEventListener("mousemove", (event: MouseEvent) => {
    const positionInPercent = (event.clientX / refProgress.value?.clientWidth) * 100;
    const durationPerc = props.duration && (props.duration / 100) * positionInPercent;
    perc.value = positionInPercent;
    if (durationPerc) time.value = timecode(durationPerc);
  });

  refProgress.value?.addEventListener("click", (event: MouseEvent) => {
    const positionInPercent = (event.clientX / refProgress.value?.clientWidth) * 100;
    const durationPerc = props.duration && (props.duration / 100) * positionInPercent;
    if (durationPerc) playerStore.seek(durationPerc);
  });
});

useIntervalFn(() => {
  if (playerStore.currentlyPlaying.is_playing) currentTime.value = currentTime.value + 1000;
  if (props.duration && currentTime.value > props.duration) {
    syncOfficialSpotifyClient();
  }
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
  cursor: pointer;
  flex: 1;
  height: 0.4rem;
  position: relative;

  .seek {
    animation: pop-seek 0.5s ease 0s both;
    background-color: color.change(white, $alpha: 0.2);
    bottom: 0;
    display: none;
    left: 0;
    opacity: 0.5;
    position: absolute;
    top: 0;

    .time {
      background: var(--primary-color);
      border: 1px solid var(--primary-color-light);
      border-radius: 0.4rem;
      bottom: calc(100% + 0.4rem);
      color: color.change(white, $alpha: 0.8);
      padding: 0.4rem 0.8rem;
      pointer-events: none;
      position: absolute;
      right: 0;
      transform: translateX(50%);
    }
  }

  .bar {
    background: var(--primary-color);
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    transition: all ease 0.2s;
  }

  &:hover {
    .seek {
      display: block;
    }
  }
}
</style>
