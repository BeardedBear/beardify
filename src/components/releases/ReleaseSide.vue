<template>
  <div class="title bd-font-bold">Tracking</div>
  <div class="tags">
    <span v-for="tag in releasesStore.tags" :key="tag" class="tag">{{ tag }}</span>
    <span v-if="!releasesStore.tags.length" class="empty">Nothing tracked — Spotify's picks only.</span>
  </div>
  <BdButton class="edit" size="small" @click="dialogStore.open({ type: 'trackedGenres' })">
    <SlidersHorizontal :size="14" />
    Edit genres
  </BdButton>

  <div class="filters">
    <BdCheckbox v-model="releasesStore.albumsOnly" full-width label="Albums & EPs only" />
    <BdCheckbox v-model="releasesStore.hideChecked" full-width label="Hide listened" />
  </div>

  <div class="counts">{{ releasesStore.visibleReleases.length }} shown · {{ checkedCount }} listened</div>

  <div class="title bd-font-bold">Genres</div>
  <button
    v-for="genre in releasesStore.genreList.slice(0, GENRES_SHOWN)"
    :key="genre.name"
    :class="{ selected: releasesStore.genre === genre.name }"
    class="genre"
    type="button"
    @click="releasesStore.setGenre(genre.name)"
  >
    <span class="name">{{ genre.name }}</span>
    <span class="count">{{ genre.count }}</span>
  </button>
</template>

<script lang="ts" setup>
import { SlidersHorizontal } from "@lucide/vue";
import { BdButton, BdCheckbox } from "bearded-ui";
import { computed } from "vue";

import { useDialog } from "@/components/dialog/DialogStore";
import { useReleases } from "@/views/releases/ReleasesStore";

/*
 * Spotify's genre vocabulary has thousands of entries and a week of releases can
 * surface a few hundred of them, most attached to a single album. The list is
 * sorted by frequency, so cutting it here keeps the ones worth filtering on.
 */
const GENRES_SHOWN = 40;
const releasesStore = useReleases();
const dialogStore = useDialog();

const checkedCount = computed(
  () => releasesStore.releases.filter((release) => releasesStore.checks[release.key]).length,
);

</script>

<style scoped>
.title {
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  padding: var(--bd-space-4) var(--bd-space-2) var(--bd-space-2);
  position: sticky;
  text-transform: uppercase;
  top: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bd-space-1);
  padding: 0 var(--bd-space-2);
}

.tag {
  background-color: var(--bd-bg-lighter);
  border-radius: var(--bd-radius-full);
  font-size: var(--bd-font-size-xs);
  max-width: 100%;
  overflow: hidden;
  padding: 0.15rem var(--bd-space-2);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
}

.edit {
  margin: var(--bd-space-3) var(--bd-space-2) 0;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
  padding-top: var(--bd-space-4);
}

.counts {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: var(--bd-space-2);
}

.genre {
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: inherit;
  cursor: pointer;
  display: flex;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-2);
  justify-content: space-between;
  padding: var(--bd-space-1) var(--bd-space-2);
  text-align: left;
  width: 100%;

  &:hover {
    background-color: var(--bd-bg);
  }

  &.selected {
    background-color: var(--bd-primary);
    color: var(--bd-on-primary);
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .count {
    color: var(--bd-font-color-dark);
    font-size: var(--bd-font-size-xs);
  }

  &.selected .count {
    color: inherit;
  }
}
</style>
