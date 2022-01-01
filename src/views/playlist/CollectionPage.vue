<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <PageScroller v-else>
    <PageFit>
      <div class="collection">
        <Header no-cover no-duration />
        <div class="album-list">
          <div v-for="(album, index) in cleanAlbumList" :key="index">
            <Album :album="album" with-artists can-delete can-save />
          </div>
        </div>
      </div>
    </PageFit>
  </PageScroller>
</template>

<script lang="ts" setup>
import { computed, defineProps } from "vue";
import Album from "../../components/album/Album.vue";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";
import { usePlaylist } from "./PlaylistStore";
import Loader from "../../components/LoadingDots.vue";
import PageScroller from "../../components/PageScroller.vue";
import PageFit from "../../components/PageFit.vue";
import Header from "../../components/playlist/Header.vue";

const props = defineProps<{ id: string }>();
const cleanAlbumList = computed(() => removeDuplicatesAlbums(playlistStore.tracks.map((a) => a.track.album)));
const playlistStore = usePlaylist();

playlistStore.clean().finally(() => {
  playlistStore.getPlaylist(`playlists/${props.id}`);
  playlistStore.getTracks(`playlists/${props.id}/tracks`);
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.collection {
  padding: 2rem;
}

.album-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(4, 1fr);

  @include xl {
    grid-template-columns: repeat(3, 1fr);
  }

  @include l {
    grid-template-columns: repeat(2, 1fr);
  }

  @include hdpi {
    grid-template-columns: repeat(7, 1fr);
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
