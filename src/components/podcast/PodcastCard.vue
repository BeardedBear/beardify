<template>
  <router-link :to="`/podcasts/${id}`" class="podcast">
    <Cover :images="covers" class="cover" size="medium" />
    <div v-if="name" class="name bd-font-bold">
      {{ name }}
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";

import { Image } from "@/@types/Image";
import Cover from "@/components/ui/AlbumCover.vue";

defineProps<{
  covers: Image[];
  id: string;
  name?: string;
}>();
</script>

<style scoped>

.podcast {
  background-color: var(--bd-bg);
  border-radius: var(--bd-radius-lg);
  color: var(--bd-font-color);
  padding: var(--bd-space-4);
  text-decoration: none;
  transition:
    background-color var(--bd-transition),
    transform var(--bd-transition);
  will-change: transform;

  &:hover {
    transform: scale(1.03);
  }
}

.cover {
  aspect-ratio: 1;
  border-radius: var(--bd-radius-md);
  display: block;
  width: 100%;
}

.name {
  margin-top: var(--bd-space-4);
}
</style>
