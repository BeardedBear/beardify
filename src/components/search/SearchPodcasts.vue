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
          <div class="name bd-font-bold">
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
  padding: 0 var(--bd-space-4);

  .podcast {
    align-items: center;
    background-color: var(--bd-bg);
    border-radius: var(--bd-radius-md);
    color: currentcolor;
    cursor: pointer;
    display: flex;
    gap: var(--bd-space-3);
    margin-bottom: var(--bd-space-1);
    padding: var(--bd-space-2);
    text-decoration: none;
    transition: background-color var(--bd-transition);

    &:hover {
      background-color: var(--bd-bg-light);
    }
  }
}

.cover {
  border-radius: var(--bd-radius-sm);
  height: 3rem;
  width: 3rem;
}

.content {
  flex: 1;
}

.name {
  font-size: var(--bd-font-size-sm);
  margin-bottom: 0;
}

.publisher {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
}
</style>
