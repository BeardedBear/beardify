<template>
  <div class="content__block" v-if="artistStore.albums.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">
      <i class="icon-album"></i>
      Albums
    </div>
    <div class="albums">
      <div :key="index" v-for="(album, index) in artistStore.albums">
        <Album :album="album" can-save />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useArtist } from "../../views/artist/ArtistStore";
import Album from "../album/AlbumIndex.vue";

const artistStore = useArtist();
</script>

<style lang="scss" scoped>
@use "../../assets/scss/colors" as colors;
@use "../../assets/scss/responsive" as responsive;

.albums {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(4, 1fr);

  @include responsive.l {
    grid-template-columns: repeat(5, 1fr);
  }

  @include responsive.hdpi {
    grid-template-columns: repeat(8, 1fr);
  }
}
</style>
