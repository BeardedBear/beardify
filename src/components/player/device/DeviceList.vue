<template>
  <div class="wrap">
    <QueuedTracks />
    <template v-for="(device, _key) in playerStore.devices.list" :key="_key">
      <button
        v-if="device.id === playerStore.devices.activeDevice.id"
        type="button"
        class="device button button--small"
        :class="{
          'button--primary': device.id === playerStore.devices.activeDevice.id,
          me: playerStore.thisDeviceId === device.id,
        }"
        @click="playerStore.setDevice(device.id)"
      >
        {{ device.name }}
      </button>
    </template>
    <button type="button" class="device button button--small" @click="playerStore.getDeviceList()">
      <i class="icon-refresh"></i>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { usePlayer } from "../PlayerStore";
import QueuedTracks from "./QueuedTracks.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  gap: 10px;
}

.device {
  &.me {
    position: relative;

    &::before {
      $s: 0.5rem;

      background: var(--font-color);
      border-top-right-radius: 0.4rem;
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
