<template>
  <div class="player-loading">
    <div class="player-loading__title">Choisir un périphérique de lecture :</div>
    <span v-if="store.state.player.devices.list.length">
      <button
        v-for="(device, _, index) in store.state.player.devices.list"
        :key="index"
        type="button"
        class="device button button--x-small"
        :class="{ me: store.state.player.thisDeviceId === device.id }"
        @click="setDevice(device)"
      >
        {{ device.name }}
      </button>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { Device } from "../../@types/Device";
import { RootState } from "../../@types/RootState";
import { PlayerActions } from "./PlayerStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    function setDevice(device: Device) {
      store.dispatch(PlayerActions.setDevice, device as Device);
    }

    return { store, setDevice };
  },
});
</script>

<style lang="scss" scoped>
.player-loading {
  display: grid;
  place-content: center;
  padding: 10px;
  background-color: var(--bg-color);
  padding: 20px;
  text-align: center;

  &__title {
    margin-bottom: 15px;
  }
}
</style>
