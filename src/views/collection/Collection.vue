<template>
  <div ref="playlistpage" class="overflowed">
    <div class="playlist-page overflowed__target">
      <div class="playlist-header">
        <div>
          <div class="title">{{ store.state.playlist.playlist.name.replace("#Collection ", "") }}</div>
          <div class="description">{{ store.state.playlist.playlist.description }}</div>
          <div>
            {{ store.state.playlist.playlist.owner.display_name }} ·
            {{ store.state.playlist.playlist.tracks.total }} Albums
          </div>
        </div>
      </div>
      <!-- <div>{{ store.state.playlist.tracks.map(a => a.track.album) }}</div> -->
      <div class="album-list">
        <div v-for="(album, index) in store.state.playlist.tracks.map(a => a.track.album)" :key="index">
          <Album :album="album" :currentlyPlayedId="store.state.player.currentlyPlaying.item.album.uri" />
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
import { PlaylistActions, Mutations } from "./CollectionStore";
import Cover from "../../components/Cover.vue";
import { PlaylistTrack } from "../../@types/Playlist";
import ArtistList from "../../components/ArtistList.vue";
import Album from "../../components/Album.vue";

export default defineComponent({
  components: { Album, ArtistList, Cover },
  props: {
    id: { default: "", type: String }
  },
  setup(props) {
    const store = useStore<RootState>();
    const playlistpage = ref();

    function sumDuration(tracks: PlaylistTrack[]) {
      return tracks.map((t: PlaylistTrack) => t.track.duration_ms).reduce((acc, value) => acc + value, 0);
    }

    store.dispatch(`playlist/${PlaylistActions.getPlaylist}`, `https://api.spotify.com/v1/playlists/${props.id}`);
    store.dispatch(`playlist/${PlaylistActions.getTracks}`, `https://api.spotify.com/v1/playlists/${props.id}/tracks`);
    store.commit(`playlist/${Mutations.CLEAN_TRACKS}`);

    return { playlistpage, store, timecode, timecodeWithUnits, playSongs, sumDuration };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.track {
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
  display: grid;
  grid-template-columns: 40px 1fr 0.8fr 50px;
  align-items: center;

  &-icon {
    font-size: 1.5rem;
    opacity: 0.1;
  }

  &:hover {
    background-color: rgba($primary-color, 0.1);
  }

  &.active {
    background-color: rgba($primary-color, 0.2);
    color: $primary-color;

    &:hover {
      background-color: rgba($primary-color, 0.2);
      color: $primary-color;
    }
  }
}

.album-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 30px;
}

.duration {
  text-align: right;
}
.overflowed {
  scroll-behavior: smooth;
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
  text-align: center;
}

.playlist-header {
  align-items: center;
  gap: 30px;
  margin-bottom: 40px;
  text-align: center;
}

.cover {
  border-radius: 4px;
  height: 140px;
}

.playlist-page {
  padding: 30px 40px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
