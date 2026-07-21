<template>
  <a
    class="album"
    :class="{ 'hover-metas': hoverMetas }"
    :href="album.external_urls.spotify"
    rel="noopener"
    target="_blank"
  >
    <div class="visual">
      <Cover :images="album.images" class="album-cover" size="medium" />
      <div class="metas">
        <div v-if="rank" class="rank-number">{{ rank }}</div>
        <div class="infos">
          <div class="name">{{ album.name }}</div>
          <div class="artists">{{ album.artists.map((a) => a.name).join(", ") }}</div>
        </div>
      </div>
    </div>
  </a>
</template>

<script lang="ts" setup>
import { AlbumSimplified } from "@/@types/Album";
import Cover from "@/components/ui/AlbumCover.vue";

defineProps<{
  album: AlbumSimplified;
  hoverMetas?: boolean;
  rank?: number;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.album {
  color: inherit;
  position: relative;
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

.album.hover-metas {
  @include hover-metas-base(".album-cover");
}

@media (hover: hover) {
  .album.hover-metas:hover {
    @include hover-metas-reveal;
  }
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
