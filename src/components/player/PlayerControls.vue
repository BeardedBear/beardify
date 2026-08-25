<template>
  <div class="controls" :class="{ 'force-mobile': props.forceMobile }">
    <div class="btns">
      <IconButton
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        :class="{ active: playerStore.currentlyPlaying?.shuffle_state, big: props.forceMobile }"
        :pressed="!!playerStore.currentlyPlaying?.shuffle_state"
        class="control-button shuffle squircle"
        icon="shuffle"
        label="Shuffle"
        @click="playerStore.toggleShuffle()"
      />
      <IconButton
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        :class="{ active: playerStore.currentlyPlaying?.repeat_state !== 'off' }"
        :pressed="playerStore.currentlyPlaying?.repeat_state !== 'off'"
        class="control-button repeat squircle"
        icon="repeat"
        label="Repeat"
        @click="playerStore.toggleRepeat()"
      />
      <IconButton
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        :class="{ big: props.forceMobile }"
        class="control-button previous squircle"
        icon="skip-back"
        label="Previous track"
        @click="playerStore.previous()"
      />
      <IconButton
        v-if="playerStore.playerState?.paused"
        :class="{ big: props.forceMobile }"
        class="control-button play squircle"
        icon="play"
        label="Play"
        @click="playerStore.play()"
      />
      <IconButton
        v-else
        :class="{ big: props.forceMobile }"
        class="control-button play squircle"
        icon="pause"
        label="Pause"
        @click="playerStore.pause()"
      />
      <IconButton
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        :class="{ big: props.forceMobile }"
        class="control-button next squircle"
        icon="skip-forward"
        label="Next track"
        @click="playerStore.next()"
      />
    </div>
    <div class="time font-bold">
      {{ timecode(currentTime) || "00:00" }} /
      {{ timecode(duration) || "00:00" }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";
import IconButton from "@/components/ui/IconButton.vue";
import { usePlaybackClock } from "@/composables/usePlaybackClock";
import { timecode } from "@/helpers/date";

const props = defineProps<{ forceMobile?: boolean }>();
const playerStore = usePlayer();
/*
 * Shared with the seek bar. These two used to count on their own — 1s here,
 * 200ms there — so the number could sit up to 1.5s away from the bar it
 * describes, and a keyboard scrub moved the bar while the number stood still.
 */
const { position: currentTime } = usePlaybackClock();
const duration = computed(() => playerStore.playerState?.duration);
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

  &.next,
  &.previous {
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

  .force-mobile &.next,
  .force-mobile &.previous {
    display: inline-flex;
  }
}
</style>
