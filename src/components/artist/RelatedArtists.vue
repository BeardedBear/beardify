<template>
  <div v-if="artistStore.relatedArtists.artists.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">Similar artists</div>
    <div class="list">
      <router-link
        :key="index"
        :to="`/artist/${artist.id}`"
        class="item"
        v-for="(artist, index) in artistStore.relatedArtists.artists"
      >
        <Cover :images="artist.images" class="image" size="small" />
        <div class="name">
          {{ artist.name }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";

import { useArtist } from "../../views/artist/ArtistStore";
import Cover from "../AlbumCover.vue";

const artistStore = useArtist();
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/scss/colors" as colors;

.image {
  $size: 3rem;

  border-radius: $size;
  height: $size;
  margin-bottom: 0.4rem;
  width: $size;
}

.item {
  border-radius: 0.3rem;
  color: currentcolor;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.8rem;
  text-align: center;
  text-decoration: none;

  &:hover {
    background-color: var(--bg-color-dark);
  }
}

.list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
</style>
