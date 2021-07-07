<template>
  <div class="home">
    <div class="home__content">
      <div class="fit">
        <h1>Albums recommandés</h1>
        <div class="album-gallery">
          <Album
            v-for="(album, index) in store.state.home.recommendedAlbums"
            :key="index"
            :album="album"
            with-artists
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "vuex";
import type { RootState } from "../../@types/RootState";
import { HomeActions } from "./HomeStore";
import Album from "../../components/Album.vue";

const store = useStore<RootState>();

store.dispatch(HomeActions.getRecommendedAlbums);
</script>

<style lang="scss" scoped>
.home {
  line-break: anywhere;
  overflow: hidden;
  display: grid;

  &__content {
    padding: 20px;
    overflow-y: auto;
  }
}

.album-gallery {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 30px;
}

.fit {
  max-width: 900px;
  margin: 0 auto;
}
</style>
