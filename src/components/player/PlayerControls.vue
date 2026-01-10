<template>
  <div class="controls" :class="{ 'force-mobile': props.forceMobile }">
    <div class="btns">
      <ButtonIndex
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        no-default-class
        :class="{ active: playerStore.currentlyPlaying?.shuffle_state }"
        class="control-button shuffle"
        :size="props.forceMobile ? 'big' : 'default'"
        @click="playerStore.toggleShuffle()"
      >
        <i class="icon-shuffle" />
      </ButtonIndex>
      <ButtonIndex
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        no-default-class
        :class="{ active: playerStore.currentlyPlaying?.repeat_state !== 'off' }"
        class="control-button repeat"
        @click="playerStore.toggleRepeat()"
      >
        <i class="icon-repeat" />
      </ButtonIndex>
      <ButtonIndex
        v-if="playerStore.playerState?.paused"
        no-default-class
        class="control-button play"
        :size="props.forceMobile ? 'big' : 'default'"
        @click="playerStore.play()"
      >
        <i class="icon-play" />
      </ButtonIndex>
      <ButtonIndex
        v-else
        no-default-class
        class="control-button play"
        :size="props.forceMobile ? 'big' : 'default'"
        @click="playerStore.pause()"
      >
        <i class="icon-pause" />
      </ButtonIndex>
      <ButtonIndex
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        no-default-class
        class="control-button next"
        :size="props.forceMobile ? 'big' : 'default'"
        @click="playerStore.next()"
      >
        <i class="icon-skip-forward" />
      </ButtonIndex>
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

import { usePlayer } from "@/components/player/PlayerStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
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
  () => (currentTime.value = playerStore.playerState.position),
);
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as *;
@use "@/assets/scss/responsive" as responsive;

.btns {
  align-items: center;
  display: flex;
  gap: 0.8rem;
}

.time {
  font-size: var(--font-size-sm);
  font-variant: tabular-nums;

  @include font-bold;

  @include responsive.mobile {
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

  @include squircle;

  &.active {
    opacity: 1;
  }

  &:hover {
    background-color: var(--bg-color-light);
  }

  &:active {
    background-color: var(--bg-color-lighter);
  }

  &.button-big {
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

    &.button-big {
      font-size: var(--font-size-xl);
      padding: 0.6rem 0.7rem;
    }
  }

  &.repeat {
    @include responsive.mobile {
      display: none;
    }
  }

  &.shuffle {
    @include responsive.mobile {
      display: none;
    }
  }

  &.next {
    @include responsive.mobile {
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
