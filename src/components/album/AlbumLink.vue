<template>
  <i
    v-if="!noIcon"
    :class="{
      'icon-single': isSingle(album),
      'icon-compilation': isCompilation(album),
    }"
  />
  <span class="artist bd-font-italic" @click.prevent.stop="goAlbum(`/album/${album.id}`)">{{ album.name }}</span>
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

<style scoped>

.separator {
  color: var(--bd-font-color-dark);
}

.artist {
  color: var(--bd-font-color-dark);
  cursor: pointer;
  font-size: var(--bd-font-size-sm);

  &:hover {
    color: var(--bd-primary);
    opacity: 1;
  }
}
</style>
