<template>
  <div class="content__block" v-if="artistStore.eps.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">
      <i class="icon-ep"></i>
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
