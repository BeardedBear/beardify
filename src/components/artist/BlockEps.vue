<template>
  <div class="content__block" v-if="artistStore.eps.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">
      <i class="icon-ep" />
      EP's
    </div>
    <div class="eps">
      <div :key="index" v-for="(album, index) in artistStore.eps">
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

.eps {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(4, 1fr);

  @include responsive.l {
    grid-template-columns: repeat(3, 1fr);
  }

  @include responsive.l {
    grid-template-columns: repeat(2, 1fr);
  }

  @include responsive.hdpi {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
