<template>
  <div class="album-list">
    <template v-if="searchStore.albums.length">
      <Album
        v-for="(album, index) in searchStore.albums"
        :key="index"
        class="album"
        :album="album"
        with-artists
        without-release-date
        :exact-search="exactAlbumSearched ? album.name.toLowerCase().includes(exactAlbumSearched) : false"
        @click="searchStore.reset()"
      />
    </template>
    <template v-else>No album found</template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef } from "vue";
import Album from "../album/AlbumIndex.vue";
import { useSearch } from "./SearchStore";

const searchStore = useSearch();
const exactAlbumSearched: ComputedRef<string | undefined> = computed(() => {
  if (!searchStore.query.includes("  &  ")) return undefined;
  return searchStore.query.split(":").pop()?.toLowerCase();
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

.album {
  border-radius: 1rem;
  padding: 0.8rem;

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
  grid-template-columns: repeat(3, 1fr);
}
</style>
