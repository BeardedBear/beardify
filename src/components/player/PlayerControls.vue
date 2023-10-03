<template>
  <div class="controls">
    <div class="btns">
      <button
        v-if="playerStore.currentlyPlaying.currently_playing_type !== 'episode'"
        class="controls__btn"
        :class="{ active: playerStore.currentlyPlaying.shuffle_state }"
        @click="playerStore.toggleShuffle()"
      >
        <i class="icon-shuffle" />
      </button>
      <button
        v-if="playerStore.currentlyPlaying.currently_playing_type !== 'episode'"
        class="controls__btn"
        :class="{ active: playerStore.currentlyPlaying.repeat_state !== 'off' }"
        @click="playerStore.toggleRepeat()"
      >
        <i class="icon-repeat" />
      </button>
      <button v-if="playerStore.playerState?.paused" class="controls__btn play" @click="playerStore.play()">
        <i class="icon-play" />
      </button>
      <button v-else class="controls__btn play" @click="playerStore.pause()">
        <i class="icon-pause" />
      </button>
      <button
        v-if="playerStore.currentlyPlaying.currently_playing_type !== 'episode'"
        class="controls__btn"
        @click="playerStore.next()"
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
  () => playerStore.playerState,
  () => playerStore.playerState && (currentTime.value = playerStore.playerState?.position),
);
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

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
  gap: 1.2rem;

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
