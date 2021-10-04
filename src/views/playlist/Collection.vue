<template>
  <div ref="playlistpage" class="playlist-page">
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
          <Album
            :album="album"
            :currently-played-id="
              store.state.player.currentlyPlaying ? store.state.player.currentlyPlaying.item.album.uri : ''
            "
            with-artists
            can-delete
            can-save
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineProps, ref } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import Album from "../../components/Album.vue";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";
import { api } from "../../api";
import { useDialog } from "../../components/dialog/DialogStore";
import { usePlaylist } from "./PlaylistStore";

const props = defineProps<{ id: string }>();
const store = useStore<RootState>();
const playlistpage = ref();
const dialogStore = useDialog();
const cleanAlbumList = computed(() => removeDuplicatesAlbums(playlistStore.tracks.map((a) => a.track.album)));
const playlistStore = usePlaylist();

function edit(playlistId: string): void {
  dialogStore.open({ type: "editPlaylist", playlistId });
}
playlistStore.getPlaylist(`${api.url}playlists/${props.id}`);
playlistStore.getTracks(`${api.url}playlists/${props.id}/tracks`);
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.album-list {
  display: grid;
  gap: 30px;
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
  margin-bottom: 7px;
  opacity: 0.5;
}

.title {
  font-size: 2.5rem;
  font-weight: 100;
  margin-bottom: 5px;
}

.playlist-header {
  display: flex;
  gap: 30px;
  justify-content: space-between;
  margin-bottom: 40px;

  &__right {
    font-size: 1.1rem;
  }
}

.playlist-page {
  animation: popContent 1s ease both;
  overflow-y: scroll;
  padding: 30px 40px;
  scroll-behavior: smooth;
}

.fit {
  margin: 0 auto;
  max-width: 900px;
}
</style>
