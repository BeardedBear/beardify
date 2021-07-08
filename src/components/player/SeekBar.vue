<template>
  <div ref="progresss" class="progress">
    <div
      class="bar"
      :style="`width:${
        (store.state.player.currentlyPlaying.progress_ms / store.state.player.currentlyPlaying.item.duration_ms) * 100
      }%`"
    />
    <div class="seek" :style="`width:${perc}%`">
      <div class="time">
        {{ time }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, watchEffect } from "vue";
import { useStore } from "vuex";
import { instance } from "../../api";
import { Mutations } from "./../player/PlayerStore";
import { RootState } from "../../@types/RootState";
import { timecode } from "../../helpers/date";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    const progresss = ref();
    const perc = ref();
    const time = ref();

    watchEffect(() => {
      progresss.value?.addEventListener("mousemove", (e: MouseEvent) => {
        const positionInPercent = (e.clientX / progresss.value?.clientWidth) * 100;
        const duration = (store.state.player.currentlyPlaying.item.duration_ms / 100) * positionInPercent;
        perc.value = positionInPercent;
        time.value = timecode(duration);
      });

      progresss.value?.addEventListener("click", (e: MouseEvent) => {
        const positionInPercent = (e.clientX / progresss.value?.clientWidth) * 100;
        const duration = (store.state.player.currentlyPlaying.item.duration_ms / 100) * positionInPercent;
        store.commit(Mutations.UPDATE_PROGRESS, Math.round(duration));
        instance.put(`me/player/seek?position_ms=${Math.round(duration)}`);
      });
    });

    return {
      store,
      perc,
      time,
      progresss,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

@keyframes popSeek {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.progress {
  background: var(--bg-color-light);
  height: 10px;
  position: relative;
  cursor: pointer;
  flex: 1;

  .seek {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background-color: var(--primary-color-lighter);
    display: none;
    animation: popSeek 0.2s ease 0s both;
    opacity: 0.5;

    .time {
      position: absolute;
      bottom: calc(100% + 5px);
      background: var(--primary-color);
      color: rgba(white, 0.8);
      padding: 5px 10px;
      right: 0;
      border: 1px solid var(--primary-color-light);
      border-radius: 3px;
      transform: translateX(50%);
    }
  }

  .bar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    background: var(--primary-color);
    transition: all ease 0.25s;
  }

  &:hover {
    .seek {
      display: block;
    }
  }
}
</style>
