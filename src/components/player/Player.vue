<template>
  <div class="player">
    <template v-if="playerStore.currentlyPlaying.currently_playing_type === 'episode'"><PlayerEpisode /></template>
    <template v-else><PlayerSong /></template>
  </div>
</template>

<script lang="ts" setup>
import { usePlayer } from "./PlayerStore";
import PlayerEpisode from "./PlayerEpisode.vue";
import PlayerSong from "./PlayerSong.vue";

const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.player {
  background: var(--bg-color);
}
</style>
