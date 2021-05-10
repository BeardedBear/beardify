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
      <div class="album-list">
        <div
          v-for="(album, index) in removeDuplicatesAlbums(store.state.playlist.tracks.map(a => a.track.album))"
          :key="index"
        >
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
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";

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

    return { playlistpage, store, timecode, timecodeWithUnits, playSongs, sumDuration, removeDuplicatesAlbums };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.album-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 30px;
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

.playlist-page {
  padding: 30px 40px;
  max-width: 1000px;
  margin: 0 auto;
}
</style>
