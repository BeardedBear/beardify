<template>
  <a class="album" :href="album.external_urls.spotify" rel="noopener" target="_blank">
    <Cover :images="album.images" class="album-cover" size="medium" />
    <div class="metas">
      <div v-if="rank" class="rank-number">{{ rank }}</div>
      <div class="infos">
        <div class="name">{{ album.name }}</div>
        <div class="artists">{{ album.artists.map((a) => a.name).join(", ") }}</div>
      </div>
    </div>
  </a>
</template>

<script lang="ts" setup>
import { AlbumSimplified } from "@/@types/Album";
import Cover from "@/components/ui/AlbumCover.vue";

defineProps<{
  album: AlbumSimplified;
  rank?: number;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.album {
  color: inherit;
  text-decoration: none;
}

.album-cover {
  border-radius: 0.4rem;
  margin-bottom: 0.5rem;
  width: 100%;
}

.metas {
  align-items: center;
  display: flex;
  gap: 0.8rem;
}

.infos {
  flex: 1;
  min-width: 0;
}

.rank-number {
  color: var(--font-color-light);
  flex-shrink: 0;
  font-size: 2.4rem;
  line-height: 1;

  @include font-bold;
}

.name {
  @include font-bold;
}

.artists {
  opacity: 0.6;
}
</style>
