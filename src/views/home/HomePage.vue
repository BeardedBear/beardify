<template>
  <div class="loader" v-if="!homeStore.recommendedAlbums.length">
    <Loader />
  </div>
  <div class="home" v-else>
    <div class="home-content">
      <PageFit>
        <div class="title">
          <div class="name">Recommended albums</div>
          <ButtonIndex @click="getData()">
            <i class="icon-refresh"></i>
            Refresh
          </ButtonIndex>
        </div>
        <AlbumGallery :album-list="homeStore.recommendedAlbums" no-title />
      </PageFit>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";

import AlbumGallery from "@/components/album/AlbumGallery.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import PageFit from "@/components/ui/PageFit.vue";
import { useAuth } from "@/views/auth/AuthStore";
import { useHome } from "@/views/home/HomeStore";

const homeStore = useHome();
const authStore = useAuth();

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

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;

  @include responsive.mobile {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .name {
    flex: 1;
    font-size: 2rem;

    @include font-bold;

    @include responsive.mobile {
      font-size: 1.5rem;
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

  @include responsive.mobile {
    padding: 1rem;
  }

  @include responsive.tablet {
    padding: 1rem 2rem;
  }

  @media (width <= 1200px) {
    padding: 1rem 3rem;
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
