<template>
  <div class="artist-list">
    <SearchTitle title="Artists" />
    <template v-if="searchStore.artists.length">
      <router-link
        v-for="(artist, index) in searchStore.artists"
        :key="index"
        :class="{
          'exact-search': exactArtistSearched === artist.name.toLowerCase(),
        }"
        :to="`/artist/${artist.id}`"
        class="artist"
        @click="searchStore.reset()"
      >
        <Cover :images="artist.images" class="avatar" size="small" />
        <div class="artist-name">
          <div class="name">{{ artist.name }}</div>
          <div v-if="artist.genres.length" class="genres">
            <span v-for="genre in artist.genres" :key="genre" class="genre">{{ genre }}</span>
          </div>
        </div>
      </router-link>
    </template>
    <template v-else>No artist found</template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef } from "vue";
import { RouterLink } from "vue-router";

import { useSearch } from "@/components/search/SearchStore";
import SearchTitle from "@/components/search/SearchTitle.vue";
import Cover from "@/components/ui/AlbumCover.vue";

const searchStore = useSearch();
const exactArtistSearched: ComputedRef<string | undefined> = computed(() => {
  if (!searchStore.query.includes("  &  ")) return undefined;
  return searchStore.query.split(":")[1].split("&").shift()?.toLowerCase().trim();
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/search-item" as search;
@use "@/assets/scss/mixins" as *;

.artist-list {
  padding: 0 1rem;

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
    font-size: var(--font-size-sm);

    @include font-bold;

    gap: 1rem;
    margin-bottom: 0.4rem;
    padding: 0.5rem;
    position: relative;
    text-decoration: none;
    transition: 0.2s;

    @include search.search-item-hover;

    .artist-name {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;

    }

    .genres {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      margin-bottom: 0.15rem;

      .genre {
        background: var(--bg-color-lighter);
        border-radius: 0.2rem;
        color: var(--font-color-light);
        font-size: 0.65rem;
        padding: 0.1rem 0.35rem;
        text-transform: capitalize;
      }
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
        position: absolute;
        top: 0;
        transform: translate(-20%, -20%);
        width: $size;
      }
    }
  }
}
</style>
