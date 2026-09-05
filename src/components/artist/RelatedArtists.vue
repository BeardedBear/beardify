<template>
  <div v-if="artistStore.relatedArtists.artists.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="bd-heading sticky-heading">Similar artists</div>
    <div class="list">
      <router-link
        v-for="(artist, index) in artistStore.relatedArtists.artists"
        :key="index"
        :to="`/artist/${artist.id}`"
        class="item bd-font-bold"
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

import Cover from "@/components/ui/AlbumCover.vue";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();
</script>

<style scoped>

.image {
  --image-size: 3rem;

  border-radius: var(--image-size);
  height: var(--image-size);
  margin-bottom: var(--bd-space-2);
  width: var(--image-size);
}

.item {
  border-radius: var(--bd-radius-sm);
  color: currentcolor;
  cursor: pointer;
  padding: var(--bd-space-3);
  text-align: center;
  text-decoration: none;

  &:hover {
    background-color: var(--bd-hover-overlay);
  }
}

.list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
</style>
