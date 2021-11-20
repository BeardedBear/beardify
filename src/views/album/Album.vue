<template>
  <div v-if="albumStore.album.name === ''" class="loader"><Loader /></div>
  <div v-else ref="albumpage" class="album-page">
    <Head :album="albumStore.album" />
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
import { defineProps, watch, ref } from "vue";
import { timecode } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import ArtistList from "../../components/ArtistList.vue";
import Album from "../../components/Album.vue";
import { useAlbum } from "./AlbumStore";
import { usePlayer } from "../../components/player/PlayerStore";
import { useAuth } from "../auth/AuthStore";
import Loader from "../../components/LoadingDots.vue";
import Head from "./Head.vue";

const props = defineProps({ id: { default: "", type: String } });
const albumpage = ref();
const albumStore = useAlbum();
const playerStore = usePlayer();
const authStore = useAuth();

function getData(): void {
  albumStore.clean().finally(() => albumStore.getAlbum(props.id));
}

authStore.accessToken ? getData() : watch(authStore, () => getData());
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

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
    background-color: color.change(rgb(74 75 103), $alpha: 0.15);
  }

  &__number {
    font-style: italic;
    opacity: 50%;
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
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  padding: 30px 40px;
  scroll-behavior: smooth;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
