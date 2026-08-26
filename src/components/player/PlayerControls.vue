<template>
  <div class="controls" :class="{ 'force-mobile': props.forceMobile }">
    <div class="btns">
      <IconButton
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        :class="{ active: playerStore.currentlyPlaying?.shuffle_state, big: props.forceMobile }"
        :pressed="!!playerStore.currentlyPlaying?.shuffle_state"
        class="control-button shuffle bd-squircle"
        icon="shuffle"
        label="Shuffle"
        @click="playerStore.toggleShuffle()"
      />
      <IconButton
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        :class="{ active: playerStore.currentlyPlaying?.repeat_state !== 'off' }"
        :pressed="playerStore.currentlyPlaying?.repeat_state !== 'off'"
        class="control-button repeat bd-squircle"
        icon="repeat"
        label="Repeat"
        @click="playerStore.toggleRepeat()"
      />
      <IconButton
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        :class="{ big: props.forceMobile }"
        class="control-button previous bd-squircle"
        icon="skip-back"
        label="Previous track"
        @click="playerStore.previous()"
      />
      <IconButton
        v-if="playerStore.playerState?.paused"
        :class="{ big: props.forceMobile }"
        class="control-button play bd-squircle"
        icon="play"
        label="Play"
        @click="playerStore.play()"
      />
      <IconButton
        v-else
        :class="{ big: props.forceMobile }"
        class="control-button play bd-squircle"
        icon="pause"
        label="Pause"
        @click="playerStore.pause()"
      />
      <IconButton
        v-if="playerStore.currentlyPlaying?.currently_playing_type !== 'episode'"
        :class="{ big: props.forceMobile }"
        class="control-button next bd-squircle"
        icon="skip-forward"
        label="Next track"
        @click="playerStore.next()"
      />
    </div>
    <div class="time bd-font-bold">
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
  gap: var(--bd-space-3);
}

.time {
  font-size: var(--bd-font-size-sm);
  font-variant-numeric: tabular-nums;

  @media (--mobile) {
    display: none;
  }
}

.controls {
  align-items: center;
  display: flex;
  flex: 1;
  gap: var(--bd-space-4);
  justify-content: center;
}

.control-button {
  background-color: transparent;
  border: none;
  border-radius: var(--bd-radius-lg);
  color: currentcolor;
  cursor: pointer;
  font-size: var(--bd-font-size-lg);
  line-height: 0;
  opacity: 0.5;
  padding: var(--bd-space-2);

  &.active {
    opacity: 1;
  }

  &:hover {
    background-color: var(--bd-bg-light);
  }

  &:active {
    background-color: var(--bd-bg-lighter);
  }

  &.big {
    font-size: var(--bd-font-size-xl);
    padding: var(--bd-space-2);
  }

  &.play {
    font-size: var(--bd-font-size-xl);
    opacity: 1;

    &:hover {
      background-color: var(--bd-bg-light);
    }

    &:active {
      background-color: var(--bd-bg-lighter);
    }

    &.big {
      font-size: var(--bd-font-size-xl);
      padding: var(--bd-space-2) var(--bd-space-3);
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
