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
import SearchAlbums from "@/components/search/SearchAlbums.vue";
import SearchArtists from "@/components/search/SearchArtists.vue";
import SearchInput from "@/components/search/SearchInput.vue";
import SearchPodcasts from "@/components/search/SearchPodcasts.vue";
import SearchSongs from "@/components/search/SearchSongs.vue";
import { useSearch } from "@/components/search/SearchStore";

const searchStore = useSearch();

document.addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
  if (keyboardEvent.key === "Escape") searchStore.reset();
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.search {
  flex: 1;
  overflow-y: auto;
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

  @include responsive.mobile {
    gap: 1.5rem;
    grid-template-columns: 1fr;
    padding: 0.5rem;
  }

  @include responsive.tablet {
    gap: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
    padding: 0.8rem;
  }
}
</style>
