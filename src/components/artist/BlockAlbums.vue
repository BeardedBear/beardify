<template>
  <div v-if="artistStore.albums.length" class="content-block">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading album-heading">
      <i class="icon-album" />
      Albums
      <ButtonIndex
        v-if="canSortByPlays"
        class="sort-button"
        size="x-small"
        variant="nude"
        @click="sortByPlays = !sortByPlays"
      >
        {{ sortByPlays ? "Most played" : "Release date" }}
        <i class="icon-arrow-down" />
      </ButtonIndex>
    </div>
    <div class="albums">
      <div v-for="group in sortedGroups" :key="group.baseAlbum.id" class="album-slot">
        <Tooltip v-if="rank(group)" :text="tooltipText(group)" class="rank-badge">
          <span class="rank-badge-bubble font-bold">{{ rank(group) }}</span>
        </Tooltip>
        <AlbumGroup :group="group" can-save clean-name />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import AlbumGroup from "@/components/album/AlbumGroup.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import Tooltip from "@/components/ui/Tooltip.vue";
import { AlbumGroup as AlbumGroupType, getDisplayName, groupAlbumVariants } from "@/helpers/groupAlbumVariants";
import { normalizeString } from "@/helpers/helper";
import { useArtist } from "@/views/artist/ArtistStore";

/**
 * One badge per this many albums: a fixed count would badge most of a 4-album
 * discography and only scratch a 30-album one, where picking an entry point is
 * exactly where the help is needed. Never fewer than a top 3.
 */
const ALBUMS_PER_HIGHLIGHT = 4;
const MIN_HIGHLIGHTS = 3;

const artistStore = useArtist();

/** false = release date (default, newest first), true = Last.fm plays, most first. */
const sortByPlays = ref(false);

const albumGroups = computed(() => groupAlbumVariants(artistStore.albums));

/** Same normalization as the Last.fm side, so both keys are built identically. */
function lastfmRank(group: AlbumGroupType): number | undefined {
  return artistStore.topAlbumRanks.get(normalizeString(getDisplayName(group.baseAlbum.name)));
}

const canSortByPlays = computed(() => artistStore.topAlbumRanks.size > 0);

/**
 * `groupAlbumVariants` already returns newest-first, so the default mode reuses
 * that order untouched. Albums Last.fm doesn't rank keep their date order at the
 * bottom: an unknown play count is not a low one, and sinking them beats
 * interleaving them arbitrarily.
 */
const sortedGroups = computed(() => {
  if (!sortByPlays.value) return albumGroups.value;

  const ranked = albumGroups.value.filter((group) => lastfmRank(group) !== undefined);
  const unranked = albumGroups.value.filter((group) => lastfmRank(group) === undefined);

  return [...ranked.sort((a, b) => (lastfmRank(a) as number) - (lastfmRank(b) as number)), ...unranked];
});

const highlightCount = computed(() =>
  Math.max(MIN_HIGHLIGHTS, Math.round(albumGroups.value.length / ALBUMS_PER_HIGHLIGHT)),
);

/**
 * Positions are recomputed over the studio albums actually listed here rather than
 * reused from Last.fm: its ranking mixes in compilations and live records, which
 * live in their own blocks, so raw ranks would leave gaps (a lone #2 and #5).
 */
const highlights = computed(() => {
  if (!canSortByPlays.value) return new Map<string, number>();

  return new Map(
    albumGroups.value
      .flatMap((group) => {
        const r = lastfmRank(group);
        return r === undefined ? [] : [[group.baseAlbum.id, r] as const];
      })
      .sort((a, b) => a[1] - b[1])
      .slice(0, highlightCount.value)
      .map(([id], index) => [id, index + 1]),
  );
});

const rank = (group: AlbumGroupType): number | undefined => highlights.value.get(group.baseAlbum.id);

const tooltipText = (group: AlbumGroupType): string =>
  `#${rank(group)} most played album on Last.fm`;
</script>

<style scoped>

.album-heading {
  align-items: center;
  display: flex;
  gap: 0.4rem;
}

.sort-button {
  margin-left: auto;
  text-transform: none;
}

.albums {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
}

.album-slot {
  position: relative;
}

/* Positioning only — the Tooltip root carries the hover area, so it can't be
   pointer-events: none; it overlaps a corner of the cover, clickable elsewhere.
   Descendant selector on purpose: Tooltip's own root rule sets position:
   relative at equal specificity, and cross-file source order isn't guaranteed. */
.album-slot .rank-badge {
  left: -0.4rem;
  position: absolute;
  top: -0.4rem;
  z-index: 2;
}

.rank-badge-bubble {
  --rank-badge-size: 1.5rem;

  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--bg-color-darker);
  color: var(--font-color-light);
  cursor: help;
  display: flex;
  font-size: var(--font-size-xs);
  height: var(--rank-badge-size);
  justify-content: center;
  width: var(--rank-badge-size);
}
</style>
