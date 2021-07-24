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
  display: inline-block;
  height: 26px;
  margin-bottom: 5px;
  position: relative;
  width: 100px;

  &::before {
    background-color: var(--bg-color);
    clip-path: polygon(0 0, 0 78%, 100% 0);
    content: "";
    inset: 0;
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
    position: relative;
    position: absolute;
    right: 0;
    top: -22px;
    transform: translateX(50%);
    z-index: 999;
  }

  &__hover {
    background-color: var(--primary-color-lighter);
    bottom: 0;
    display: none;
    left: 0;
    position: absolute;
    top: 0;
  }

  &:hover {
    .volume__hover {
      display: block;
    }
  }
}
</style>
