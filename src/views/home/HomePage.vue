<template>
  <div v-if="!homeStore.recommendedAlbums.length" class="loader">
    <BdLoader />
  </div>
  <div v-else class="home">
    <div ref="scrollRef" class="home-content" @scroll="onScroll">
      <PageFit>
        <div class="title">
          <div class="name font-bold">Recommended albums</div>
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
import { BdButton, BdLoader } from "bearded-ui";
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
  margin-bottom: 3rem;

  @media (--mobile) {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .name {
    flex: 1;
    font-size: var(--font-size-xl);

    @media (--mobile) {
      font-size: var(--font-size-lg);
    }
  }
}

.home {
  animation: pop-content 1s ease both;
  display: grid;
  line-break: anywhere;
  overflow: hidden;
}

.home-content {
  overflow-y: auto;
  padding: 1rem 5rem;
  transition: padding ease 0.2s;

  @media (--mobile) {
    padding: 1rem;
  }

  @media (--tablet) {
    padding: 1rem 2rem;
  }

  @media (--narrow-desktop-down) {
    padding: 1rem 3rem;
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
