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

onMounted(() => playerStore.getExternalPlayerState());

watch(
  () => playerStore.isExternalDevice,
  (external) => {
    external
      ? (interval.value = window.setInterval(() => playerStore.getExternalPlayerState(), 2000))
      : window.clearInterval(interval.value);
  },
);
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.player {
  background: var(--bg-color);
}
</style>
