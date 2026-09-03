<template>
  <div class="album-wrap">
    <SearchTitle :count="searchStore.albums.length" title="Albums" />
    <div class="album-list">
      <template v-if="searchStore.albums.length">
        <Album
          v-for="album in searchStore.albums"
          :key="album.id"
          :album="album"
          :exact-search="!!searchStore.exactAlbum && album.name.toLowerCase().includes(searchStore.exactAlbum)"
          class="album"
          data-search-hit
          with-artists
          without-release-date
          @click="searchStore.close()"
          @keydown.enter="searchStore.close()"
        />
      </template>
      <template v-else-if="searchStore.loading"><BdLoader size="small" /></template>
    <template v-else>No album found</template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";

import Album from "@/components/album/AlbumIndex.vue";
import { useSearch } from "@/components/search/SearchStore";
import SearchTitle from "@/components/search/SearchTitle.vue";

const searchStore = useSearch();
</script>

<style scoped>

.album {
  border-radius: var(--bd-radius-lg);
  padding: var(--bd-space-2);
  transition: background-color var(--bd-transition);

  &:hover {
    background-color: var(--bd-bg-light);
  }

  &.exact-search {
    background: var(--bd-bg-lighter);

    &::after {
      --dot-size: 0.8rem;

      background-color: var(--bd-primary);
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

  @media (--mobile) {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  }
}

.album-wrap {
  padding: 0 var(--bd-space-4);
}
</style>
