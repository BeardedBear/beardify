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
        class="artist font-bold"
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

<style scoped>

.artist-list {
  padding: 0 1rem;

  .avatar {
    --avatar-size: 2.5rem;

    border-radius: var(--avatar-size);
    display: block;
    height: var(--avatar-size);
    width: var(--avatar-size);
  }

  .artist {
    align-items: center;
    border-radius: 0.3rem;
    color: currentcolor;
    display: flex;
    font-size: var(--font-size-sm);
    gap: 1rem;
    margin-bottom: 0.4rem;
    padding: 0.5rem;
    position: relative;
    text-decoration: none;
    transition:
        background-color 0.2s ease,
        transform 0.2s ease;

    &:hover {
      background-color: var(--bg-color-light);
      transform: scale(1.03);
    }

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
}
</style>
