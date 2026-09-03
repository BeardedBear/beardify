<template>
  <div class="artist-list">
    <SearchTitle :count="searchStore.artists.length" title="Artists" />
    <template v-if="searchStore.artists.length">
      <router-link
        v-for="artist in searchStore.artists"
        :key="artist.id"
        :class="{
          'exact-search': searchStore.exactArtist === artist.name.toLowerCase(),
        }"
        :to="`/artist/${artist.id}`"
        class="artist bd-font-bold"
        data-search-hit
        @click="searchStore.close()"
      >
        <Cover :images="artist.images" class="avatar" size="small" />
        <div class="artist-name">
          <div class="name">{{ artist.name }}</div>
          <div v-if="artist.genres.length" class="genres">
            <span v-for="genre in artist.genres.slice(0, 3)" :key="genre" class="genre">{{ genre }}</span>
          </div>
        </div>
      </router-link>
    </template>
    <template v-else-if="searchStore.loading"><BdLoader size="small" /></template>
    <template v-else>No artist found</template>
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";
import { RouterLink } from "vue-router";

import { useSearch } from "@/components/search/SearchStore";
import SearchTitle from "@/components/search/SearchTitle.vue";
import Cover from "@/components/ui/AlbumCover.vue";

const searchStore = useSearch();
</script>

<style scoped>

.artist-list {
  padding: 0 var(--bd-space-4);

  .avatar {
    --avatar-size: 2.5rem;

    border-radius: var(--avatar-size);
    display: block;
    height: var(--avatar-size);
    width: var(--avatar-size);
  }

  .artist {
    align-items: center;
    border-radius: var(--bd-radius-sm);
    color: currentcolor;
    display: flex;
    font-size: var(--bd-font-size-sm);
    gap: var(--bd-space-3);
    margin-bottom: var(--bd-space-1);
    padding: var(--bd-space-2);
    position: relative;
    text-decoration: none;
    transition: background-color var(--bd-transition);

    &:hover {
      background-color: var(--bd-bg-light);
    }

    .artist-name {
      display: flex;
      flex-direction: column;
      gap: var(--bd-space-1);

    }

    .genres {
      display: flex;
      flex-wrap: wrap;
      gap: var(--bd-space-1);
      margin-bottom: 0;

      .genre {
        background: var(--bd-bg-lighter);
        border-radius: var(--bd-radius-sm);
        color: var(--bd-font-color-light);
        font-size: 0.65rem;
        padding: 0 var(--bd-space-1);
        text-transform: capitalize;
      }
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
}
</style>
