<template>
  <div v-if="artistStore.eps.length" class="content__block">
    <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">
      <i class="icon-ep"></i>
      EP's
    </div>
    <div class="eps">
      <div v-for="(album, index) in artistStore.eps" :key="index">
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
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.eps {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(4, 1fr);

  @include l {
    grid-template-columns: repeat(3, 1fr);
  }

  @include l {
    grid-template-columns: repeat(2, 1fr);
  }

  @include hdpi {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
