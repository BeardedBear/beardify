<template>
  <div v-if="genreStore.loading" class="loader">
    <Loader />
  </div>
  <div v-else ref="scrollRef" class="genre" @scroll="onScroll">
    <div class="content">
      <div class="title">{{ genreStore.genre }}</div>
      <div v-if="genreStore.artists.length" class="gallery">
        <a
          v-for="artist in genreStore.artists"
          :key="artist.id ?? artist.name"
          :ref="(el) => observeItem(el as Element | null, artist)"
          class="item"
          :class="{ resolving: resolvingName === artist.name }"
          href="#"
          @click.prevent="goToArtist(artist)"
        >
          <Cover :images="artist.images" class="cover" size="medium" />
          <Loader v-if="resolvingName === artist.name" class="spinner" />
          <div class="name">{{ artist.name }}</div>
        </a>
      </div>
      <div v-else class="empty">No artist found for this genre</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import Cover from "@/components/ui/AlbumCover.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { GenreArtist, useGenre } from "@/views/genre/GenreStore";

const props = defineProps<{ name: string }>();
const genreStore = useGenre();
const router = useRouter();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);
const resolvingName = ref<null | string>(null);

// Last.fm gives no real photos, so the only way to get one is resolving the
// artist on Spotify (see GenreStore for why that isn't done for the whole
// list up front). Instead, each card is watched with an IntersectionObserver
// and only resolved once it actually scrolls into view — cost scales with
// what the user browses, not with the full ~30-artist list.
const itemEls = new Map<Element, GenreArtist>();
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const artist = itemEls.get(entry.target);
      observer.unobserve(entry.target);
      itemEls.delete(entry.target);
      if (artist) genreStore.resolveArtist(artist);
    });
  },
  { rootMargin: "300px" },
);

onBeforeUnmount(() => observer.disconnect());

function observeItem(el: Element | null, artist: GenreArtist) {
  if (!el) return;
  itemEls.set(el, artist);
  observer.observe(el);
}

watch(
  () => props.name,
  (name) => {
    itemEls.clear();
    observer.disconnect();
    genreStore.getArtists(name);
  },
  { immediate: true },
);

async function goToArtist(artist: GenreArtist) {
  if (resolvingName.value) return;
  resolvingName.value = artist.name;
  try {
    const id = await genreStore.resolveArtist(artist);
    if (id) router.push(`/artist/${id}`);
  } finally {
    resolvingName.value = null;
  }
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.loader {
  display: grid;
  place-content: center;
}

.genre {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
}

.content {
  margin: 0 auto;
  max-width: 100rem;
  padding: 2rem 4rem;

  @include responsive.mobile {
    padding: 1rem;
  }

  @include responsive.tablet {
    padding: 1.5rem 2rem;
  }
}

.title {
  font-size: var(--font-size-xl);
  margin-bottom: 2rem;
  text-transform: capitalize;

  @include font-bold;
}

.gallery {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
}

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

.empty {
  opacity: 0.6;
  padding: 2rem 4rem;
}
</style>
