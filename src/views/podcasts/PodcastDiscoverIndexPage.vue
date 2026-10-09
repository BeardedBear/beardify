<template>
  <div ref="scrollRef" class="discover" @scroll="onScroll">
    <div class="content">
      <div class="title">
        <router-link class="back" to="/podcasts">
          <ChevronLeft :size="16" />
          Podcasts
        </router-link>
        <h1 class="name bd-font-bold">Discover podcasts</h1>
      </div>
      <div class="categories">
        <router-link
          v-for="category in PODCAST_CATEGORIES"
          :key="category.id"
          class="category bd-font-bold bd-squircle"
          :to="`/podcasts/discover/${category.id}`"
        >
          <component :is="ICONS[category.icon]" :size="20" />
          {{ category.label }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Component } from "vue";

import {
  BookOpen,
  Briefcase,
  ChevronLeft,
  Cpu,
  Drama,
  FlaskConical,
  Globe,
  GraduationCap,
  HeartPulse,
  Landmark,
  Music,
  Newspaper,
  Palette,
  Siren,
  Trophy,
} from "@lucide/vue";
import { ref } from "vue";
import { useRoute } from "vue-router";

import { PODCAST_CATEGORIES } from "@/components/podcast/podcastCategories";
import { useScrollRestore } from "@/composables/useScrollRestore";

// Keyed by the string stored in PODCAST_CATEGORIES so the list stays data,
// not a chain of v-if branches.
const ICONS: Record<string, Component> = {
  BookOpen,
  Briefcase,
  Cpu,
  Drama,
  FlaskConical,
  Globe,
  GraduationCap,
  HeartPulse,
  Landmark,
  Music,
  Newspaper,
  Palette,
  Siren,
  Trophy,
} as const;

const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);
</script>

<style scoped>

.discover {
  animation: pop-content 1s ease both;
  overflow-y: auto;
}

.content {
  margin: 0 auto;
  padding: var(--bd-space-6);
  width: 100%;
}

.title {
  margin-bottom: var(--bd-space-6);

  .name {
    font-size: var(--bd-font-size-xl);
    margin-top: var(--bd-space-2);
  }
}

.back {
  align-items: center;
  color: var(--bd-font-color-dark);
  display: inline-flex;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-1);
  text-decoration: none;

  &:hover {
    color: var(--bd-font-color);
  }
}

.categories {
  display: grid;
  gap: var(--bd-space-3);
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));

  @media (--mobile) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.category {
  align-items: center;
  background-color: var(--bd-bg);
  border-radius: var(--bd-radius-lg);
  color: var(--bd-font-color);
  display: flex;
  gap: var(--bd-space-3);
  padding: var(--bd-space-4);
  text-decoration: none;
  transition: background-color var(--bd-transition);

  &:hover {
    background-color: var(--bd-bg-light);
  }
}
</style>
