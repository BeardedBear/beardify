<template>
  <div class="artist-list">
    <h3 class="search-title">Artists</h3>
    <template v-if="searchStore.artists.length">
      <router-link
        :class="{
          'exact-search': exactArtistSearched === artist.name.toLowerCase(),
        }"
        :key="index"
        :to="`/artist/${artist.id}`"
        @click="searchStore.reset()"
        class="artist"
        v-for="(artist, index) in searchStore.artists"
      >
        <Cover :images="artist.images" class="avatar" size="small" />
        <div>{{ artist.name }}</div>
      </router-link>
    </template>
    <template v-else>No artist found</template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef } from "vue";
import { RouterLink } from "vue-router";

import Cover from "../AlbumCover.vue";
import { useSearch } from "./SearchStore";

const searchStore = useSearch();
const exactArtistSearched: ComputedRef<string | undefined> = computed(() => {
  if (!searchStore.query.includes("  &  ")) return undefined;
  return searchStore.query.split(":")[1].split("&").shift()?.toLowerCase().trim();
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/scss/colors" as colors;

.artist-list {
  .avatar {
    $size: 2.5rem;

    border-radius: $size;
    display: block;
    height: $size;
    width: $size;
  }

  .artist {
    align-items: center;
    border-radius: 0.3rem;
    color: currentcolor;
    display: flex;
    font-size: 0.9rem;
    font-weight: bold;
    gap: 1rem;
    margin-bottom: 0.4rem;
    padding: 0.5rem;
    position: relative;
    text-decoration: none;

    &:hover {
      background-color: var(--bg-color-light);
    }

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

  .search-title {
    color: var(--primary-color);
    font-size: 0.9rem;
    font-weight: bold;
    margin: 0 0 1rem;
    text-transform: uppercase;
  }
}
</style>
