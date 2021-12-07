<template>
  <div ref="progresss" class="progress">
    <div
      v-if="playerStore.currentlyPlaying.item"
      class="bar"
      :style="`width:${(currentTime / playerStore.currentlyPlaying.item.duration_ms) * 100}%`"
    />
    <div class="seek" :style="`width:${perc}%`">
      <div class="time">{{ time }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect, watch } from "vue";
import { timecode } from "../../helpers/date";
import { usePlayer } from "./PlayerStore";
import { useIntervalFn } from "@vueuse/core";
import { syncOfficialSpotifyClient } from "../../helpers/getSpotifyPlayerState";

const progresss = ref();
const perc = ref();
const time = ref();
const playerStore = usePlayer();
const currentTime = ref<number>(0);

watchEffect(() => {
  progresss.value?.addEventListener("mousemove", (event: MouseEvent) => {
    const positionInPercent = (event.clientX / progresss.value?.clientWidth) * 100;
    const duration =
      playerStore.currentlyPlaying.item && (playerStore.currentlyPlaying.item.duration_ms / 100) * positionInPercent;
    perc.value = positionInPercent;
    if (duration) time.value = timecode(duration);
  });

  progresss.value?.addEventListener("click", (event: MouseEvent) => {
    const positionInPercent = (event.clientX / progresss.value?.clientWidth) * 100;
    const duration =
      playerStore.currentlyPlaying.item && (playerStore.currentlyPlaying.item.duration_ms / 100) * positionInPercent;
    if (duration) playerStore.seek(duration);
  });
});

useIntervalFn(() => {
  if (playerStore.currentlyPlaying.is_playing) currentTime.value = currentTime.value + 1000;
  if (playerStore.currentlyPlaying.item && currentTime.value > playerStore.currentlyPlaying.item.duration_ms) {
    syncOfficialSpotifyClient();
  }
}, 1000);

watch(
  () => playerStore.currentlyPlaying.progress_ms,
  () => {
    currentTime.value = playerStore.currentlyPlaying.progress_ms;
  },
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
