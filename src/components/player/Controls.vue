<template>
  <div class="controls">
    <div class="btns">
      <button
        class="controls__btn"
        :class="{ active: store.state.player.currentlyPlaying.shuffle_state }"
        @click="toggleShuffle()"
      >
        <i class="icon-shuffle" />
      </button>
      <button
        class="controls__btn"
        :class="{ active: store.state.player.currentlyPlaying.repeat_state !== 'off' }"
        @click="toggleRepeat()"
      >
        <i class="icon-repeat" />
      </button>
      <button v-if="!store.state.player.currentlyPlaying.is_playing" class="controls__btn play" @click="goPlay()">
        <i class="icon-play" />
      </button>
      <button v-else class="controls__btn play" @click="goPause()">
        <i class="icon-pause" />
      </button>
      <button class="controls__btn" @click="goNext()">
        <i class="icon-skip-forward" />
      </button>
    </div>
    <div v-if="store.state.player.currentlyPlaying.progress_ms" class="time">
      {{ timecode(store.state.player.currentlyPlaying.progress_ms) }} /
      {{ timecode(store.state.player.currentlyPlaying.item.duration_ms) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { instance } from "../../api";
import { RootState } from "../../@types/RootState";
import { timecode } from "../../helpers/date";
import { PlayerActions } from "./PlayerStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    function goPlay(): void {
      instance.put("me/player/play", {
        device_id: store.state.player.devices.activeDevice,
      });
    }

    function goNext(): void {
      instance.post("me/player/next");
    }

    function goPause(): void {
      instance.put("me/player/pause", {
        device_id: store.state.player.devices.activeDevice,
      });
    }

    function toggleShuffle(): void {
      store.dispatch(PlayerActions.toggleShuffle);
    }

    function toggleRepeat(): void {
      store.dispatch(PlayerActions.toggleRepeat);
    }

    return { store, goPlay, goNext, goPause, timecode, toggleShuffle, toggleRepeat };
  },
});
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
    opacity: 0.5;
    padding: 5px 7px;

    &.active {
      opacity: 1;
    }

    &:hover {
      background-color: var(--bg-color-light);
    }

    &.play {
      background-color: var(--bg-color-light);
      font-size: 2rem;
      opacity: 1;

      &:hover {
        background-color: var(--bg-color-lighter);
      }
    }
  }
}
</style>
