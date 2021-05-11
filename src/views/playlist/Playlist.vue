<template>
  <div ref="playlistpage" class="overflowed">
    <div class="playlist-page overflowed__target">
      <div class="playlist-header">
        <div><Cover size="medium" :images="store.state.playlist.playlist.images" className="cover" /></div>
        <div>
          <div class="title">{{ store.state.playlist.playlist.name }}</div>
          <div class="description">{{ store.state.playlist.playlist.description }}</div>
          <div>
            {{ store.state.playlist.playlist.owner.display_name }} ·
            {{ store.state.playlist.playlist.tracks.total }} Morceaux ·
            {{ timecodeWithUnits(sumDuration(store.state.playlist.tracks)) }}
          </div>
        </div>
      </div>
      <div
        class="track"
        v-for="(track, index) in store.state.playlist.tracks"
        :key="index"
        :class="{ active: track.track.id === store.state.player.currentlyPlaying.item.id }"
        @click="
          playSongs(
            index,
            store.state.playlist.tracks.map(e => e.track)
          )
        "
      >
        <div class="track-icon"><i class="icon-music"></i></div>
        <div>
          <div>{{ track.track.name }}</div>
          <div><ArtistList :artistList="track.track.artists" feat /></div>
        </div>
        <div class="album">
          <i
            :class="{
              'icon-album': track.track.album.album_type === 'album',
              'icon-single': track.track.album.album_type === 'single',
              'icon-compilation': track.track.album.album_type === 'compilation'
            }"
          ></i
          >{{ track.track.album.name }}
        </div>
        <div class="duration">{{ timecode(track.track.duration_ms) }}</div>
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

export default defineComponent({
  components: { ArtistList, Cover },
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
    background-color: rgba(var(--primary-color), 0.1);
  }
}

.duration {
  text-align: right;
}
.album {
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;

  i {
    opacity: 0.3;
    font-size: 1rem;

    &.icon-album {
      color: var(--primary-color);
      opacity: 1;
    }
  }
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
  font-size: 2rem;
  font-weight: 100;
  margin-bottom: 5px;
}

.playlist-header {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 20px;
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
