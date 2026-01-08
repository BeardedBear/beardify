<template>
  <router-link :to="`/podcasts/${id}`" class="podcast">
    <img :src="covers[1].url" class="cover" />
    <div v-if="name" class="name">
      {{ name }}
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";

import { Image } from "@/@types/Image";

defineProps<{
  covers: Image[];
  id: string;
  name?: string;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.podcast {
  background-color: var(--bg-color);
  border-radius: 1rem;
  color: var(--font-color);
  padding: 1rem;
  text-decoration: none;
  transition: 0.2s;
  will-change: transform;

  &:hover {
    transform: scale(1.03);
  }
}

.cover {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  display: block;
  width: 100%;
}

.name {
  @include font-bold;

  margin-top: 1rem;
}
</style>
