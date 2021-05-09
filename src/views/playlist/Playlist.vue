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
      <!-- <div>{{ store.state.playlist.tracks }}</div> -->
      <div v-for="(track, index) in store.state.playlist.tracks" :key="index">
        {{ track.track.name }}
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
import { Track, TrackSimplified } from "../../@types/Track";
import { PlaylistTrack } from "../../@types/Playlist";

export default defineComponent({
  components: { Cover },
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
}
</style>
