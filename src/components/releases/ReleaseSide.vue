<template>
  <div :key="category.name" v-for="category in releasesStore.menu">
    <div class="title">{{ category.name }}</div>
    <div
      :class="{ selected: releasesStore.activeSlug === slug }"
      :key="index"
      @click="releasesStore.setActiveSlug(slug)"
      class="slug"
      v-for="(slug, index) in category.slugs"
    >
      {{ slug }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.title {
  @include font-bold;

  background-color: var(--bg-color-darker);
  color: var(--primary-color);
  padding: 1rem 0.5rem 0.5rem;
  position: sticky;
  text-transform: uppercase;
  top: 0;
}

.slug {
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: var(--font-size-md);

  @include font-bold;

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
