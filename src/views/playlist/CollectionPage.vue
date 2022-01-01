<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <PageScroller v-else>
    <PageFit>
      <div class="collection">
        <div class="playlist-header">
          <div>
            <div>
              <div class="title">{{ playlistStore.playlist.name.replace("#Collection ", "") }}</div>
              <div class="metas">
                {{ playlistStore.playlist.owner.display_name }} — {{ playlistStore.playlist.tracks.total }} albums
              </div>
              <div v-if="playlistStore.playlist.description !== 'No description'" class="description">
                {{ playlistStore.playlist.description }}
              </div>
            </div>
          </div>
          <div class="playlist-header__right">
            <Actions />
            <ShareContent :spotify-url="playlistStore.playlist.external_urls.spotify" :beardify-url="$route.fullPath" />
          </div>
        </div>
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
import ShareContent from "../../components/ShareContent.vue";
import Actions from "../../components/playlist/Actions.vue";

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

.metas {
  font-size: 0.9rem;
  font-weight: bold;
}

.album-list {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 1fr 1fr 1fr;

  @include xl {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @include l {
    grid-template-columns: 1fr 1fr;
  }

  @include hdpi {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  }
}

.description {
  font-size: 0.9rem;
  font-style: italic;
  margin-top: 0.5rem;
  max-width: 80%;
  opacity: 0.5;
}

.title {
  font-size: 1.8rem;
  font-weight: bold;
}

.playlist-header {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  margin-bottom: 2.2rem;

  &__right {
    display: flex;
    font-size: 1.1rem;
    gap: 0.5rem;
    padding-top: 0.2rem;
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
