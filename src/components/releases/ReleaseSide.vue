<template>
  <div class="title bd-font-bold">Tracking</div>
  <div class="tags">
    <span v-for="tag in releasesStore.tags" :key="tag" class="tag">{{ tag }}</span>
    <span v-if="!releasesStore.tags.length" class="empty">Nothing tracked — the whole feed.</span>
  </div>
  <BdButton class="edit" size="small" @click="dialogStore.open({ type: 'trackedGenres' })">
    <SlidersHorizontal :size="14" />
    Edit genres
  </BdButton>

  <div class="filters">
    <BdCheckbox v-model="releasesStore.hideChecked" full-width label="Hide listened" />
  </div>

  <div class="counts">{{ releasesStore.visibleReleases.length }} shown · {{ releasesStore.checkedCount }} listened</div>

  <div class="title bd-font-bold">Genres</div>
  <BdInput v-model="query" class="genre-search" placeholder="Filter genres" size="small" type="search" />
  <div class="genres">
    <button
      v-for="genre in shownGenres"
      :key="genre.name"
      :aria-pressed="releasesStore.genre === genre.name"
      :class="{ selected: releasesStore.genre === genre.name }"
      class="genre"
      type="button"
      @click="releasesStore.setGenre(genre.name)"
    >
      <span class="name">{{ genre.name }}</span>
      <span class="count">{{ genre.count }}</span>
    </button>
    <span v-if="!shownGenres.length" class="no-match">No genre matches “{{ query }}”.</span>
    <button v-if="hasMore" class="show-more" type="button" @click="showMore()">Show more</button>
  </div>
</template>

<script lang="ts" setup>
import { SlidersHorizontal } from "@lucide/vue";
import { BdButton, BdCheckbox, BdInput } from "bearded-ui";
import { computed, ref } from "vue";

import { useDialog } from "@/components/dialog/DialogStore";
import { normalizeTag } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

/*
 * A week of releases can surface a few hundred genres, most attached to a single
 * album. The list is sorted by frequency, so cutting it here keeps the ones worth
 * filtering on — and "Show more" reveals the next batch of the same size.
 */
const GENRES_STEP = 12;
const releasesStore = useReleases();
const dialogStore = useDialog();

const query = ref("");
const visible = ref(GENRES_STEP);

/* The query narrows the frequency-sorted list; the cap keeps it from becoming a wall of options. */
const matches = computed(() => {
  // Normalized the way a tracked genre is, so "black  metal" matches here too.
  const needle = normalizeTag(query.value);
  if (!needle) return releasesStore.genreList;

  return releasesStore.genreList.filter((genre) => genre.name.toLowerCase().includes(needle));
});

const shownGenres = computed(() => matches.value.slice(0, visible.value));

const hasMore = computed(() => matches.value.length > visible.value);

function showMore(): void {
  visible.value += GENRES_STEP;
}
</script>

<style scoped>
.title {
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  padding: var(--bd-space-4) var(--bd-space-2) var(--bd-space-2);
  text-transform: uppercase;
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
