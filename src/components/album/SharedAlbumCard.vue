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

// aspect-ratio pins .album's own box to the cover's square size regardless of
// .visual's revealed content. align-self: start is required too — the grid
// and flex containers here default to `stretch`, which otherwise grows the
// item (and the whole row, flickering the layout) to match .visual once it
// pops out on hover. .visual is always absolutely positioned inside that
// fixed box (no `bottom`, so it's free to extend past it downward on reveal,
// over any content below, instead of pushing it).
.album.hover-metas {
  align-self: start;
  aspect-ratio: 1 / 1;

  .visual {
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .album-cover {
    margin-bottom: 0;
  }

  .metas {
    margin-top: 0;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition:
      margin-top ease 0.2s,
      max-height ease 0.2s,
      opacity ease 0.15s;
  }
}

@media (hover: hover) {
  .album.hover-metas:hover .visual {
    background-color: var(--bg-color-light);
    border-radius: 0.6rem;
    box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 40%);
    padding: 0.6rem;
    z-index: 5;
  }

  .album.hover-metas:hover .metas {
    margin-top: 0.6rem;
    max-height: 10rem;
    opacity: 1;
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
