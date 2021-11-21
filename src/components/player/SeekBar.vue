<template>
  <div ref="progresss" class="progress">
    <div
      class="bar"
      :style="`width:${
        (playerStore.currentlyPlaying.progress_ms / playerStore.currentlyPlaying.item.duration_ms) * 100
      }%`"
    />
    <div class="seek" :style="`width:${perc}%`">
      <div class="time">
        {{ time }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { timecode } from "../../helpers/date";
import { usePlayer } from "./PlayerStore";

const progresss = ref();
const perc = ref();
const time = ref();
const playerStore = usePlayer();

watchEffect(() => {
  progresss.value?.addEventListener("mousemove", (event: MouseEvent) => {
    const positionInPercent = (event.clientX / progresss.value?.clientWidth) * 100;
    const duration = (playerStore.currentlyPlaying.item.duration_ms / 100) * positionInPercent;
    perc.value = positionInPercent;
    time.value = timecode(duration);
  });

  progresss.value?.addEventListener("click", (event: MouseEvent) => {
    const positionInPercent = (event.clientX / progresss.value?.clientWidth) * 100;
    const duration = (playerStore.currentlyPlaying.item.duration_ms / 100) * positionInPercent;
    playerStore.seek(duration);
  });
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

@keyframes pop-seek {
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
    animation: pop-seek 0.2s ease 0s both;
    background-color: color.change(white, $alpha: 0.2);
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
      color: color.change(white, $alpha: 0.8);
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
