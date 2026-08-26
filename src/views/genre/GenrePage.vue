<template>
  <div v-if="genreStore.loading" class="loader">
    <BdLoader />
  </div>
  <div v-else ref="scrollRef" class="genre" @scroll="onScroll">
    <div class="content">
      <h1 class="title bd-font-bold">{{ genreStore.genre }}</h1>
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
import { BdLoader } from "bearded-ui";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

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

<style scoped>

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
  padding: var(--bd-space-6) var(--bd-space-8);

  @media (--mobile) {
    padding: var(--bd-space-4);
  }

  @media (--tablet) {
    padding: var(--bd-space-5) var(--bd-space-6);
  }
}

.title {
  font-size: var(--bd-font-size-xl);
  margin-bottom: var(--bd-space-6);
  text-transform: capitalize;
}

.gallery {
  display: grid;
  gap: var(--bd-space-2);
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
}

.empty {
  opacity: 0.6;
  padding: var(--bd-space-6) var(--bd-space-8);
}
</style>
