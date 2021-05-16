<template>
  <div class="controls">
    <div>
      <button v-if="!store.state.player.currentlyPlaying.is_playing" class="controls__btn" @click="goPlay()">
        <i class="icon-play" />
      </button>
      <button v-else class="controls__btn" @click="goPause()">
        <i class="icon-pause" />
      </button>
      <button class="controls__btn" @click="goNext()">
        <i class="icon-skip-forward" />
      </button>
    </div>
    <div v-if="store.state.player.currentlyPlaying.progress_ms">
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

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    function goPlay() {
      instance.put("me/player/play", {
        device_id: store.state.player.devices.activeDevice,
      });
    }

    function goNext() {
      instance.post("me/player/next");
    }

    function goPause() {
      instance.put("me/player/pause", {
        device_id: store.state.player.devices.activeDevice,
      });
    }

    return { store, goPlay, goNext, goPause, timecode };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.controls {
  display: flex;
  gap: 20px;
  align-items: center;

  &__btn {
    border: 0;
    background-color: transparent;
    font-size: 1.8rem;
    color: currentColor;
    border-radius: 5px;
    margin-right: 5px;
    cursor: pointer;
    padding: 5px 7px;

    &:hover {
      background-color: var(--bg-color-light);
    }
  }
}
</style>
