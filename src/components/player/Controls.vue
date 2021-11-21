<template>
  <div class="controls">
    <div class="btns">
      <button
        class="controls__btn"
        :class="{ active: playerStore.currentlyPlaying.shuffle_state }"
        @click="playerStore.toggleShuffle()"
      >
        <i class="icon-shuffle" />
      </button>
      <button
        class="controls__btn"
        :class="{ active: playerStore.currentlyPlaying.repeat_state !== 'off' }"
        @click="playerStore.toggleRepeat()"
      >
        <i class="icon-repeat" />
      </button>
      <button v-if="!playerStore.currentlyPlaying.is_playing" class="controls__btn play" @click="goPlay()">
        <i class="icon-play" />
      </button>
      <button v-else class="controls__btn play" @click="goPause()">
        <i class="icon-pause" />
      </button>
      <button class="controls__btn" @click="goNext()">
        <i class="icon-skip-forward" />
      </button>
    </div>
    <div v-if="playerStore.currentlyPlaying.progress_ms" class="time">
      {{ timecode(playerStore.currentlyPlaying.progress_ms) }} /
      {{ timecode(playerStore.currentlyPlaying.item.duration_ms) }}
    </div>
    <div v-else class="time">0:00 / 0:00</div>
  </div>
</template>

<script lang="ts" setup>
import { instance } from "../../api";
import { timecode } from "../../helpers/date";
import { usePlayer } from "./PlayerStore";

const playerStore = usePlayer();

function goPlay(): void {
  playerStore.currentlyPlaying.is_playing = true;
  instance().put("me/player/play", {
    device_id: playerStore.devices.activeDevice,
  });
}

function goNext(): void {
  instance().post("me/player/next");
}

function goPause(): void {
  playerStore.currentlyPlaying.is_playing = false;
  instance().put("me/player/pause", {
    device_id: playerStore.devices.activeDevice,
  });
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.btns {
  align-items: center;
  display: flex;
}

.time {
  width: 80px;
}

.controls {
  align-items: center;
  display: flex;
  gap: 20px;

  &__btn {
    background-color: transparent;
    border: 0;
    border-radius: 5px;
    color: currentColor;
    cursor: pointer;
    font-size: 1.3rem;
    margin-right: 5px;
    opacity: 50%;
    padding: 5px 7px;

    &.active {
      opacity: 100%;
    }

    &:hover {
      background-color: var(--bg-color-light);
    }

    &.play {
      background-color: var(--bg-color-light);
      font-size: 2rem;
      opacity: 100%;

      &:hover {
        background-color: var(--bg-color-lighter);
      }
    }
  }
}
</style>
