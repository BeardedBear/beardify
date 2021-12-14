<template>
  <div v-if="albumStore.album.name === ''" class="loader"><Loader /></div>
  <div v-else ref="albumpage" class="album-page">
    <div class="fit">
      <Head :album="albumStore.album" />
      <div class="content">
        <div class="content__cover">
          <Album
            :album="albumStore.album"
            :currently-played-id="playerStore.currentlyPlaying.item?.album.uri"
            without-metas
            can-save
          />
        </div>
        <div class="content__tracks">
          <div
            v-for="(track, index) in albumStore.album.tracks.items"
            :key="index"
            class="track"
            :class="{ active: playerStore.currentlyPlaying.item?.id === track.id }"
            @dblclick="playSongs(index, albumStore.album.tracks.items)"
          >
            <button class="add" @click="dialogStore.open({ type: 'addSong', songUri: track.uri })">
              <i class="icon-plus"></i>
            </button>
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
      <Foot :album="albumStore.album" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { timecode } from "../../helpers/Date";
import { playSongs } from "../../helpers/Play";
import ArtistList from "../../components/ArtistList.vue";
import Album from "../../components/Album.vue";
import { useAlbum } from "./AlbumStore";
import { usePlayer } from "../../components/player/PlayerStore";
import Loader from "../../components/LoadingDots.vue";
import Head from "../../components/album/Head.vue";
import Foot from "../../components/album/Foot.vue";
import { useDialog } from "../../components/dialog/DialogStore";

const props = defineProps({ id: { default: "", type: String } });
const albumpage = ref();
const albumStore = useAlbum();
const playerStore = usePlayer();
const dialogStore = useDialog();

albumStore.clean().finally(() => albumStore.getAlbum(props.id));
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.fit {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4rem;
  margin: 0 auto;
  width: 57rem;
}

.add {
  background: none;
  border: none;
  color: var(--font-color);
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0;
  padding: 0;
  padding-right: 7px;
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  transition: 0.2s;
}

.track {
  border-radius: 0.4rem;
  cursor: default;
  display: grid;
  grid-template-columns: 2rem 1fr auto;
  padding: 0.4rem 0.8rem;
  position: relative;

  &:hover {
    background-color: color.change(rgb(74 75 103), $alpha: 0.15);

    .add {
      opacity: 0.3;
    }
  }

  .add:hover {
    opacity: 1;
  }

  &:active {
    background-color: color.change(rgb(74 75 103), $alpha: 0.3);
  }

  &__number {
    font-style: italic;
    opacity: 0.5;
  }
}

.content {
  display: flex;
  flex: 1;
  gap: 3rem;
  justify-content: center;

  &__cover {
    width: 18rem;
  }

  &__tracks {
    flex: 1;
    font-size: 1rem;
  }
}

.album-page {
  animation: pop-content 1s ease both;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  padding: 2rem 2.2rem;
  scroll-behavior: smooth;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
