<template>
  <div class="home">
    <div class="home__content">
      <div class="fit">
        <h1>Albums recommandés</h1>
        <div class="album-gallery">
          <Album v-for="(album, index) in homeStore.recommendedAlbums" :key="index" :album="album" with-artists />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Album from "../../components/Album.vue";
import { useHome } from "./HomeStore";

const homeStore = useHome();

homeStore.getRecommendedAlbums();
</script>

<style lang="scss" scoped>
.home {
  display: grid;
  line-break: anywhere;
  overflow: hidden;

  &__content {
    overflow-y: auto;
    padding: 20px;
  }
}

.album-gallery {
  display: grid;
  gap: 30px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.fit {
  margin: 0 auto;
  max-width: 900px;
}
</style>
