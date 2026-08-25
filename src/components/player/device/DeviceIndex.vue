<template>
  <div v-if="playerStore.devices.activeDevice.id" class="wrap">
    <div class="device">
      <DeviceVolume :force-mobile />
      <DevicesList />
    </div>
  </div>
  <div v-else class="options">
    <BdLoader />
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";

import DevicesList from "@/components/player/device/DeviceList.vue";
import DeviceVolume from "@/components/player/device/DeviceVolume.vue";
import { usePlayer } from "@/components/player/PlayerStore";

const props = defineProps<{ forceMobile?: boolean }>();
const playerStore = usePlayer();
const forceMobile = props.forceMobile ?? false;
</script>

<style scoped>

.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: end;

  @media (--mobile) {
    justify-content: center;
  }
}

.device {
  align-items: center;
  display: flex;
  gap: 1rem;
  text-align: right;
}
</style>
