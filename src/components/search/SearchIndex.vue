<template>
  <div class="search">
    <SearchInput />
    <div class="results">
      <SearchArtists />
      <SearchAlbums />
      <SearchSongs />
      <SearchPodcasts />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from "vue";

import SearchAlbums from "@/components/search/SearchAlbums.vue";
import SearchArtists from "@/components/search/SearchArtists.vue";
import SearchInput from "@/components/search/SearchInput.vue";
import SearchPodcasts from "@/components/search/SearchPodcasts.vue";
import SearchSongs from "@/components/search/SearchSongs.vue";
import { useSearch } from "@/components/search/SearchStore";

const searchStore = useSearch();

/*
 * Bound to the component's lifetime. Registered bare at setup scope it was
 * never removed, so every time the search dialog opened it left another
 * Escape handler on document behind it.
 */
function onEscape(keyboardEvent: KeyboardEvent): void {
  if (keyboardEvent.key === "Escape") searchStore.reset();
}

onMounted(() => document.addEventListener("keydown", onEscape));
onBeforeUnmount(() => document.removeEventListener("keydown", onEscape));
</script>

<style scoped>

.search {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.results {
  display: grid;
  font-size: var(--font-size-sm);
  gap: 2rem;
  grid-template-columns: 0.9fr 1fr 0.8fr 0.8fr;
  justify-content: space-evenly;
  left: 0;
  padding: 0.5rem;
  right: 0;
  top: 100%;
  z-index: 999;

  @media (--mobile) {
    gap: 1.5rem;
    grid-template-columns: 1fr;
    padding: 0.5rem;
  }

  @media (--tablet) {
    gap: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
    padding: 0.8rem;
  }
}
</style>
