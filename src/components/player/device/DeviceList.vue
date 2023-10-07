<template>
  <div class="wrap">
    <QueuedTracks />
    <!-- {{ playerStore.isExternalDevice ? "External Device" : "Devices" }} -->
    <div>
      <button
        type="button"
        class="button button--small button--primary active-device"
        @click="playerStore.setDevice(playerStore.devices.activeDevice.id)"
      >
        {{ playerStore.devices.activeDevice.name }}
      </button>
      <button type="button" class="button button--small" @click="playerStore.getDeviceList()">
        <i class="icon-refresh"></i>
      </button>
      <div class="available-device-list">
        <button
          v-for="(device, _key) in deviceListFiltered"
          :key="_key"
          type="button"
          class="button button--small button--full"
          @click="playerStore.setDevice(device.id)"
        >
          {{ device.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { usePlayer } from "../PlayerStore";
import QueuedTracks from "./QueuedTracks.vue";

const playerStore = usePlayer();
const deviceListFiltered = computed(() =>
  playerStore.devices.list
    .filter((device) => device.id !== playerStore.devices.activeDevice.id)
    .sort((a, b) => a.name.localeCompare(b.name)),
);
</script>

<style lang="scss" scoped>
$gap-list: 10px;

.available-device-list {
  background-color: var(--bg-color-light);
  border-radius: 5px;
  bottom: calc(100% + #{$gap-list});
  display: none;
  flex-wrap: wrap;
  gap: 3px;
  padding: 10px;
  position: absolute;
  right: 0;
  z-index: 9;

  &:hover {
    display: flex;
  }

  &::after {
    content: "";
    height: $gap-list;
    left: 0;
    position: absolute;
    right: 0;
    top: 100%;
  }
}

.active-device {
  &:hover {
    ~ .available-device-list {
      display: flex;
    }
  }
}

.wrap {
  display: flex;
  gap: 10px;
  position: relative;
}
</style>
