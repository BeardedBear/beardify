<template>
  <QueuedTracks />
  <BdDropdown v-model="showList" class="devices" match-width placement="top-end" size="small">
    <template #trigger>
      <BdButton
        align="left"
        class="active-device"
        :disabled="playerStore.isSettingDevice"
        variant="primary"
        @click="playerStore.getDeviceList()"
        @mouseenter="playerStore.getDeviceList()"
      >
        <span
          class="active-device-label"
          :title="playerStore.devices.activeDevice ? `Device ID: ${playerStore.devices.activeDevice.id}` : ''"
        >
          <DeviceTypeIcon :type="playerStore.devices.activeDevice?.type" />
          <span class="device-name">{{ formatName(playerStore.devices.activeDevice, true) }}</span>
        </span>
      </BdButton>
    </template>

    <BdLoader v-if="!playerStore.devices.list.length" size="x-small" />
    <BdDropdownItem
      v-for="(device, index) in deviceListFiltered"
      v-else
      :key="index"
      :active="device.id === playerStore.devices.activeDevice.id"
      :disabled="playerStore.isSettingDevice"
      @click="selectDevice(device)"
    >
      <span class="device-label" :title="`Device ID: ${device.id}`">
        <DeviceTypeIcon :type="device.type" />
        <span class="device-name">{{ formatName(device) }}</span>
        <BdBadge v-if="device.id === playerStore.thisDeviceId" variant="primary">Here</BdBadge>
      </span>
      <BdLoader
        v-if="playerStore.lastRequestedDeviceId === device.id && playerStore.isSettingDevice"
        size="xx-small"
      />
    </BdDropdownItem>
    <BdDropdownItem keep-open @click="playerStore.getDeviceList()">
      <i class="icon-refresh" />
      Refresh
    </BdDropdownItem>
  </BdDropdown>
</template>

<script lang="ts" setup>
import { useWindowSize } from "@vueuse/core";
import { BdBadge, BdButton, BdDropdown, BdDropdownItem, BdLoader } from "bearded-ui";
import { computed, ref } from "vue";

import type { Device } from "@/@types/Device";

import DeviceTypeIcon from "@/components/player/device/DeviceType.vue";
import QueuedTracks from "@/components/player/device/QueuedTracks.vue";
import { usePlayer } from "@/components/player/PlayerStore";

const playerStore = usePlayer();
const deviceListFiltered = computed(() => [...playerStore.devices.list].sort((a, b) => a.name.localeCompare(b.name)));

// Count device names so we can disambiguate identical names in the UI
const nameCounts = computed(() => {
  const m = new Map<string, number>();
  playerStore.devices.list.forEach((d) => {
    const count = m.get(d.name) || 0;
    m.set(d.name, count + 1);
  });
  return m;
});

const { width } = useWindowSize();
const isMobile = computed(() => (width.value ?? 9999) <= 480);

function formatName(device?: Device | null, shortenable = false): string {
  if (!device) return "";
  const count = nameCounts.value.get(device.name) || 0;
  let name = device.name;
  if (count > 1 && device.id) {
    /*
     * This branch used to assign the name to itself, which made the whole
     * nameCounts apparatus a no-op: two speakers both called "Salon" rendered
     * identically and the only thing telling them apart was a 40-character hex
     * id in a tooltip. The device type is what a person actually uses to pick.
     */
    name = `${device.name} (${device.type.toLowerCase()})`;
  }
  if (isMobile.value && shortenable) return truncate(name, 10);
  return name;
}

function truncate(str: string, max: number) {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

const showList = ref(false);

function selectDevice(device: Device): void {
  if (playerStore.isSettingDevice || device.id === playerStore.devices.activeDevice.id) return;
  playerStore.setDevice(device.id);
}
</script>

<style scoped>

.devices {
  display: flex;
  gap: 10px;
}

.device-label,
.active-device-label {
  align-items: center;
  display: inline-flex;
  gap: 0.4rem;
}

.device-name {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
}
</style>
