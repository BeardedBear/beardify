<template>
  <QueuedTracks />
  <div class="devices" ref="devicesRef">
    <ButtonIndex
      variant="primary"
      align="left"
      class="active-device"
      size="small"
      type="button"
      :disabled="playerStore.isSettingDevice"
      @click="toggleList"
      @mouseenter="playerStore.getDeviceList()"
    >
      <span :title="playerStore.devices.activeDevice ? `Device ID: ${playerStore.devices.activeDevice.id}` : ''" class="active-device-label">
        <DeviceTypeIcon :type="playerStore.devices.activeDevice?.type" />
        {{ formatName(playerStore.devices.activeDevice) }}
      </span>
    </ButtonIndex>
    <div :class="{ 'is-visible': showList }" class="available-device-list">
      <LoadingDots size="x-small" v-if="!playerStore.devices.list.length" />
      <ButtonIndex
        variant="full"
        :key="_key"
        type="button"
        size="small"
        align="justify"
        :disabled="playerStore.isSettingDevice"
        :class="device.id === playerStore.devices.activeDevice.id ? 'device-active' : ''"
        @click="
          () => {
            if (!playerStore.isSettingDevice && device.id !== playerStore.devices.activeDevice.id)
              playerStore.setDevice(device.id);
            showList = false;
          }
        "
        v-else
        v-for="(device, _key) in deviceListFiltered"
        :aria-current="device.id === playerStore.devices.activeDevice.id"
      >
        <span :title="`Device ID: ${device.id}`" class="device-label">
          <DeviceTypeIcon :type="device.type" />
          {{ formatName(device) }}
          <span v-if="device.id === playerStore.thisDeviceId" class="device-badge local">Here</span>
          <i
            v-if="device.id === playerStore.devices.activeDevice.id"
            class="icon-check active-label"
            aria-hidden="true"
            title="Active device"
          />
        </span>
        <LoadingDots
          v-if="playerStore.lastRequestedDeviceId === device.id && playerStore.isSettingDevice"
          size="xx-small"
        />
      </ButtonIndex>
      <ButtonIndex variant="border" class="refresh" type="button" size="small" @click="playerStore.getDeviceList()">
        <i class="icon-refresh"></i>
        Refresh
      </ButtonIndex>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Device } from "@/@types/Device";
import { onClickOutside } from "@vueuse/core";
import { computed, ref } from "vue";

import { usePlayer } from "@/components/player/PlayerStore";
import DeviceTypeIcon from "@/components/player/device/DeviceType.vue";
import QueuedTracks from "@/components/player/device/QueuedTracks.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import LoadingDots from "@/components/ui/LoadingDots.vue";

const playerStore = usePlayer();
const deviceListFiltered = computed(() => playerStore.devices.list.sort((a, b) => a.name.localeCompare(b.name)));

// Count device names so we can disambiguate identical names in the UI
const nameCounts = computed(() => {
  const m = new Map<string, number>();
  playerStore.devices.list.forEach((d) => {
    const count = m.get(d.name) || 0;
    m.set(d.name, count + 1);
  });
  return m;
});

function formatName(device?: Device | null) {
  if (!device) return "";
  const count = nameCounts.value.get(device.name) || 0;
  if (count > 1 && device.id) {
    return `${device.name}`;
  }
  return device.name;
}

const showList = ref(false);
const devicesRef = ref(null);


function toggleList() {
  playerStore.getDeviceList();
  showList.value = !showList.value;
}

onClickOutside(devicesRef, () => {
  showList.value = false;
});
</script>

<style lang="scss" scoped>
$gap-list: 10px;

.available-device-list {
  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: 5px;
  bottom: calc(100% + #{$gap-list});
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  justify-content: center;
  min-height: 100px;
  min-width: 200px;
  opacity: 0;
  padding: 10px;
  pointer-events: none;
  position: absolute;
  right: 0;
  transform: translateY(-6px);
  transition:
    opacity 180ms ease-in-out,
    transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 9999;

  &.is-visible,
  &:hover {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
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
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
  }
}

.devices {
  display: flex;
  gap: 10px;
  position: relative;
}

.device-active {
  color: var(--primary-color);

  &:hover span {
    color: var(--primary-color);
  }
}

.device-label, .active-device-label {
  align-items: center;
  display: inline-flex;
  gap: 0.4rem;
}

.device-badge {
  align-items: center;
  background-color: var(--bg-color-default);
  border-radius: 999px;
  color: var(--font-color-default);
  display: inline-block;
  font-size: 0.6rem;
  font-weight: bold;
  justify-content: center;
  min-width: 32px;
  padding: 0.15rem 0.4rem;
  text-transform: uppercase;
}

.device-badge.active {
  background-color: var(--primary-color);
  color: white;
}

.device-badge.local {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}


</style>
