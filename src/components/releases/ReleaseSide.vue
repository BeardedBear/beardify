<template>
  <div v-for="category in releasesStore.menu" :key="category.name">
    <div class="title bd-font-bold">
      {{ category.name }}
    </div>
    <div
      v-for="(slug, index) in category.slugs"
      :key="index"
      :class="{ selected: releasesStore.activeSlug === slug }"
      class="slug bd-font-bold"
      @click="releasesStore.setActiveSlug(slug)"
    >
      {{ slug }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();
</script>

<style scoped>

.title {
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  padding: var(--bd-space-4) var(--bd-space-2) var(--bd-space-2);
  position: sticky;
  text-transform: uppercase;
  top: 0;
}

.slug {
  border-radius: var(--bd-radius-sm);
  cursor: pointer;
  font-size: var(--bd-font-size-sm);
  padding: var(--bd-space-1) var(--bd-space-2);
  text-transform: capitalize;

  &:hover {
    background-color: var(--bd-bg);
  }

  &.selected {
    background-color: var(--bd-primary);
    color: white;
  }
}
</style>
