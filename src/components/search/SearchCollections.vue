<template>
  <div v-if="searchStore.query.length" class="collection-strip">
    <SearchTitle :count="matches.length" title="Your collections" />
    <div v-if="matches.length" class="row">
      <router-link
        v-for="playlist in matches"
        :key="playlist.id"
        :to="`${playlist.isCollection ? '/collection/' : '/playlist/'}${playlist.id}`"
        class="hit font-bold"
        @click="searchStore.close()"
      >
        <PlaylistIcon :playlist="playlist" />
        <span class="name">{{ playlist.displayName }}</span>
      </router-link>
    </div>
    <p v-else class="empty">Nothing of yours matches</p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { useSearch } from "@/components/search/SearchStore";
import SearchTitle from "@/components/search/SearchTitle.vue";
import PlaylistIcon from "@/components/sidebar/PlaylistIcon.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";

/*
 * The one search result that costs nothing: collections and playlists are
 * already in the sidebar store, so this matches locally and paints on the first
 * keystroke while the four network columns are still in flight. It doubles as
 * the loading state — something is on screen immediately instead of four "No X
 * found" strings.
 *
 * It also closes a real gap: "Collection" is the product's headline object and
 * was not findable from search at all. You had to know it lived in the sidebar
 * filter instead.
 */
const searchStore = useSearch();
const sidebarStore = useSidebar();

/** Enough to be useful in one strip, few enough not to push the columns down. */
const MAX_HITS = 8;

const matches = computed(() => {
  const needle = searchStore.query.toLowerCase();
  const strip = (name: string): string => name.replace("#Collection ", "").replace("#collection ", "");

  return [
    ...sidebarStore.collections.map((playlist) => ({ ...playlist, isCollection: true })),
    ...sidebarStore.playlists.map((playlist) => ({ ...playlist, isCollection: false })),
  ]
    .map((playlist) => ({ ...playlist, displayName: strip(playlist.name) }))
    .filter((playlist) => playlist.displayName.toLowerCase().includes(needle))
    .slice(0, MAX_HITS);
});
</script>

<style scoped>
.collection-strip {
  border-bottom: 1px solid var(--bg-color-light);
  flex-shrink: 0;
  padding: 0 var(--space-4) var(--space-4);
}

/* Wraps rather than scrolls: this strip must never compete for vertical space
   with the result columns it sits above. */
.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.hit {
  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: 0.3rem;
  color: var(--font-color);
  display: flex;
  font-size: var(--font-size-sm);
  gap: var(--space-2);
  max-width: 16rem;
  padding: var(--space-1) var(--space-3);
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: var(--bg-color-lighter);
  }
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  color: var(--font-color-dark);
  font-size: var(--font-size-sm);
  margin: 0;
}
</style>
