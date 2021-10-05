<template>
  <div ref="albumpage" class="album-page">
    <div class="album-header">
      <div class="title">
        {{ albumStore.album.name }}
      </div>
      <div>
        <ArtistList :artist-list="albumStore.album.artists" />
        ·
        <span>{{ albumStore.album.release_date.split("-").shift() }}</span>
        ·
        <span>{{ timecodeWithUnits(sumDuration(albumStore.album.tracks.items)) }}</span>
      </div>
    </div>
    <div class="content">
      <div class="content__cover">
        <Album :album="albumStore.album" without-metas can-save />
      </div>
      <div class="content__tracks">
        <div
          v-for="(track, index) in albumStore.album.tracks.items"
          :key="index"
          class="track"
          :class="{ active: playerStore.currentlyPlaying.item?.id === track.id }"
          @click="playSongs(index, albumStore.album.tracks.items)"
        >
          <span class="track__number">{{ track.track_number }}.</span>
          <div>
            <div>{{ track.name }}</div>
            <div v-if="albumStore.album.artists.length">
              <ArtistList
                :artist-list="track.artists.filter((e) => e.name !== albumStore.album.artists[0].name)"
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

<script lang="ts" setup>
import { defineProps, onMounted, ref } from "vue";
import { timecodeWithUnits, timecode } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import { Track, TrackSimplified } from "../../@types/Track";
import ArtistList from "../../components/ArtistList.vue";
import Album from "../../components/Album.vue";
import { useAlbum } from "./AlbumStore";
import { usePlayer } from "../../components/player/PlayerStore";

const props = defineProps({
  id: { default: "", type: String },
});
const albumpage = ref();
const albumStore = useAlbum();
const playerStore = usePlayer();

function sumDuration(tracks: TrackSimplified[] | Track[]): number {
  return tracks.map((t: TrackSimplified | Track) => t.duration_ms).reduce((acc, value) => acc + value, 0);
}
onMounted(() => albumStore.getAlbum(props.id));
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
