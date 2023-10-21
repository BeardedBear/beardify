<template>
  <QueuedTracks />
  <div class="devices">
    <button
      type="button"
      class="button button--small button--primary active-device"
      @click="playerStore.setDevice(playerStore.devices.activeDevice.id)"
      @mouseenter="playerStore.getDeviceList()"
    >
      {{ playerStore.devices.activeDevice.name }}
    </button>
    <div class="available-device-list">
      <LoadingDots v-if="!playerStore.devices.list.length" size="small" />
      <button
        v-for="(device, _key) in deviceListFiltered"
        v-else
        :key="_key"
        type="button"
        class="button button--small button--full"
        @click="playerStore.setDevice(device.id)"
      >
        {{ device.name }}
      </button>
      <button
        type="button"
        class="button button--small button--full button--with-border refresh"
        @click="playerStore.getDeviceList()"
      >
        <i class="icon-refresh"></i> Refresh
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { usePlayer } from "../PlayerStore";
import QueuedTracks from "./QueuedTracks.vue";
import LoadingDots from "../../LoadingDots.vue";

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
