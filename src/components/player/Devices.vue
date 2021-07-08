<template>
  <div>
    <button
      v-for="(device, _, index) in store.state.player.devices.list"
      :key="index"
      type="button"
      class="device button button--x-small"
      :class="{
        'button--primary': device.id === store.state.player.devices.activeDevice.id,
        me: store.state.player.thisDeviceId === device.id,
      }"
      @click="setDevice(device)"
    >
      {{ device.name }}
    </button>
    <button type="button" class="device button button--x-small" @click="refreshDevices()">
      <i class="icon-refresh"></i>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { PlayerActions } from "./../player/PlayerStore";
import { RootState } from "../../@types/RootState";
import { Device } from "../../@types/Device";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    function setDevice(device: Device) {
      store.dispatch(PlayerActions.setDevice, device);
    }

    function refreshDevices() {
      store.dispatch(PlayerActions.getDeviceList);
    }

    return { store, setDevice, refreshDevices };
  },
});
</script>

<style lang="scss" scoped>
.device {
  margin-left: 5px;
  &.me {
    position: relative;
    &::before {
      $s: 7px;
      position: absolute;
      top: 0;
      right: 0;
      background: white;
      border-top-right-radius: 3px;
      width: $s;
      height: $s;
      content: "";
      clip-path: polygon(0 0, 100% 0, 100% 100%);
    }
  }
}
</style>
