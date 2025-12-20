<template>
  <div class="wrap" v-if="playerStore.devices.activeDevice.id">
    <div class="device">
      <DeviceVolume />
      <DevicesList />
    </div>
  </div>
  <div class="options" v-else><Loader /></div>
</template>

<script lang="ts" setup>
import { usePlayer } from "@/components/player/PlayerStore";
import DevicesList from "@/components/player/device/DeviceList.vue";
import DeviceVolume from "@/components/player/device/DeviceVolume.vue";
import Loader from "@/components/ui/LoadingDots.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: end;

  @include responsive.mobile {
    justify-content: center;
    margin-top: 0.5rem;
  }
}

.device {
  align-items: center;
  display: flex;
  gap: 10px;
  text-align: right;
}
</style>
