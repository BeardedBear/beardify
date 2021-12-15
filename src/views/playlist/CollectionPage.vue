<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <PageScroller v-else>
    <PageFit>
      <div class="playlist-header">
        <div>
          <div>
            <div class="title">{{ playlistStore.playlist.name.replace("#Collection ", "") }}</div>
            <div class="description">{{ playlistStore.playlist.description }}</div>
            <div>
              {{ playlistStore.playlist.owner.display_name }} · {{ playlistStore.playlist.tracks.total }} albums
            </div>
          </div>
        </div>
        <div class="playlist-header__right">
          <button class="button button--nude"><i class="icon-share"></i></button>
          <button class="button button--nude" @click="edit(playlistStore.playlist.id)">
            <i class="icon-more-vertical"></i>
          </button>
        </div>
      </div>
      <div class="album-list">
        <div v-for="(album, index) in cleanAlbumList" :key="index">
          <Album
            :album="album"
            :currently-played-id="
              playerStore.currentlyPlaying.item && playerStore.currentlyPlaying
                ? playerStore.currentlyPlaying.item.album.uri
                : ''
            "
            with-artists
            can-delete
            can-save
          />
        </div>
      </div>
    </PageFit>
  </PageScroller>
</template>

<script lang="ts" setup>
import { computed, defineProps } from "vue";
import Album from "../../components/album/Album.vue";
import { removeDuplicatesAlbums } from "../../helpers/RemoveDuplicate";
import { useDialog } from "../../components/dialog/DialogStore";
import { usePlaylist } from "./PlaylistStore";
import { usePlayer } from "../../components/player/PlayerStore";
import Loader from "../../components/LoadingDots.vue";
import PageScroller from "../../components/PageScroller.vue";
import PageFit from "../../components/PageFit.vue";

const props = defineProps<{ id: string }>();
const dialogStore = useDialog();
const cleanAlbumList = computed(() => removeDuplicatesAlbums(playlistStore.tracks.map((a) => a.track.album)));
const playlistStore = usePlaylist();
const playerStore = usePlayer();

function edit(playlistId: string): void {
  dialogStore.open({ type: "editPlaylist", playlistId });
}

playlistStore.clean().finally(() => {
  playlistStore.getPlaylist(`playlists/${props.id}`);
  playlistStore.getTracks(`playlists/${props.id}/tracks`);
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

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
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
}

.description {
  font-style: italic;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.4rem;
}

.playlist-header {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  margin-bottom: 2.2rem;

  &__right {
    font-size: 1.1rem;
  }
}

.loader {
  display: grid;
  place-content: center;
}
</style>
