<template>
  <i
    :class="{
      'icon-single': isSingle(album),
      'icon-compilation': isCompilation(album),
    }"
    v-if="!noIcon"
  />
  <span @click.prevent.stop="goAlbum(`/album/${album.id}`)" class="artist">{{ album.name }}</span>
</template>

<script lang="ts" setup>
import { AlbumSimplified } from "@/@types/Album";
import { isCompilation, isSingle } from "@/helpers/useCleanAlbums";
import router from "@/router";

defineProps<{
  album: AlbumSimplified;
  noIcon?: boolean;
}>();

function goAlbum(albumId: string): void {
  router.push(albumId);
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as *;

.separator {
  opacity: 0.2;
}

.artist {
  color: currentcolor;
  cursor: pointer;
  font-size: var(--font-size-sm);

  @include font-italic;

  opacity: 0.5;

  &:hover {
    color: var(--primary-color);
    opacity: 1;
  }
}
</style>
