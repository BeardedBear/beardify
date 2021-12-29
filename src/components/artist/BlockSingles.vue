<template>
  <div v-if="artistStore.singles.length" class="content__block">
    <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">
      <i class="icon-single"></i>
      Singles
    </div>
    <div class="singles">
      <div v-for="(album, index) in artistStore.singles" :key="index">
        <Album :album="album" />
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

.singles {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

  @include xl {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  @include l {
    grid-template-columns: 1fr 1fr;
  }

  @include hdpi {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  }
}
</style>
