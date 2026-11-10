<template>
  <div v-if="artistStore.relatedArtists.artists.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="bd-heading sticky-heading">Similar artists</div>
    <div class="list">
      <BdTooltip
        v-for="{ artist, shared, others } in items"
        :key="artist.id"
        :disabled="truncatedId !== artist.id && !shared.length && !others.length"
        bare
      >
        <router-link
          :to="`/artist/${artist.id}`"
          class="item bd-font-bold"
          @focus="checkTruncated($event, artist.id)"
          @mouseenter="checkTruncated($event, artist.id)"
        >
          <Cover :images="artist.images" class="image" size="small" />
          <div class="name">
            {{ artist.name }}
          </div>
        </router-link>
        <template #content>
          <div v-if="truncatedId === artist.id" class="tooltip-name bd-font-bold">{{ artist.name }}</div>
          <div v-if="shared.length" class="genres shared">
            <span class="genres-label bd-font-bold">Shared:</span>
            <span v-for="genre in shared" :key="genre" class="genre">{{ genre }}</span>
          </div>
          <div v-if="others.length" class="genres">
            <span class="genres-label bd-font-bold">{{ shared.length ? "Also:" : "Genres:" }}</span>
            <span v-for="genre in others" :key="genre" class="genre">{{ genre }}</span>
          </div>
        </template>
      </BdTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdTooltip } from "bearded-ui";
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

import { Artist } from "@/@types/Artist";
import Cover from "@/components/ui/AlbumCover.vue";
import { useArtist } from "@/views/artist/ArtistStore";

/** Enough to say why the artist is here without turning the tooltip into a tag cloud. */
const MAX_GENRES = 4;

const artistStore = useArtist();

/** Artist whose name is clamped, measured on hover or focus — before the tooltip delay runs out. */
const truncatedId = ref<null | string>(null);

/** Genres of the page's artist: the ones a similar artist shares are the answer to "why this one?". */
const sharedGenres = computed(() => new Set(artistStore.artist.genres ?? []));

function checkTruncated(event: Event, id: string): void {
  const name = (event.currentTarget as HTMLElement).querySelector(".name");
  truncatedId.value = name && name.scrollHeight > name.clientHeight ? id : null;
}

/**
 * Split into shared / other, shared filling the budget first. `?? []`: Spotify has
 * been dropping fields from artist objects, and a missing list must not take the
 * section down.
 */
function genresOf(artist: Artist): { others: string[]; shared: string[] } {
  const genres = artist.genres ?? [];
  const shared = genres.filter((genre) => sharedGenres.value.has(genre)).slice(0, MAX_GENRES);
  const others = genres.filter((genre) => !sharedGenres.value.has(genre)).slice(0, MAX_GENRES - shared.length);
  return { others, shared };
}

/** Genres split once per list change, not on every hover re-render. */
const items = computed(() =>
  artistStore.relatedArtists.artists.map((artist) => ({ artist, ...genresOf(artist) })),
);
</script>

<style scoped>

.image {
  --image-size: 3rem;

  border-radius: var(--image-size);
  display: block;
  height: var(--image-size);
  margin: 0 auto var(--bd-space-2);
  object-fit: cover;
  transition: scale var(--bd-duration) cubic-bezier(0.16, 1, 0.3, 1);
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

  /* Touch keeps :hover after a tap: the avatar would stay zoomed on the page left behind. */
  @media (hover: hover) {
    &:hover .image {
      scale: 1.08;
    }
  }

  &:active {
    background-color: var(--bd-bg-light);

    .image {
      scale: 1;
    }
  }
}

.name {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.list {
  display: grid;

  /* 3 columns in the 20rem sidebar, more once the column goes full width (--xl, mobile). */
  grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
}

.tooltip-name {
  margin-bottom: var(--bd-space-1);
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--bd-space-2);

  & + & {
    margin-top: var(--bd-space-1);
  }
}

.genres-label {
  color: var(--bd-font-color-dark);
}

.genre {
  color: var(--bd-font-color);
  text-transform: capitalize;

  .shared & {
    color: var(--bd-primary-light);
  }
}

@media (prefers-reduced-motion: reduce) {
  .image {
    transition: none;
  }

  .item:hover .image {
    scale: 1;
  }
}
</style>
