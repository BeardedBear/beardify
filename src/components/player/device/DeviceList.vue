<template>
  <QueuedTracks />
  <div class="devices">
    <ButtonIndex
      variant="primary"
      class="active-device"
      size="small"
      type="button"
      @click="playerStore.setDevice(playerStore.devices.activeDevice.id)"
      @mouseenter="playerStore.getDeviceList()"
    >
      {{ playerStore.devices.activeDevice.name }}
    </ButtonIndex>
    <div class="available-device-list">
      <LoadingDots size="small" v-if="!playerStore.devices.list.length" />
      <ButtonIndex
        variant="full"
        :key="_key"
        type="button"
        size="small"
        @click="playerStore.setDevice(device.id)"
        v-else
        v-for="(device, _key) in deviceListFiltered"
      >
        {{ device.name }}
      </ButtonIndex>
      <ButtonIndex variant="border" class="refresh" type="button" size="small" @click="playerStore.getDeviceList()">
        <i class="icon-refresh"></i>
        Refresh
      </ButtonIndex>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import LoadingDots from "@/components/ui/LoadingDots.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import QueuedTracks from "@/components/player/device/QueuedTracks.vue";

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
