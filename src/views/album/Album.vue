<template>
  <div ref="albumpage" class="album-page">
    <div class="album-header">
      <div class="title">
        {{ store.state.album.album.name }}
      </div>
      <div>
        <ArtistList :artist-list="store.state.album.album.artists" />
        ·
        <span>{{ store.state.album.album.release_date.split("-").shift() }}</span>
        ·
        <span>{{ timecodeWithUnits(sumDuration(store.state.album.album.tracks.items)) }}</span>
      </div>
    </div>
    <div class="content">
      <div class="content__cover">
        <Album :album="store.state.album.album" without-metas can-save />
      </div>
      <div class="content__tracks">
        <div
          v-for="(track, index) in store.state.album.album.tracks.items"
          :key="index"
          class="track"
          :class="{ active: store.state.player.currentlyPlaying.item.id === track.id }"
          @click="playSongs(index, store.state.album.album.tracks.items)"
        >
          <span class="track__number">{{ track.track_number }}.</span>
          <div>
            <div>{{ track.name }}</div>
            <div v-if="store.state.album.album.artists.length">
              <ArtistList
                :artist-list="track.artists.filter((e) => e.name !== store.state.album.album.artists[0].name)"
                feat
              />
            </div>
          </div>
          <div>{{ timecode(track.duration_ms) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { timecodeWithUnits, timecode } from "../../helpers/date";
import { AlbumActions } from "./AlbumStore";
import ArtistList from "../../components/ArtistList.vue";
import { playSongs } from "../../helpers/play";
import { Track, TrackSimplified } from "../../@types/Track";
import Album from "../../components/Album.vue";

export default defineComponent({
  components: { Album, ArtistList },
  props: {
    id: { default: "", type: String },
  },
  setup(props) {
    const store = useStore<RootState>();
    const albumpage = ref();

    function sumDuration(tracks: TrackSimplified[] | Track[]): number {
      return tracks.map((t: TrackSimplified | Track) => t.duration_ms).reduce((acc, value) => acc + value, 0);
    }
    onMounted(() => store.dispatch(AlbumActions.getAlbum, props.id));

    return { albumpage, store, timecode, timecodeWithUnits, playSongs, sumDuration };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.album-header {
  margin-bottom: 60px;
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: 100;
  margin-bottom: 5px;
}

.cover {
  width: 100%;
}

.track {
  border-radius: 3px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 30px 1fr auto;
  padding: 5px 10px;

  &:hover {
    background-color: rgba(rgb(74, 75, 103), 0.15);
  }

  &__number {
    font-style: italic;
    opacity: 0.5;
  }
}

.content {
  display: flex;
  justify-content: center;

  &__cover {
    flex: 0 0 300px;
    margin-right: 30px;
  }

  &__tracks {
    flex: 0.8;
    font-size: 1rem;
  }
}

.album-page {
  animation: popContent 1s ease both;
  overflow-y: scroll;
  padding: 30px 40px;
  scroll-behavior: smooth;
}
</style>
