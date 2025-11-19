<template>
  <div class="player">
    <template v-if="playerStore.currentlyPlaying?.currently_playing_type === 'episode'"><PlayerEpisode /></template>
    <template v-else><PlayerSong /></template>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

import PlayerEpisode from "@/components/player/PlayerEpisode.vue";
import PlayerSong from "@/components/player/PlayerSong.vue";
import { usePlayer } from "@/components/player/PlayerStore";

const playerStore = usePlayer();
const interval = ref<number | undefined>(undefined);

function watchExternalPlayerState(): void {
  const appFocused = document.visibilityState === "visible";
  // Clear existing interval before setting a new one
  if (interval.value !== undefined) {
    window.clearInterval(interval.value);
    interval.value = undefined;
  }
  // Only set interval if external device is active
  if (playerStore.isExternalDevice) {
    interval.value = window.setInterval(() => appFocused && playerStore.getExternalPlayerState(), 2000);
  }
}

onMounted(() => watchExternalPlayerState());

watch(
  () => playerStore.isExternalDevice,
  () => watchExternalPlayerState(),
);

// Cleanup interval when component is unmounted
onBeforeUnmount(() => {
  if (interval.value !== undefined) {
    window.clearInterval(interval.value);
    interval.value = undefined;
  }
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;

.player {
  background: var(--bg-color);
}
</style>
