<template>
  <div class="podcast-list">
    <SearchTitle :count="searchStore.podcasts.length" title="Podcasts" />
    <template v-if="searchStore.podcasts.length">
      <router-link
        v-for="podcast in searchStore.podcasts"
        :key="podcast.id"
        :to="`/podcasts/${podcast.id}`"
        class="podcast"
        data-search-hit
        @click="searchStore.close()"
      >
        <img :src="coverUrl(podcast.images, 'medium')" alt="" class="cover" />
        <div class="content">
          <div class="name font-bold">
            {{ podcast.name }}
          </div>
          <div v-if="podcast.publisher" class="publisher">
            {{ podcast.publisher }}
          </div>
        </div>
      </router-link>
    </template>
    <template v-else-if="searchStore.loading"><BdLoader size="small" /></template>
    <template v-else>No podcast found</template>
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";
import { RouterLink } from "vue-router";

import { useSearch } from "@/components/search/SearchStore";
import SearchTitle from "@/components/search/SearchTitle.vue";
import { coverUrl } from "@/helpers/cover";

const searchStore = useSearch();
</script>

<style scoped>

.podcast-list {
  padding: 0 var(--space-4);

  .podcast {
    align-items: center;
    background-color: var(--bg-color);
    border-radius: 0.5rem;
    color: currentcolor;
    cursor: pointer;
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-1);
    padding: var(--space-2);
    text-decoration: none;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--bg-color-light);
    }
  }
}

.cover {
  border-radius: 0.3rem;
  height: 3rem;
  width: 3rem;
}

.content {
  flex: 1;
}

.name {
  font-size: var(--font-size-sm);
  margin-bottom: 0;
}

.publisher {
  color: var(--font-color-dark);
  font-size: var(--font-size-xs);
}
</style>
