<template>
  <div v-if="playerStore.devices.activeDevice.id" class="wrap">
    <div class="device">
      <!-- Disabled until Spotify's API reactive the feature of change volume -->
      <!-- <Volume /> -->
      <DevicesList />
    </div>
  </div>
  <div v-else class="options"><Loader /></div>
</template>

<script lang="ts" setup>
import Loader from "../../LoadingDots.vue";
import { usePlayer } from "../PlayerStore";
import DevicesList from "./DeviceList.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.wrap {
  align-items: center;
  display: flex;
  justify-content: end;
}

.device {
  text-align: right;
}
</style>
