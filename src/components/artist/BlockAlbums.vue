<template>
  <div v-if="artistStore.albums.length" class="content__block">
    <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">
      <i class="icon-album"></i>
      Albums
    </div>
    <div class="albums">
      <div v-for="(album, index) in artistStore.albums" :key="index">
        <Album :album="album" :currently-played-id="playerStore.currentlyPlaying.item?.album.uri" can-save />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useArtist } from "../../views/artist/ArtistStore";
import { usePlayer } from "../player/PlayerStore";
import Album from "../album/Album.vue";

const artistStore = useArtist();
const playerStore = usePlayer();
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.albums {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr 1fr 1fr 1fr;

  @include l {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @include hdpi {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  }
}
</style>
