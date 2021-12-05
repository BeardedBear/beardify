<template>
  <div v-if="artistStore.relatedArtists.artists.length">
    <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">Artistes similaires</div>
    <div class="list">
      <router-link
        v-for="(artist, index) in artistStore.relatedArtists.artists"
        :key="index"
        class="item"
        :to="`/artist/${artist.id}`"
      >
        <Cover size="small" :images="artist.images" class-name="image" />
        <div class="name">
          {{ artist.name }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Cover from "../../components/Cover.vue";
import { useArtist } from "./ArtistStore";

const artistStore = useArtist();
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

.image {
  $size: 50px;

  border-radius: $size;
  height: $size;
  margin-bottom: 5px;
  width: $size;
}

.item {
  border-radius: 3px;
  color: currentColor;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 10px;
  text-align: center;
  text-decoration: none;

  &:hover {
    background-color: color.change(rgb(74 75 103), $alpha: 0.15);
  }
}

.list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
</style>
