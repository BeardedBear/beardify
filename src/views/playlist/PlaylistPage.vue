<template>
  <div class="loader" v-if="playlistStore.playlist.name === ''"><Loader /></div>
  <PageScroller v-else>
    <div class="playlist">
      <Header not-fit />
      <template
        v-if="playlistStore.playlist.owner.id === 'spotify' && !playlistStore.playlist.images[0]?.url.includes('blend')"
      >
        <AlbumGallery :album-list="albums" :icon-name="'album'" class="block" title="Albums" />
        <AlbumGallery :album-list="eps" :icon-name="'ep'" class="block" title="EP's" />
        <div class="heading sticky">
          <i class="icon-single"></i>
          Singles
        </div>
        <Tracks :track-list="singles" />
      </template>
      <Tracks :track-list="playlistStore.tracks" v-else />
    </div>
  </PageScroller>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import AlbumGallery from "../../components/AlbumGallery.vue";
import Loader from "../../components/LoadingDots.vue";
import PageScroller from "../../components/PageScroller.vue";
import Header from "../../components/playlist/PlaylistHeader.vue";
import Tracks from "../../components/playlist/PlaylistTracks.vue";
import { isAlbum, isEP, isSingle, useCheckLiveAlbum } from "../../helpers/useCleanAlbums";
import { usePlaylist } from "./PlaylistStore";

const props = defineProps<{ id: string }>();
const playlistStore = usePlaylist();
const albums = computed(() =>
  playlistStore.tracks
    .filter((track) => isAlbum(track.track.album) && !useCheckLiveAlbum(track.track.album.name))
    .map((e) => e.track.album),
);
const eps = computed(() => playlistStore.tracks.filter((track) => isEP(track.track.album)).map((e) => e.track.album));
const singles = computed(() => playlistStore.tracks.filter((track) => isSingle(track.track.album)));

playlistStore.clean().finally(() => {
  playlistStore.getPlaylist(`playlists/${props.id}`);
  playlistStore.getTracks(`playlists/${props.id}/tracks`);
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/scss/colors" as colors;
@use "../../assets/scss/responsive" as responsive;

.block {
  margin-bottom: 2rem;
}

.playlist {
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
