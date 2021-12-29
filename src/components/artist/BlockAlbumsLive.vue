<template>
  <div v-if="artistStore.albumsLive.length" class="content__block">
    <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">
      <i class="icon-album"></i>
      Live albums
    </div>
    <div class="albums">
      <div v-for="(album, index) in artistStore.albumsLive" :key="index">
        <Album :album="album" can-save />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useArtist } from "../../views/artist/ArtistStore";
import Album from "../album/Album.vue";

const artistStore = useArtist();
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
