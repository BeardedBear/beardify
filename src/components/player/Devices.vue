<template>
  <div>
    <button
      v-for="(device, index) in playerStore.devices.list"
      :key="index"
      type="button"
      class="device button button--x-small"
      :class="{
        'button--primary': device.id === playerStore.devices.activeDevice.id,
        me: playerStore.thisDeviceId === device.id,
      }"
      @click="playerStore.setDevice(device)"
    >
      {{ device.name }}
    </button>
    <button type="button" class="device button button--x-small" @click="playerStore.getDeviceList()">
      <i class="icon-refresh"></i>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { usePlayer } from "./PlayerStore";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
.device {
  margin-left: 5px;
  &.me {
    position: relative;
    &::before {
      $s: 7px;
      background: white;
      border-top-right-radius: 3px;
      clip-path: polygon(0 0, 100% 0, 100% 100%);
      content: "";
      height: $s;
      position: absolute;
      right: 0;
      top: 0;
      width: $s;
    }
  }
}
</style>
