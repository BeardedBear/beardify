<template>
  <QueuedTracks />
  <div class="devices">
    <button
      @click="playerStore.setDevice(playerStore.devices.activeDevice.id)"
      @mouseenter="playerStore.getDeviceList()"
      class="button button-small button-primary active-device"
      type="button"
    >
      {{ playerStore.devices.activeDevice.name }}
    </button>
    <div class="available-device-list">
      <LoadingDots size="small" v-if="!playerStore.devices.list.length" />
      <button
        :key="_key"
        @click="playerStore.setDevice(device.id)"
        class="button button-small button-full"
        type="button"
        v-else
        v-for="(device, _key) in deviceListFiltered"
      >
        {{ device.name }}
      </button>
      <button
        @click="playerStore.getDeviceList()"
        class="button button-small button-full button-with-border refresh"
        type="button"
      >
        <i class="icon-refresh"></i>
        Refresh
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import LoadingDots from "../../LoadingDots.vue";
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
  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: 5px;
  bottom: calc(100% + #{$gap-list});
  display: none;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: center;
  min-height: 100px;
  min-width: 200px;
  padding: 10px;
  position: absolute;
  right: 0;
  z-index: 9999;

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

.refresh {
  margin-top: 10px;
}

.active-device {
  &:hover {
    ~ .available-device-list {
      display: flex;
    }
  }
}

.devices {
  display: flex;
  gap: 10px;
  position: relative;
}
</style>
