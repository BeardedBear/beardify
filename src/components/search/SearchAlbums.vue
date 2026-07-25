<template>
  <div class="album-wrap">
    <SearchTitle title="Albums" />
    <div class="album-list">
      <template v-if="searchStore.albums.length">
        <Album
          v-for="(album, index) in searchStore.albums"
          :key="index"
          :album="album"
          :exact-search="exactAlbumSearched ? album.name.toLowerCase().includes(exactAlbumSearched) : false"
          class="album"
          with-artists
          without-release-date
          @click="searchStore.reset()"
        />
      </template>
      <template v-else>No album found</template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef } from "vue";

import Album from "@/components/album/AlbumIndex.vue";
import { useSearch } from "@/components/search/SearchStore";
import SearchTitle from "@/components/search/SearchTitle.vue";

const searchStore = useSearch();
const exactAlbumSearched: ComputedRef<string | undefined> = computed(() => {
  if (!searchStore.query.includes("  &  ")) return undefined;
  return searchStore.query.split(":").pop()?.toLowerCase();
});
</script>

<style scoped>

.album {
  border-radius: 1rem;
  padding: 0.8rem;
  transition: 0.2s;

  &:hover {
    background-color: var(--bg-color-light);
    transform: scale(1.03);
  }

  &.exact-search {
    background: var(--bg-color-lighter);

    &::after {
      --dot-size: 0.8rem;

      background-color: var(--primary-color);
      border-radius: var(--dot-size);
      content: "";
      height: var(--dot-size);
      left: 0;
      position: absolute;
      top: 0;
      transform: translate(-20%, -20%);
      width: var(--dot-size);
    }
  }
}

.album-list {
  align-content: start;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));

  @media (width <= 767px) {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}

.album-wrap {
  padding: 0 1rem;
}
</style>
