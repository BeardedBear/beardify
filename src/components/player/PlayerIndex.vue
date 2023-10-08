<template>
  <div class="player">
    <template v-if="playerStore.currentlyPlaying?.currently_playing_type === 'episode'"><PlayerEpisode /></template>
    <template v-else><PlayerSong /></template>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import PlayerEpisode from "./PlayerEpisode.vue";
import PlayerSong from "./PlayerSong.vue";
import { usePlayer } from "./PlayerStore";

const playerStore = usePlayer();
const interval = ref<number | undefined>(undefined);

function watchExternalPlayerState(): void {
  const appFocused = document.visibilityState === "visible";
  playerStore.isExternalDevice
    ? (interval.value = window.setInterval(() => appFocused && playerStore.getExternalPlayerState(), 2000))
    : window.clearInterval(interval.value);
}

onMounted(() => watchExternalPlayerState());

watch(
  () => playerStore.isExternalDevice,
  () => watchExternalPlayerState(),
);
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.player {
  background: var(--bg-color);
}
</style>
