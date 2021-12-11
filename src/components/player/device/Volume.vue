<template>
  <div ref="refVolume" class="volume" @click="playerStore.setVolume(volume)">
    <div class="volume__cursor" :style="{ width: playerStore.devices.activeDevice.volume_percent + '%' }" />
    <div class="volume-hover" :style="{ width: volume + '%' }">
      <div class="volume__pc">{{ volume + "%" }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from "vue";
import { usePlayer } from "../PlayerStore";

const refVolume = ref<HTMLDivElement | null>(null);
const volume = ref<number>(0);
const playerStore = usePlayer();

watchEffect(() => {
  refVolume.value?.addEventListener("mousemove", (e: MouseEvent) => {
    if (e.offsetX <= 100 && e.offsetX >= 0) volume.value = e.offsetX;
  });
});
</script>

<style lang="scss" scoped>
.volume {
  background-color: var(--bg-color-light);
  display: inline-block;
  height: 1.3rem;
  margin-bottom: 0.1rem;
  position: relative;
  width: 6.3rem;

  &::before {
    background-color: var(--bg-color);
    clip-path: polygon(-10% -10%, 0 82%, 100% 0);
    content: "";
    inset: -0.1rem;
    position: absolute;
    z-index: 9;
  }

  &__cursor {
    background-color: var(--primary-color);
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
  }

  &__pc {
    pointer-events: none;
    position: absolute;
    right: 0;
    top: -1rem;
    transform: translateX(50%);
    z-index: 999;
  }

  &-hover {
    background-color: var(--primary-color-lighter);
    bottom: 0;
    display: none;
    left: 0;
    position: absolute;
    top: 0;
  }

  &:hover {
    .volume-hover {
      display: block;
    }
  }
}
</style>
