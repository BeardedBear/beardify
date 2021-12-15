<template>
  <span v-for="(artist, index) in artistList" :key="index">
    <span class="artist" :class="{ feat }" @click.stop="goArtist(`/artist/${artist.uri.split(':').pop()}`)">
      {{ artist.name }}
    </span>
    <span v-if="artistList.length - 1 !== index" class="separator"> / <span v-if="!feat">&nbsp;</span></span>
  </span>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { Artist, ArtistSimplified } from "../../@types/Artist";
import router from "../../router";

defineProps<{
  artistList: Artist[] | ArtistSimplified[];
  feat?: boolean;
}>();

function goArtist(artistUri: string): void {
  router.push(artistUri);
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.separator {
  opacity: 0.2;
}

.artist {
  color: currentColor;
  cursor: pointer;
  text-decoration: none;

  &.feat {
    font-size: 0.9rem;
    font-style: italic;
    opacity: 0.5;
  }

  &:hover {
    color: var(--primary-color);
    opacity: 1;
  }
}
</style>
