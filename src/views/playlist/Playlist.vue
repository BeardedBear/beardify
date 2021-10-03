<template>
  <div ref="playlistpage" class="playlist-page">
    <div class="fit">
      <div class="playlist-header">
        <div class="playlist-header__left">
          <div>
            <Cover size="medium" :images="store.state.playlist.playlist.images" class-name="cover" />
          </div>
          <div>
            <div class="title">
              {{ store.state.playlist.playlist.name }}
            </div>
            <div class="description">
              {{ store.state.playlist.playlist.description }}
            </div>
            <div>
              {{ store.state.playlist.playlist.owner.display_name }} ·
              {{ store.state.playlist.playlist.tracks.total }} Morceaux ·
              {{ timecodeWithUnits(sumDuration(store.state.playlist.tracks)) }}
            </div>
          </div>
        </div>

        <div class="playlist-header__right">
          <button class="button button--nude">
            <i class="icon-share"></i>
          </button>
          <button class="button button--nude" @click="deletePlaylist(store.state.playlist.playlist.id)">
            <i class="icon-more-vertical"></i>
          </button>
        </div>
      </div>
      <div
        v-for="(track, index) in store.state.playlist.tracks"
        :key="index"
        class="track"
        :class="{
          active:
            store.state.player.currentlyPlaying && track.track
              ? track.track.id === store.state.player.currentlyPlaying.item.id
              : false,
        }"
        @click="
          playSongs(
            index,
            store.state.playlist.tracks.map((e) => e.track),
          )
        "
      >
        <div class="track-icon">
          <i class="icon-music" />
        </div>
        <div>
          <div>{{ track.track.name }}</div>
          <div>
            <ArtistList :artist-list="track.track.artists" feat />
          </div>
        </div>
        <div class="album" @click.stop="goAlbum(track.track.album.id)">
          <i
            :class="{
              'icon-album': track.track.album.album_type === 'album',
              'icon-single': track.track.album.album_type === 'single',
              'icon-compilation': track.track.album.album_type === 'compilation',
            }"
          />{{ track.track.album.name }}
        </div>

        <div class="duration">
          {{ timecode(track.track.duration_ms) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { timecode, timecodeWithUnits } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import { PlaylistActions, Mutations } from "./PlaylistStore";
import Cover from "../../components/Cover.vue";
import { PlaylistTrack } from "../../@types/Playlist";
import ArtistList from "../../components/ArtistList.vue";
import { api } from "../../api";
import router from "../../router";
import { useDialog } from "../../components/dialog/DialogStore";

export default defineComponent({
  components: { ArtistList, Cover },
  props: {
    id: { default: "", type: String },
  },
  setup(props) {
    const store = useStore<RootState>();
    const playlistpage = ref();
    const dialogStore = useDialog();

    function deletePlaylist(playlistId: string): void {
      dialogStore.open({ type: "editPlaylist", playlistId });
    }

    function goAlbum(albumId: string): void {
      router.push(`/album/${albumId}`);
    }

    function sumDuration(tracks: PlaylistTrack[]): number {
      return tracks
        .map((t: PlaylistTrack) => (t.track ? t.track.duration_ms : 0))
        .reduce((acc, value) => acc + value, 0);
    }

    store.dispatch(PlaylistActions.getPlaylist, `${api.url}playlists/${props.id}`);
    store.dispatch(PlaylistActions.getTracks, `${api.url}playlists/${props.id}/tracks`);
    store.commit(Mutations.CLEAN_TRACKS);

    return { playlistpage, store, timecode, timecodeWithUnits, playSongs, sumDuration, deletePlaylist, goAlbum };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.track {
  align-items: center;
  border-radius: 3px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 40px 1fr 0.8fr 50px;
  padding: 5px 10px;

  &-icon {
    font-size: 1.5rem;
    opacity: 0.1;
  }

  &:hover {
    background-color: rgba(rgb(74, 75, 103), 0.1);
  }
}

.duration {
  text-align: right;
}

.album {
  align-items: center;
  display: flex;
  font-size: 0.8rem;
  text-align: left;

  &:hover {
    color: var(--primary-color);
    opacity: 1;
  }

  i {
    font-size: 1rem;
    margin-right: 10px;
    opacity: 0.3;

    &.icon-album {
      color: var(--primary-color);
      opacity: 1;
    }
  }
}

.description {
  font-style: italic;
  margin-bottom: 10px;
  max-width: 80%;
  opacity: 0.5;
}

.title {
  font-size: 2rem;
  font-weight: 100;
  margin-bottom: 5px;
  margin-top: -15px;
}

.playlist-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;

  img {
    margin-right: 30px;
  }

  &__left {
    align-items: center;
    display: flex;
  }

  &__right {
    flex: 0 0 140px;
    font-size: 1.1rem;
    text-align: right;
  }
}

.cover {
  border-radius: 4px;
  height: 140px;
}

.playlist-page {
  animation: popContent 1s ease both;
  overflow-y: scroll;
  padding: 30px 40px;
}

.fit {
  margin: 0 auto;
  max-width: 1000px;
}
</style>
