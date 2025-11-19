<template>
  <div class="search">
    <SearchInput />
    <div class="results" ref="result">
      <SearchArtists />
      <SearchAlbums />
      <SearchSongs />
      <SearchPodcasts />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import SearchAlbums from "@/components/search/SearchAlbums.vue";
import SearchArtists from "@/components/search/SearchArtists.vue";
import SearchInput from "@/components/search/SearchInput.vue";
import SearchPodcasts from "@/components/search/SearchPodcasts.vue";
import SearchSongs from "@/components/search/SearchSongs.vue";
import { useSearch } from "@/components/search/SearchStore";

const searchStore = useSearch();
const result = ref<HTMLDivElement | null>(null);

document.addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
  if (keyboardEvent.key === "Escape") searchStore.reset();
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;

.search {
  flex: 1;
  position: relative;
}

.results {
  display: grid;
  font-size: 0.8rem;
  gap: 2rem;
  grid-template-columns: 0.6fr 1fr 0.8fr 0.8fr;
  justify-content: space-evenly;
  left: 0;
  padding: 1rem;
  right: 0;
  top: 100%;
  z-index: 999;
}
</style>
