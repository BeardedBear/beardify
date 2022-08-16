<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <PageScroller v-else>
    <div class="playlist">
      <Header not-fit />
      <template v-if="playlistStore.playlist.owner.display_name === 'Spotify'">
        <AlbumGallery title="Albums" :icon-name="'album'" :album-list="albums" class="block" />
        <AlbumGallery title="EP's" :icon-name="'ep'" :album-list="eps" class="block" />
        <div class="heading sticky"><i class="icon-single"></i>Singles</div>
        <Tracks :track-list="singles" />
      </template>
      <Tracks v-else :track-list="playlistStore.tracks" />
    </div>
  </PageScroller>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { usePlaylist } from "./PlaylistStore";
import Loader from "../../components/LoadingDots.vue";
import PageScroller from "../../components/PageScroller.vue";
import Tracks from "../../components/playlist/PlaylistTracks.vue";
import AlbumGallery from "../../components/AlbumGallery.vue";
import { isAlbum, isEP, isSingle, useCheckLiveAlbum } from "../../helpers/useCleanAlbums";
import Header from "../../components/playlist/PlaylistHeader.vue";

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
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

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
