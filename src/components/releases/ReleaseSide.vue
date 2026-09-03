<template>
  <div class="filters">
    <BdCheckbox v-model="releasesStore.hideChecked" full-width label="Hide listened" />
  </div>

  <div class="counts">{{ releasesStore.visibleReleases.length }} shown · {{ releasesStore.checkedCount }} listened</div>

  <div class="title bd-font-bold">
    <span>Genres</span>
    <button v-if="releasesStore.genres.length" class="clear" type="button" @click="releasesStore.genres = []">
      Clear
    </button>
  </div>
  <BdInput v-model="query" class="genre-search" placeholder="Filter genres" size="small" type="search" />
  <div class="genres">
    <button
      v-for="genre in shownGenres"
      :key="genre.name"
      :aria-pressed="isSelected(genre.name)"
      class="genre"
      type="button"
      @click="releasesStore.toggleGenre(genre.name)"
    >
      <span class="name">{{ genre.name }}</span>
      <span class="count">{{ genre.count }}</span>
    </button>
    <span v-if="!shownGenres.length" class="no-match">No genre matches “{{ query }}”.</span>
    <button v-if="hasMore" class="show-more" type="button" @click="showMore()">Show more</button>
  </div>
</template>

<script lang="ts" setup>
import { BdCheckbox, BdInput } from "bearded-ui";
import { computed, ref } from "vue";

import { normalizeTag } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

/*
 * A week of releases can surface a few hundred genres, most attached to a single
 * album. The list is sorted by frequency, so cutting it here keeps the ones worth
 * filtering on — and "Show more" reveals the next batch of the same size.
 */
const GENRES_STEP = 12;
const releasesStore = useReleases();

const query = ref("");
const visible = ref(GENRES_STEP);

/* The query narrows the frequency-sorted list; the cap keeps it from becoming a wall of options. */
const matches = computed(() => {
  // Normalized the way a genre is stored, so "black  metal" matches here too.
  const needle = normalizeTag(query.value);
  if (!needle) return releasesStore.genreList;

  return releasesStore.genreList.filter((genre) => genre.name.toLowerCase().includes(needle));
});

/*
 * Selected genres are pinned above the rest and escape both the search and the cap:
 * a filter the user cannot see is a filter they cannot lift, and picking a rare genre
 * then typing anything else would push it out of a twelve-row list.
 */
const picked = computed(() => releasesStore.genreList.filter((genre) => isSelected(genre.name)));
const rest = computed(() => matches.value.filter((genre) => !isSelected(genre.name)));

const shownGenres = computed(() => [...picked.value, ...rest.value.slice(0, visible.value)]);

const hasMore = computed(() => rest.value.length > visible.value);

function isSelected(name: string): boolean {
  return releasesStore.genres.includes(name);
}

function showMore(): void {
  visible.value += GENRES_STEP;
}
</script>

<style scoped>
.title {
  align-items: baseline;
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  display: flex;
  justify-content: space-between;
  padding: var(--bd-space-4) var(--bd-space-2) var(--bd-space-2);
  text-transform: uppercase;
}

.clear {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: var(--bd-font-size-xs);
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
  padding: var(--bd-space-4) var(--bd-space-2) 0;
}

.counts {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: var(--bd-space-2) var(--bd-space-2) var(--bd-space-1);
}

.genre-search {
  padding: 0 var(--bd-space-2) var(--bd-space-2);
}

.genres {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
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
  margin: 0 var(--bd-space-2);
  padding: var(--bd-space-1) var(--bd-space-2);
  text-align: left;
  width: calc(100% - var(--bd-space-4));

  &:hover {
    background-color: var(--bd-bg);
  }

  &[aria-pressed="true"] {
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

  &[aria-pressed="true"] .count {
    color: inherit;
  }
}

.no-match {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: var(--bd-space-1) var(--bd-space-2);
}

.show-more {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--bd-primary);
  cursor: pointer;
  font-size: var(--bd-font-size-xs);
  margin: var(--bd-space-1) var(--bd-space-2);
  padding: var(--bd-space-1) var(--bd-space-2);
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
}
</style>
