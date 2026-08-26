<template>
  <div v-if="homeStore.loading" class="loader">
    <BdLoader />
  </div>
  <BdEmptyState
    v-else-if="homeStore.error"
    action-label="Try again"
    message="Spotify did not return recommendations. This can happen when the service is busy."
    title="Could not load recommendations"
    @action="getData()"
  >
    <template #icon><i class="icon-warning" /></template>
  </BdEmptyState>
  <BdEmptyState
    v-else-if="!homeStore.recommendedAlbums.length"
    action-label="Refresh"
    message="Recommendations are built from the artists you listen to most. Play a few albums and come back."
    title="Nothing to recommend yet"
    @action="getData()"
  >
    <template #icon><i class="icon-album" /></template>
  </BdEmptyState>
  <div v-else class="home">
    <div ref="scrollRef" class="home-content" @scroll="onScroll">
      <PageFit>
        <div class="title">
          <h1 class="name bd-font-bold">Recommended albums</h1>
          <BdButton @click="getData()">
            <i class="icon-refresh" />
            Refresh
          </BdButton>
        </div>
        <AlbumGallery :album-list="homeStore.recommendedAlbums" no-title />
      </PageFit>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdEmptyState, BdLoader } from "bearded-ui";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

import AlbumGallery from "@/components/album/AlbumGallery.vue";
import PageFit from "@/components/ui/PageFit.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { useAuth } from "@/views/auth/AuthStore";
import { useHome } from "@/views/home/HomeStore";

const homeStore = useHome();
const authStore = useAuth();
const scrollRef = ref<HTMLElement | null>(null);
const { onScroll } = useScrollRestore(`scroll-${useRoute().path}`, scrollRef);

function getData(): void {
  homeStore.clean().finally(() => {
    homeStore.getRecommendedAlbums();
  });
}

getData();

// Optimized: watch specific property instead of entire store
watch(
  () => authStore.me,
  () => {
    if (!homeStore.recommendedAlbums.length) getData();
  },
);
</script>

<style scoped>

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--bd-space-7);

  @media (--mobile) {
    flex-direction: column;
    gap: var(--bd-space-4);
    margin-bottom: var(--bd-space-6);
  }

  .name {
    flex: 1;
    font-size: var(--bd-font-size-xl);

    @media (--mobile) {
      font-size: var(--bd-font-size-lg);
    }
  }
}

.home {
  animation: pop-content 1s ease both;
  display: grid;
  line-break: anywhere;
  overflow: hidden;
}

/*
 * Trois media queries redéclaraient ici la même échelle que --page-inset, à
 * partir d'un 5rem que le token avait déjà remplacé par 3rem sur la collection.
 * Le bord gauche sautait donc de 3 à 5rem en passant d'une route à l'autre.
 */
.home-content {
  overflow-y: auto;
  padding: var(--bd-space-4) var(--page-inset);
}

.loader {
  display: grid;
  place-content: center;
}
</style>
