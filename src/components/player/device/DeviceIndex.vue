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
import Loader from "../../LoadingDots.vue";
import { usePlayer } from "../PlayerStore";
import DevicesList from "./DeviceList.vue";
import DeviceVolume from "./DeviceVolume.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@use "../../../assets/scss/colors" as colors;

.wrap {
  align-items: center;
  display: flex;
  justify-content: end;
}

.device {
  align-items: center;
  display: flex;
  gap: 10px;
  text-align: right;
}
</style>
