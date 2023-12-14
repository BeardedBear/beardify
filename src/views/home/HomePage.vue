<template>
  <div class="loader" v-if="!homeStore.recommendedAlbums.length">
    <Loader />
  </div>
  <div class="home" v-else>
    <div class="home__content">
      <PageFit>
        <div class="title">
          <div class="name">Recommended albums</div>
          <button @click="getData()" class="button">
            <i class="icon-refresh"></i>
            Refresh
          </button>
        </div>
        <AlbumGallery :album-list="homeStore.recommendedAlbums" no-title />
      </PageFit>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch } from "vue";

import AlbumGallery from "../../components/AlbumGallery.vue";
import Loader from "../../components/LoadingDots.vue";
import PageFit from "../../components/PageFit.vue";
import { useAuth } from "../auth/AuthStore";
import { useHome } from "./HomeStore";

const homeStore = useHome();
const authStore = useAuth();

function getData(): void {
  homeStore.clean().finally(() => {
    homeStore.getRecommendedAlbums();
  });
}

getData();

watch(authStore, () => {
  if (!homeStore.recommendedAlbums.length) getData();
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/responsive";

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;

  .name {
    flex: 1;
    font-size: 2rem;
    font-weight: bold;
  }
}

.home {
  animation: pop-content 1s ease both;
  display: grid;
  line-break: anywhere;
  overflow: hidden;

  &__content {
    overflow-y: auto;
    padding: 1rem 5rem;
    transition: padding ease 0.2s;

    @media (width <= 1200px) {
      padding: 1rem 3rem;
    }
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
