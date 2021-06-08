<template>
  <div ref="playlistpage" class="playlist-page">
    <div class="fit">
      <div class="playlist-header">
        <div>
          <div>
            <div class="title">
              {{ store.state.playlist.playlist.name.replace("#Collection ", "").replace("#collection ", "") }}
            </div>
            <div class="description">
              {{ store.state.playlist.playlist.description }}
            </div>
            <div>
              {{ store.state.playlist.playlist.owner.display_name }} ·
              {{ store.state.playlist.playlist.tracks.total }} Albums
            </div>
          </div>
        </div>
        <div class="playlist-header__right">
          <button class="button button--nude">
            <i class="icon-share"></i>
          </button>
          <button class="button button--nude" @click="edit(store.state.playlist.playlist.id)">
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

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { timecode, timecodeWithUnits } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import { PlaylistActions, Mutations } from "./PlaylistStore";
import { PlaylistTrack } from "../../@types/Playlist";
import Album from "../../components/Album.vue";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";
import { api } from "../../api";
import { Mutations as DialogMutations } from "../../components/dialog/DialogStore";
import { Dialog } from "../../@types/Dialog";

export default defineComponent({
  components: { Album },
  props: {
    id: { default: "", type: String },
  },
  setup(props) {
    const store = useStore<RootState>();
    const playlistpage = ref();
    const cleanAlbumList = computed(() =>
      removeDuplicatesAlbums(store.state.playlist.tracks.map((a) => a.track.album)),
    );

    function edit(playlistId: string) {
      store.commit(DialogMutations.OPEN_DIALOG, { type: "editPlaylist", playlistId } as Dialog);
    }

    function sumDuration(tracks: PlaylistTrack[]) {
      return tracks.map((t: PlaylistTrack) => t.track.duration_ms).reduce((acc, value) => acc + value, 0);
    }

    store.dispatch(PlaylistActions.getPlaylist, `${api.url}playlists/${props.id}`);
    store.dispatch(PlaylistActions.getTracks, `${api.url}playlists/${props.id}/tracks`);
    store.commit(Mutations.CLEAN_TRACKS);

    return {
      playlistpage,
      store,
      timecode,
      timecodeWithUnits,
      playSongs,
      sumDuration,
      removeDuplicatesAlbums,
      cleanAlbumList,
      edit,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.album-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 30px;

  @include xl {
    grid-template-columns: 1fr 1fr 1fr;
  }

  @include l {
    grid-template-columns: 1fr 1fr;
  }
}

.description {
  margin-bottom: 7px;
  font-style: italic;
  opacity: 0.5;
}

.title {
  font-size: 2.5rem;
  font-weight: 100;
  margin-bottom: 5px;
}

.playlist-header {
  gap: 30px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;

  &__right {
    font-size: 1.1rem;
  }
}

.playlist-page {
  padding: 30px 40px;
  scroll-behavior: smooth;
  overflow-y: scroll;
  animation: popContent 1s ease both;
}

.fit {
  max-width: 900px;
  margin: 0 auto;
}
</style>
