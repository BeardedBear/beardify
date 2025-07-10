<template>
  <div class="podcast-list">
    <SearchTitle title="Podcasts" />
    <template v-if="searchStore.podcasts.length">
      <router-link
        :key="index"
        :to="`/podcasts/${podcast.id}`"
        @click="searchStore.reset()"
        class="podcast"
        v-for="(podcast, index) in searchStore.podcasts"
      >
        <img :src="podcast.images?.[1]?.url || podcast.images?.[0]?.url" class="cover" />
        <div class="content">
          <div class="name">{{ podcast.name }}</div>
          <div class="publisher" v-if="podcast.publisher">{{ podcast.publisher }}</div>
        </div>
      </router-link>
    </template>
    <template v-else>No podcast found</template>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";

import { useSearch } from "./SearchStore";
import SearchTitle from "./SearchTitle.vue";

const searchStore = useSearch();
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/scss/colors" as colors;

.podcast-list {
  .podcast {
    align-items: center;
    background-color: var(--bg-color);
    border-radius: 0.5rem;
    color: currentcolor;
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    padding: 0.8rem;
    text-decoration: none;
    transition: 0.2s;

    &:hover {
      background-color: var(--bg-color-light);
      transform: scale(1.02);
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
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
}

.publisher {
  color: var(--text-color-light);
  font-size: 0.8rem;
  opacity: 0.7;
}
</style>
