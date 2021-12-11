<template>
  <div v-if="playerStore.devices.activeDevice.id" class="device">
    <Volume />
    <DevicesList />
  </div>
  <div v-else class="options"><Loader /></div>
</template>

<script lang="ts" setup>
import Loader from "../../LoadingDots.vue";
import { usePlayer } from "../PlayerStore";
import DevicesList from "./DeviceList.vue";
import Volume from "./Volume.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.device {
  text-align: right;
}
</style>
