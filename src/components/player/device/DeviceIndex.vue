<template>
  <div v-if="playerStore.devices.activeDevice.id" class="wrap">
    <QueuedTracks />
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
import QueuedTracks from "./QueuedTracks.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.wrap {
  align-items: center;
  display: flex;
  gap: 20px;
  justify-content: end;
}

.device {
  text-align: right;
}
</style>
