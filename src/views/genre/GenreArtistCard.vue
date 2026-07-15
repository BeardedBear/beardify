<template>
  <a
    ref="itemRef"
    class="item"
    :class="{ resolving }"
    href="#"
    @click.prevent="goToArtist"
  >
    <Cover :images="artist.images" class="cover" size="medium" />
    <Loader v-if="resolving" class="spinner" />
    <div class="name">{{ artist.name }}</div>
  </a>
</template>

<script lang="ts" setup>
import { useIntersectionObserver } from "@vueuse/core";
import { ref } from "vue";
import { useRouter } from "vue-router";

import Cover from "@/components/ui/AlbumCover.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import { GenreArtist, useGenre } from "@/views/genre/GenreStore";

const props = defineProps<{ artist: GenreArtist }>();
const genreStore = useGenre();
const router = useRouter();
const itemRef = ref<HTMLElement | null>(null);
const resolving = ref(false);

// Last.fm gives no real photos (see GenreStore), so a photo only exists once
// this artist is resolved on Spotify. Resolving all ~30 cards up front would
// spam Spotify just to render the grid, so each card resolves itself lazily
// the moment it scrolls into view.
const { stop } = useIntersectionObserver(
  itemRef,
  ([entry]) => {
    if (!entry?.isIntersecting) return;
    stop();
    genreStore.resolveArtist(props.artist);
  },
  { rootMargin: "300px" },
);

async function goToArtist(): Promise<void> {
  if (resolving.value) return;
  resolving.value = true;
  try {
    const id = await genreStore.resolveArtist(props.artist);
    if (id) router.push(`/artist/${id}`);
  } finally {
    resolving.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.item {
  border-radius: 0.5rem;
  color: var(--font-color);
  cursor: pointer;
  padding: 1rem;
  position: relative;
  text-align: center;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;

  @include font-bold;

  &:hover {
    background-color: var(--bg-color-light);
    transform: scale(1.05);

    .name {
      color: var(--primary-color);
    }
  }

  &.resolving .cover {
    opacity: 0.4;
  }
}

.cover {
  aspect-ratio: 1;
  border-radius: 100%;
  margin-bottom: 0.7rem;
  object-fit: cover;
  transition: opacity 0.2s ease;
  width: 100%;
}

.spinner {
  left: 50%;
  position: absolute;
  top: calc(50% - 0.8rem);
  transform: translate(-50%, -50%);
}

.name {
  font-size: var(--font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
  white-space: nowrap;
}
</style>
