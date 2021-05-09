<template>
  <div ref="albumpage" class="overflowed">
    <div class="album-page overflowed__target">
      <div class="album-header">
        <div class="title">{{ store.state.album.album.name }}</div>
        <div>
          <ArtistList :artistList="store.state.album.album.artists" />
          ·
          <span>{{ store.state.album.album.release_date.split("-").shift() }}</span>
          ·
          <span>{{ timecodeWithUnits(sumDuration(store.state.album.album.tracks.items)) }}</span>
        </div>
      </div>
      <div class="content">
        <div class="content__cover">
          <Cover size="medium" :images="store.state.album.album.images" />
        </div>
        <div class="content__tracks">
          <div
            class="track"
            :class="{ 'track--active': store.state.player.currentlyPlaying.item.id === track.id }"
            v-for="(track, index) in store.state.album.album.tracks.items"
            :key="index"
            @click="playSongs(index, store.state.album.album.tracks.items)"
          >
            <span class="track__number">{{ track.track_number }}.</span>
            <div>
              <div>{{ track.name }}</div>
              <div v-if="store.state.album.album.artists.length">
                <ArtistList
                  :artistList="track.artists.filter(e => e.name !== store.state.album.album.artists[0].name)"
                  feat
                />
              </div>
            </div>
            <div>{{ timecode(track.duration_ms) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { timecodeWithUnits, timecode } from "../../helpers/date";
import { AlbumActions } from "./AlbumStore";
import ArtistList from "../../components/ArtistList.vue";
import { playSongs } from "../../helpers/play";
import { Track, TrackSimplified } from "../../@types/Track";
import Cover from "../../components/Cover.vue";

export default defineComponent({
  components: { ArtistList, Cover },
  props: {
    id: { default: "", type: String }
  },
  setup(props) {
    const store = useStore<RootState>();
    const albumpage = ref();
    const albumDuration = ref(0);

    function sumDuration(tracks: TrackSimplified[] | Track[]) {
      return tracks.map((t: TrackSimplified | Track) => t.duration_ms).reduce((acc, value) => acc + value, 0);
    }
    onMounted(() => {
      store.dispatch(`album/${AlbumActions.getAlbum}`, props.id);
      // albumpage.value.scrollTop = 0;
    });

    return { albumpage, store, timecode, timecodeWithUnits, playSongs, albumDuration, sumDuration };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.overflowed {
  scroll-behavior: smooth;
}

.album-header {
  text-align: center;
  margin-bottom: 60px;
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
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
  display: grid;
  grid-template-columns: 30px 1fr auto;

  &:hover {
    background-color: rgba($primary-color, 0.1);
  }

  &--active {
    background-color: rgba($primary-color, 0.2);
    color: $primary-color;

    &:hover {
      background-color: rgba($primary-color, 0.2);
      color: $primary-color;
    }
  }

  &__number {
    font-style: italic;
    opacity: 0.5;
  }
}

.content {
  display: flex;
  justify-content: center;
  gap: 30px;

  &__cover {
    flex: 0 0 300px;
  }

  &__tracks {
    flex: 0.8;
    font-size: 1rem;
  }
}

.album-page {
  padding: 30px 40px;
}
</style>
