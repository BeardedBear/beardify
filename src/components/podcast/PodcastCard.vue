<template>
  <router-link :to="`/podcasts/${id}`" class="podcast">
    <Cover :images="covers" class="cover" size="medium" />
    <div v-if="name" class="name bd-font-bold">
      {{ name }}
    </div>
    <div v-if="publisher || episodes" class="metas">
      <span v-if="publisher">{{ publisher }}</span>
      <span v-if="publisher && episodes">&nbsp;·&nbsp;</span>
      <span v-if="episodes">{{ episodes }} episodes</span>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";

import { Image } from "@/@types/Image";
import Cover from "@/components/ui/AlbumCover.vue";

defineProps<{
  covers: Image[];
  episodes?: number;
  id: string;
  name?: string;
  publisher?: string;
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

  @media (prefers-reduced-motion: reduce) {
    transition: background-color var(--bd-transition);

    &:hover {
      transform: none;
    }
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

.metas {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  margin-top: var(--bd-space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
