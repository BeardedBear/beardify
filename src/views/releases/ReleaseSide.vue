<template>
  <div v-for="category in releasesStore.menu" :key="category.name">
    <div class="title">{{ category.name }}</div>
    <div
      v-for="(slug, index) in category.slugs"
      :key="index"
      class="slug"
      :class="{ selected: releasesStore.activeSlug === slug }"
      @click="releasesStore.setActiveSlug(slug)"
    >
      {{ slug }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useReleases } from "./ReleasesStore";

const releasesStore = useReleases();
releasesStore.getReleases();
</script>

<style lang="scss" scoped>
.title {
  background-color: var(--bg-color-darker);
  color: var(--primary-color);
  font-weight: 700;
  padding: 1rem 0.5rem 0.5rem;
  position: sticky;
  text-transform: uppercase;
  top: 0;
}

.slug {
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  padding: 0.2rem 0.6rem;
  text-transform: capitalize;

  &:hover {
    background-color: var(--bg-color);
  }

  &.selected {
    background-color: var(--primary-color);
    color: white;
  }
}
</style>
