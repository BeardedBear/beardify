<template>
  <div v-if="!homeStore.recommendedAlbums.length" class="loader"><Loader /></div>
  <div v-else class="home">
    <div class="home__content">
      <PageFit>
        <div class="title">
          <div class="name">Recommanded albums</div>
          <button class="button" @click="getData()"><i class="icon-refresh"></i> Refresh</button>
        </div>
        <div class="album-gallery">
          <Album
            v-for="(album, index) in homeStore.recommendedAlbums"
            :key="index"
            :album="album"
            with-artists
            can-save
          />
        </div>
      </PageFit>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Album from "../../components/album/Album.vue";
import { useAuth } from "../auth/AuthStore";
import { useHome } from "./HomeStore";
import { watch } from "vue";
import Loader from "../../components/LoadingDots.vue";
import PageFit from "../../components/PageFit.vue";

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
    padding: 1.2rem;
  }
}

.album-gallery {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(4, 1fr);

  @include hdpi {
    grid-template-columns: repeat(8, 1fr);
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
