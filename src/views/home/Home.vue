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

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import type { RootState } from "../../@types/RootState";
import { HomeActions } from "./HomeStore";
import Album from "../../components/Album.vue";

export default defineComponent({
  components: { Album },
  setup() {
    const store = useStore<RootState>();
    const env = process.env.NODE_ENV;

    store.dispatch(HomeActions.getRecommendedAlbums);

    return { store, env };
  },
});
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
