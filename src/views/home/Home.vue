<template>
  <div v-if="!homeStore.recommendedAlbums.length" class="loader"><Loader /></div>
  <div v-else class="home">
    <div class="home__content">
      <div class="fit">
        <h1>Albums recommandés</h1>
        <div class="album-gallery">
          <Album
            v-for="(album, index) in homeStore.recommendedAlbums"
            :key="index"
            :currently-played-id="playerStore.currentlyPlaying.item?.album.uri"
            :album="album"
            with-artists
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

authStore.accessToken ? getData() : watch(authStore, () => getData());
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

.loader {
  display: grid;
  place-content: center;
}
</style>
