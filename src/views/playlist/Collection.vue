<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <div v-else ref="playlistpage" class="playlist-page">
    <div class="fit">
      <div class="playlist-header">
        <div>
          <div>
            <div class="title">
              {{ playlistStore.playlist.name.replace("#Collection ", "").replace("#collection ", "") }}
            </div>
            <div class="description">{{ playlistStore.playlist.description }}</div>
            <div>
              {{ playlistStore.playlist.owner.display_name }} · {{ playlistStore.playlist.tracks.total }} Albums
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
          <template v-if="playerStore.currentlyPlaying.item">
            <Album
              :album="album"
              :currently-played-id="playerStore.currentlyPlaying ? playerStore.currentlyPlaying.item.album.uri : ''"
              with-artists
              can-delete
              can-save
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, ref } from "vue";
import Album from "../../components/Album.vue";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";
import { api } from "../../api";
import { useDialog } from "../../components/dialog/DialogStore";
import { usePlaylist } from "./PlaylistStore";
import { usePlayer } from "../../components/player/PlayerStore";
import Loader from "../../components/LoadingDots.vue";

const props = defineProps<{ id: string }>();
const playlistpage = ref();
const dialogStore = useDialog();
const cleanAlbumList = computed(() => removeDuplicatesAlbums(playlistStore.tracks.map((a) => a.track.album)));
const playlistStore = usePlaylist();
const playerStore = usePlayer();

function edit(playlistId: string): void {
  dialogStore.open({ type: "editPlaylist", playlistId });
}

playlistStore.clean().finally(() => {
  playlistStore.getPlaylist(`${api.url}playlists/${props.id}`);
  playlistStore.getTracks(`${api.url}playlists/${props.id}/tracks`);
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

.playlist-page {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  padding: 2rem 2.2rem;
  scroll-behavior: smooth;
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
