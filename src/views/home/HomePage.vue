<template>
  <div v-if="!homeStore.recommendedAlbums.length" class="loader"><Loader /></div>
  <div v-else class="home">
    <div class="home__content">
      <PageFit>
        <div class="title">
          <div class="name">Recommanded albums</div>
          <button class="button" @click="getData()"><i class="icon-refresh"></i> Refresh</button>
        </div>
        <AlbumGallery no-title :album-list="homeStore.recommendedAlbums" />
      </PageFit>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuth } from "../auth/AuthStore";
import { useHome } from "./HomeStore";
import { watch } from "vue";
import Loader from "../../components/LoadingDots.vue";
import PageFit from "../../components/PageFit.vue";
import AlbumGallery from "../../components/AlbumGallery.vue";

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
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
