<template>
  <div class="controls">
    <div class="btns">
      <button
        :class="{ active: playerStore.currentlyPlaying?.shuffle_state }"
        @click="playerStore.toggleShuffle()"
        class="controls__btn"
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
      >
        <i class="icon-shuffle" />
      </button>
      <button
        :class="{ active: playerStore.currentlyPlaying?.repeat_state !== 'off' }"
        @click="playerStore.toggleRepeat()"
        class="controls__btn"
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
      >
        <i class="icon-repeat" />
      </button>
      <button @click="playerStore.play()" class="controls__btn play" v-if="playerStore.playerState?.paused">
        <i class="icon-play" />
      </button>
      <button @click="playerStore.pause()" class="controls__btn play" v-else>
        <i class="icon-pause" />
      </button>
      <button
        @click="playerStore.next()"
        class="controls__btn"
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
      >
        <i class="icon-skip-forward" />
      </button>
    </div>
    <div class="time">
      {{ timecode(currentTime) || "00:00" }} /
      {{ timecode(duration) || "00:00" }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useIntervalFn } from "@vueuse/core";
import { computed, ref, watch } from "vue";

import { timecode } from "../../helpers/date";
import { usePlayer } from "./PlayerStore";

const playerStore = usePlayer();
const currentTime = ref<number>(0);
const duration = computed(() => playerStore.playerState?.duration);

useIntervalFn(() => {
  if (!playerStore.playerState) return;
  if (!playerStore.playerState.paused) currentTime.value = currentTime.value + 1000;
}, 1000);

watch(
  () => playerStore.playerState.position,
  () => (currentTime.value = playerStore.playerState.position),
);
</script>

<style lang="scss" scoped>
@use "../../assets/scss/colors" as colors;

.btns {
  align-items: center;
  display: flex;
  gap: 0.8rem;
}

.time {
  font-size: 0.9rem;
  font-weight: bold;
}

.controls {
  align-items: center;
  display: flex;
  flex: 1;
  gap: 1.2rem;
  justify-content: center;

  &__btn {
    background-color: transparent;
    border: none;
    border-radius: 0.4rem;
    color: currentcolor;
    cursor: pointer;
    font-size: 1.3rem;
    opacity: 0.5;
    padding: 0.4rem 0.5rem;

    &.active {
      opacity: 1;
    }

    &:hover {
      background-color: var(--bg-color-light);
    }

    &:active {
      background-color: var(--bg-color-lighter);
    }

    &.play {
      font-size: 2rem;
      opacity: 1;

      &:hover {
        background-color: var(--bg-color-light);
      }

      &:active {
        background-color: var(--bg-color-lighter);
      }
    }
  }
}
</style>
