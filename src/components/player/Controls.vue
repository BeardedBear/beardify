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
      <button v-if="!playerStore.currentlyPlaying.is_playing" class="controls__btn play" @click="playerStore.play()">
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
    <div v-if="progress && duration" class="time">{{ timecode(currentTime) }} / {{ timecode(duration) }}</div>
    <div v-else class="time">0:00 / 0:00</div>
  </div>
</template>

<script lang="ts" setup>
import { timecode } from "../../helpers/Date";
import { usePlayer } from "./PlayerStore";
import { ref, watch, defineProps } from "vue";
import { useIntervalFn } from "@vueuse/core";

const props = defineProps<{
  progress: number;
  duration: number | null;
}>();

const playerStore = usePlayer();
const currentTime = ref<number>(0);

useIntervalFn(() => {
  if (playerStore.currentlyPlaying.is_playing) currentTime.value = currentTime.value + 1000;
}, 1000);

watch(
  () => props.progress,
  () => (currentTime.value = props.progress),
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
  width: 7.5rem;
}

.controls {
  align-items: center;
  display: flex;
  gap: 1.2rem;

  &__btn {
    background-color: transparent;
    border: none;
    border-radius: 0.4rem;
    color: currentColor;
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
