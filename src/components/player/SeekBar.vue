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
  cursor: pointer;
  flex: 1;
  height: 10px;
  position: relative;

  .seek {
    animation: popSeek 0.2s ease 0s both;
    background-color: var(--primary-color-lighter);
    bottom: 0;
    display: none;
    left: 0;
    opacity: 0.5;
    position: absolute;
    top: 0;

    .time {
      background: var(--primary-color);
      border: 1px solid var(--primary-color-light);
      border-radius: 3px;
      bottom: calc(100% + 5px);
      color: rgba(white, 0.8);
      padding: 5px 10px;
      position: absolute;
      right: 0;
      transform: translateX(50%);
    }
  }

  .bar {
    background: var(--primary-color);
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
    transition: all ease 0.25s;
  }

  &:hover {
    .seek {
      display: block;
    }
  }
}
</style>
