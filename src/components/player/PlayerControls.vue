<template>
  <div class="controls" :class="{ 'force-mobile': props.forceMobile }">
    <div class="btns">
      <ButtonIndex
        no-default-class
        :class="{ active: playerStore.currentlyPlaying?.shuffle_state }"
        class="control-button shuffle"
        :size="props.forceMobile ? 'big' : 'default'"
        @click="playerStore.toggleShuffle()"
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
      >
        <i class="icon-shuffle" />
      </ButtonIndex>
      <ButtonIndex
        no-default-class
        :class="{ active: playerStore.currentlyPlaying?.repeat_state !== 'off' }"
        class="control-button repeat"
        @click="playerStore.toggleRepeat()"
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
      >
        <i class="icon-repeat" />
      </ButtonIndex>
      <ButtonIndex
        no-default-class
        class="control-button play"
        :size="props.forceMobile ? 'big' : 'default'"
        @click="playerStore.play()"
        v-if="playerStore.playerState?.paused"
      >
        <i class="icon-play" />
      </ButtonIndex>
      <ButtonIndex
        no-default-class
        class="control-button play"
        @click="playerStore.pause()"
        v-else
        :size="props.forceMobile ? 'big' : 'default'"
      >
        <i class="icon-pause" />
      </ButtonIndex>
      <ButtonIndex
        no-default-class
        class="control-button next"
        @click="playerStore.next()"
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        :size="props.forceMobile ? 'big' : 'default'"
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
  font-size: 0.9rem;

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
  font-size: 1.3rem;
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
    font-size: 1.5rem;
    padding: 0.5rem 0.6rem;
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

    &.button-big {
      font-size: 2.5rem;
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
