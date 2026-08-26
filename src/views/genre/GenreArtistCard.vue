<template>
  <a
    ref="itemRef"
    class="item bd-font-bold"
    :class="{ resolving }"
    href="#"
    @click.prevent="goToArtist"
  >
    <Cover :images="artist.images" class="cover" size="medium" />
    <BdLoader v-if="resolving" class="spinner" />
    <div class="name">{{ artist.name }}</div>
  </a>
</template>

<script lang="ts" setup>
import { useIntersectionObserver } from "@vueuse/core";
import { BdLoader } from "bearded-ui";
import { ref } from "vue";
import { useRouter } from "vue-router";

import Cover from "@/components/ui/AlbumCover.vue";
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

<style scoped>

/* Declared before .item so the higher-specificity overrides nested in it come later. */
.cover {
  aspect-ratio: 1;
  border-radius: var(--bd-radius-full);
  margin-bottom: var(--bd-space-3);
  object-fit: cover;
  transition: opacity var(--bd-transition);
  width: 100%;
}

.name {
  font-size: var(--bd-font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--bd-transition);
  white-space: nowrap;
}

.item {
  border-radius: var(--bd-radius-md);
  color: var(--bd-font-color);
  cursor: pointer;
  padding: var(--bd-space-4);
  position: relative;
  text-align: center;
  text-decoration: none;
  transition:
    background-color var(--bd-transition),
    transform var(--bd-transition);

  &:hover {
    background-color: var(--bd-bg-light);
    transform: scale(1.05);

    .name {
      color: var(--bd-primary);
    }
  }

  &.resolving .cover {
    opacity: 0.4;
  }
}

/*
 * Auto margins rather than a transform — BdLoader spins with `rotate`, and a
 * transform here would turn the spin into an orbit. The bottom inset pulls the
 * centre 0.8rem up, clear of the label.
 */
.spinner {
  inset: 0 0 var(--bd-space-5);
  margin: auto;
  position: absolute;
}
</style>
