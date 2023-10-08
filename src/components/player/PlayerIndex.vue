<template>
  <div class="player">
    <template v-if="playerStore.currentlyPlaying?.currently_playing_type === 'episode'"><PlayerEpisode /></template>
    <template v-else><PlayerSong /></template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch } from "vue";
import PlayerEpisode from "./PlayerEpisode.vue";
import PlayerSong from "./PlayerSong.vue";
import { usePlayer } from "./PlayerStore";

const playerStore = usePlayer();

onMounted(() => playerStore.getExternalPlayerState());

watch(
  () => playerStore.isExternalDevice,
  () => {
    // playerStore.getExternalPlayerState())
    setInterval(() => playerStore.isExternalDevice && playerStore.getExternalPlayerState(), 5000);
  },
);
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.player {
  background: var(--bg-color);
}
</style>
