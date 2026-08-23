<template>
  <div class="controls" :class="{ 'force-mobile': props.forceMobile }">
    <div class="btns">
      <button
v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        type="button"
        :class="{ active: playerStore.currentlyPlaying?.shuffle_state, big: props.forceMobile }"
        class="control-button shuffle squircle"
        @click="playerStore.toggleShuffle()"
      >
        <i class="icon-shuffle" />
      </button>
      <button
v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        type="button"
        :class="{ active: playerStore.currentlyPlaying?.repeat_state !== 'off' }"
        class="control-button repeat squircle"
        @click="playerStore.toggleRepeat()"
      >
        <i class="icon-repeat" />
      </button>
      <button
v-if="playerStore.playerState?.paused"
        type="button"
        class="control-button play squircle"
        :class="{ big: props.forceMobile }"
        @click="playerStore.play()"
      >
        <i class="icon-play" />
      </button>
      <button
v-else
        type="button"
        class="control-button play squircle"
        :class="{ big: props.forceMobile }"
        @click="playerStore.pause()"
      >
        <i class="icon-pause" />
      </button>
      <button
v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        type="button"
        class="control-button next squircle"
        :class="{ big: props.forceMobile }"
        @click="playerStore.next()"
      >
        <i class="icon-skip-forward" />
      </button>
    </div>
    <div class="time font-bold">
      {{ timecode(currentTime) || "00:00" }} /
      {{ timecode(duration) || "00:00" }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useIntervalFn } from "@vueuse/core";
import { computed, ref, watch } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";
import { timecode } from "@/helpers/date";

const props = defineProps<{ forceMobile?: boolean }>();
const playerStore = usePlayer();
const currentTime = ref<number>(0);
const duration = computed(() => playerStore.playerState?.duration);

useIntervalFn(() => {
  if (!playerStore.playerState) return;
  if (!playerStore.playerState.paused) currentTime.value = currentTime.value + 1000;
}, 1000);

watch(
  () => playerStore.playerState.position,
  (newPos) => {
    if (Math.abs(newPos - currentTime.value) > 1500) currentTime.value = newPos;
  },
);
</script>

<style scoped>

.btns {
  align-items: center;
  display: flex;
  gap: 0.8rem;
}

.time {
  font-size: var(--font-size-sm);
  font-variant: tabular-nums;

  @media (--mobile) {
    display: none;
  }
}

.controls {
  align-items: center;
  display: flex;
  flex: 1;
  gap: 1.2rem;
  justify-content: center;
}

.control-button {
  background-color: transparent;
  border: none;
  border-radius: 1rem;
  color: currentcolor;
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 0;
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

  &.big {
    font-size: var(--font-size-xl);
    padding: 0.5rem 0.6rem;
  }

  &.play {
    font-size: var(--font-size-xl);
    opacity: 1;

    &:hover {
      background-color: var(--bg-color-light);
    }

    &:active {
      background-color: var(--bg-color-lighter);
    }

    &.big {
      font-size: var(--font-size-xl);
      padding: 0.6rem 0.7rem;
    }
  }

  &.repeat {
    @media (--mobile) {
      display: none;
    }
  }

  &.shuffle {
    @media (--mobile) {
      display: none;
    }
  }

  &.next {
    @media (--mobile) {
      display: none;
    }
  }

  /* Force show on mobile when parent adds .force-mobile */
  .force-mobile &.repeat {
    display: inline-flex;
  }

  .force-mobile &.shuffle {
    display: inline-flex;
  }

  .force-mobile &.next {
    display: inline-flex;
  }
}
</style>
