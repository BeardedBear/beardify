<template>
  <i
    v-if="!noIcon"
    :class="{
      'icon-single': album.album_type === 'single',
      'icon-compilation': album.album_type === 'compilation',
    }"
  />
  <span class="artist" @click.prevent.stop="goAlbum(`/album/${album.id}`)">{{ album.name }}</span>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { AlbumSimplified } from "../../@types/Album";
import router from "../../router";

defineProps<{
  album: AlbumSimplified;
  noIcon?: boolean;
}>();

function goAlbum(albumId: string): void {
  router.push(albumId);
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
  font-size: 0.9rem;
  font-style: italic;
  opacity: 0.5;

  &:hover {
    color: var(--primary-color);
    opacity: 1;
  }
}
</style>
