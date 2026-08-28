<template>
  <div :class="{ checked: isChecked }" class="release">
    <button
      :aria-label="isChecked ? `Mark ${release.name} as not listened` : `Mark ${release.name} as listened`"
      :aria-pressed="isChecked"
      class="check"
      type="button"
      @click="releasesStore.toggleCheck(release.key)"
    >
      <Check v-if="isChecked" :size="16" />
      <Circle v-else :size="16" />
    </button>

    <Cover :images="release.images" class="cover" size="small" />

    <div class="names">
      <button class="album bd-font-bold" type="button" @click="search(release.artistName, release.name)">
        {{ release.name }}
      </button>
      <button class="artist" type="button" @click="search(release.artistName)">
        {{ release.artistName }}
      </button>
    </div>

    <div class="genres">
      <span v-for="genre in release.genres.slice(0, GENRES_SHOWN)" :key="genre" class="genre">{{ genre }}</span>
    </div>

    <div class="date">{{ formatDate(release.releaseDate) }}</div>
  </div>
</template>

<script lang="ts" setup>
import { Check, Circle } from "@lucide/vue";
import { computed } from "vue";

import { Release } from "@/@types/Releases";
import { useDialog } from "@/components/dialog/DialogStore";
import { useSearch } from "@/components/search/SearchStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { formatDate } from "@/helpers/date";
import { useReleases } from "@/views/releases/ReleasesStore";

/** Spotify hands out up to a dozen micro-genres per artist; past three the row is a wall of tags. */
const GENRES_SHOWN = 3;

const props = defineProps<{
  release: Release;
}>();

const releasesStore = useReleases();
const searchStore = useSearch();
const dialogStore = useDialog();

const isChecked = computed(() => Boolean(releasesStore.checks[props.release.key]));

/*
 * Opens the search dialog pre-filled. Album omitted means "everything by this
 * artist", which is the useful landing spot when the row itself is not what you
 * were after. The `&` separator is the app's own convention — see SearchInput's
 * placeholder.
 * @param artist - Artist to search for
 * @param album - Album to narrow down to, when the album name was the thing clicked
 */
function search(artist: string, album?: string): void {
  searchStore.updateQuery(album ? `artist:${artist}  &  album:${album}` : `artist:${artist}`);
  dialogStore.open({ type: "search" });
}
</script>

<style scoped>
.release {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  display: grid;
  gap: var(--bd-space-3);
  grid-template-columns: 1.2rem 2.5rem minmax(0, 1.4fr) minmax(0, 1fr) 6rem;
  padding: var(--bd-space-2) var(--bd-space-3);
  transition: background-color var(--bd-transition-fast), opacity var(--bd-transition-fast);

  &:hover {
    background-color: var(--bd-bg-light);
  }

  /* Ticked off, not gone: still readable, clearly done, and one click from undone. */
  &.checked {
    opacity: 0.35;
  }

  @media (--tablet-down) {
    grid-template-columns: 1.2rem 2.5rem minmax(0, 1fr);

    .genres,
    .date {
      display: none;
    }
  }
}

.check {
  background-color: transparent;
  border: none;
  color: var(--bd-font-color);
  cursor: pointer;
  display: flex;
  opacity: 0.3;
  padding: 0;
  transition: opacity var(--bd-transition);

  &:hover {
    opacity: 1;
  }
}

.release.checked .check {
  color: var(--bd-primary);
  opacity: 1;
}

.cover {
  border-radius: var(--bd-radius-sm);
  height: 2.5rem;
  object-fit: cover;
  width: 2.5rem;
}

.names {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.album,
.artist {
  background-color: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: var(--bd-font-size-sm);
  overflow: hidden;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--bd-primary);
    text-decoration: underline;
  }
}

.artist {
  align-items: center;
  color: var(--bd-font-color-dark);
  display: flex;
  gap: var(--bd-space-1);
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bd-space-1);
  justify-content: flex-end;
}

.genre {
  background-color: var(--bd-bg-lighter);
  border-radius: var(--bd-radius-full);
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: 0.1rem var(--bd-space-2);
  text-transform: uppercase;
  white-space: nowrap;
}

.date {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  text-align: right;
}
</style>
