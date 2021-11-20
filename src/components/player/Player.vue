<template>
  <PlayerLoading v-if="!playerStore.currentlyPlaying" />
  <div v-else class="player">
    <div class="meta">
      <What />
      <Controls />
      <div class="options">
        <Volume />
        <Devices />
      </div>
    </div>
    <SeekBar />
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import SeekBar from "./SeekBar.vue";
import Volume from "./Volume.vue";
import Devices from "./Devices.vue";
import What from "./What.vue";
import PlayerLoading from "./PlayerLoading.vue";
import Controls from "./Controls.vue";
import { useTitle } from "@vueuse/core";
import { usePlayer } from "./PlayerStore";

const playerStore = usePlayer();

watch(
  () => playerStore.currentlyPlaying,
  () => {
    useTitle(
      `${playerStore.currentlyPlaying.item?.album.artists[0].name} - ${playerStore.currentlyPlaying.item?.name}`,
    );
  },
);
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.player {
  background: var(--bg-color);
}

.meta {
  align-items: center;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  justify-content: space-between;
  padding: 15px 20px;
}

.options {
  text-align: right;
}
</style>
