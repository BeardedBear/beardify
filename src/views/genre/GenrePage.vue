<template>
  <div v-if="genreStore.loading" class="loader">
    <Loader />
  </div>
  <div v-else ref="scrollRef" class="genre" @scroll="onScroll">
    <div class="content">
      <div class="title">{{ genreStore.genre }}</div>
      <div v-if="genreStore.artists.length" class="gallery">
        <GenreArtistCard
          v-for="artist in genreStore.artists"
          :key="artist.id ?? artist.name"
          :artist="artist"
        />
      </div>
      <div v-else class="empty">No artist found for this genre</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

import Loader from "@/components/ui/LoadingDots.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import GenreArtistCard from "@/views/genre/GenreArtistCard.vue";
import { useGenre } from "@/views/genre/GenreStore";

const props = defineProps<{ name: string }>();
const genreStore = useGenre();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);

watch(
  () => props.name,
  (name) => genreStore.getArtists(name),
  { immediate: true },
);
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

.empty {
  opacity: 0.6;
  padding: 2rem 4rem;
}
</style>
