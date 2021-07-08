<template>
  <div ref="refVolume" class="volume" @click="setVolume()">
    <div class="volume__cursor" :style="{ width: store.state.player.devices.activeDevice.volume_percent + '%' }" />
    <div class="volume__hover" :style="{ width: volume + '%' }">
      <div class="volume__pc">{{ volume + "%" }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, watchEffect } from "vue";
import { useStore } from "vuex";
import { PlayerActions } from "./../player/PlayerStore";
import { RootState } from "../../@types/RootState";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    const refVolume = ref();
    const volume = ref(0);

    function setVolume(): void {
      store.dispatch(PlayerActions.setVolume, volume.value);
    }

    watchEffect(() => {
      refVolume.value?.addEventListener("mousemove", (e: MouseEvent) => {
        volume.value = e.offsetX;
      });
    });

    return {
      store,
      setVolume,
      refVolume,
      volume,
    };
  },
});
</script>

<style lang="scss" scoped>
.volume {
  background-color: var(--bg-color-light);
  position: relative;
  height: 26px;
  width: 100px;
  display: inline-block;
  margin-bottom: 5px;

  &::before {
    position: absolute;
    content: "";
    background-color: var(--bg-color);
    inset: 0;
    z-index: 9;
    clip-path: polygon(0 0, 0 78%, 100% 0);
  }

  &__cursor {
    background-color: var(--primary-color);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
  }

  &__pc {
    position: relative;
    z-index: 999;
    position: absolute;
    right: 0;
    transform: translateX(50%);
    top: -22px;
  }

  &:hover {
    .volume__hover {
      display: block;
    }
  }

  &__hover {
    background-color: var(--primary-color-lighter);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    display: none;
  }
}
</style>
