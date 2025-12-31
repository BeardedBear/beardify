<template>
  <div>
    <SearchTitle title="Albums" />
    <div class="album-list">
      <template v-if="searchStore.albums.length">
        <Album
          :album="album"
          :exact-search="exactAlbumSearched ? album.name.toLowerCase().includes(exactAlbumSearched) : false"
          :key="index"
          @click="searchStore.reset()"
          class="album"
          v-for="(album, index) in searchStore.albums"
          with-artists
          without-release-date
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

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/search-item" as search;
@use "@/assets/scss/responsive" as responsive;

.album {
  border-radius: 1rem;
  padding: 0.8rem;
  transition: 0.2s;

  @include search.search-item-hover;

  &.exact-search {
    background: var(--bg-color-lighter);

    &::after {
      $size: 0.8rem;

      background-color: var(--primary-color);
      border-radius: $size;
      content: "";
      height: $size;
      left: 0;
      position: "";
      position: absolute;
      top: 0;
      transform: translate(-20%, -20%);
      width: $size;
    }
  }
}

.album-list {
  align-content: start;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));

  @include responsive.mobile {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}
</style>
