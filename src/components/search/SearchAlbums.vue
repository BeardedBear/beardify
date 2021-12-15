<template>
  <div class="album-list">
    <template v-if="searchStore.albums.length">
      <Album
        v-for="(album, index) in searchStore.albums"
        :key="index"
        :currently-played-id="playerStore.currentlyPlaying.item?.album.uri"
        :album="album"
        with-artists
        without-release-date
        @click="searchStore.reset()"
      />
    </template>
    <template v-else>Aucun album trouvé</template>
  </div>
</template>

<script lang="ts" setup>
import Album from "../album/Album.vue";
import { usePlayer } from "../player/PlayerStore";
import { useSearch } from "./SearchStore";

const playerStore = usePlayer();
const searchStore = useSearch();
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

.album-list {
  align-content: start;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
