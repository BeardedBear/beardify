<template>
  <a
    class="album"
    :class="{ 'hover-metas': hoverMetas }"
    :href="album.external_urls.spotify"
    rel="noopener"
    target="_blank"
  >
    <div class="visual">
      <div class="cover-wrap">
        <Cover :images="album.images" class="album-cover" size="medium" />
        <!-- Same reason as AlbumIndex: in the text row the numeral took a third
             of a narrow cell and squeezed the name into mid-word breaks. -->
        <div v-if="rank" class="rank-number font-bold">{{ rank }}</div>
      </div>
      <div class="metas">
        <div class="infos">
          <div class="name font-bold">{{ album.name }}</div>
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

<style scoped>

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

/*
 * Collapses .metas to zero height by default and pins the card's own box to a
 * fixed square: aspect-ratio + align-self: start prevents grid/flex stretch
 * from growing the whole row to match .visual's revealed height once it pops
 * out.
 */
.album.hover-metas {
  align-self: start;
  aspect-ratio: 1 / 1;

  .visual {
    display: flex;
    flex-direction: column;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;

    /* impeccable-disable-next-line layout-transition -- absolute box: reflows one card's subtree, once per hover */
    transition: padding 0.15s ease;
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

/*
 * The revealed state: .visual pops a background card outside the item's own box
 * (no `bottom`, so it grows downward over whatever's below instead of pushing
 * it) and .metas becomes visible.
 */
@media (hover: hover) {
  .album.hover-metas:hover {
    .visual {
      background-color: var(--bg-color-light);
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 40%);
      padding: 0.5rem;
      z-index: 5;
    }

    .metas {
      margin-top: 0.6rem;
      max-height: 10rem;
      opacity: 1;
    }
  }
}

.infos {
  flex: 1;
  min-width: 0;
}

.cover-wrap {
  position: relative;
}

/* No hover actions on this card, so the corner stays free. */
.rank-number {
  backdrop-filter: blur(2px);
  background: color-mix(in oklab, var(--bg-color-darker) 82%, transparent);
  border-radius: 0.3rem;
  bottom: 0.3rem;
  color: var(--font-color-light);
  font-size: var(--font-size-lg);
  left: 0.3rem;
  line-height: 1;
  padding: 0.15rem 0.4rem;
  position: absolute;
  z-index: 2;
}

.name {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: break-word;
  text-overflow: ellipsis;
}

/* One line: an unclamped artist list made every card in the row grow to match. */
.artists {
  color: var(--font-color-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
