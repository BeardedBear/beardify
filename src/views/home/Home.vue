<template>
  <div v-if="!homeStore.recommendedAlbums.length" class="loader"><Loader /></div>
  <div v-else class="home">
    <div class="home__content">
      <div class="fit">
        <div class="title">
          <div class="name">Albums recommandés</div>
          <button class="button" @click="getData()"><i class="icon-refresh"></i> Rafraîchir</button>
        </div>
        <div class="album-gallery">
          <Album
            v-for="(album, index) in homeStore.recommendedAlbums"
            :key="index"
            :currently-played-id="playerStore.currentlyPlaying.item?.album.uri"
            :album="album"
            with-artists
            can-save
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Album from "../../components/Album.vue";
import { useAuth } from "../auth/AuthStore";
import { useHome } from "./HomeStore";
import { watch } from "vue";
import Loader from "../../components/LoadingDots.vue";
import { usePlayer } from "../../components/player/PlayerStore";

const homeStore = useHome();
const authStore = useAuth();
const playerStore = usePlayer();

function getData(): void {
  homeStore.clean().finally(() => {
    homeStore.getRecommendedAlbums();
  });
}

watch(authStore, () => {
  if (!homeStore.recommendedAlbums.length) getData();
});
</script>

<style lang="scss" scoped>
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
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.fit {
  margin: 0 auto;
  max-width: 57rem;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
