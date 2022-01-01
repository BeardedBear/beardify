<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <PageScroller v-else>
    <div class="playlist">
      <div class="playlist-header">
        <div class="playlist-header__left">
          <div><Cover size="large" :images="playlistStore.playlist.images" class="cover" /></div>
          <div>
            <div class="title">{{ playlistStore.playlist.name }}</div>
            <div class="metas">
              {{ playlistStore.playlist.owner.display_name }} — {{ playlistStore.playlist.tracks.total }} tracks —
              {{ timecodeWithUnits(sumDuration(playlistStore.tracks)) }}
            </div>
            <div v-if="playlistStore.playlist.description !== 'No description'" class="description">
              {{ playlistStore.playlist.description }}
            </div>
          </div>
        </div>

        <div class="playlist-header__right">
          <Actions />
          <ShareContent :spotify-url="playlistStore.playlist.external_urls.spotify" :beardify-url="$route.fullPath" />
        </div>
      </div>
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
import { computed, defineProps } from "vue";
import { timecodeWithUnits } from "../../helpers/date";
import Cover from "../../components/Cover.vue";
import { PlaylistTrack } from "../../@types/Playlist";
import { usePlaylist } from "./PlaylistStore";
import Loader from "../../components/LoadingDots.vue";
import PageScroller from "../../components/PageScroller.vue";
import ShareContent from "../../components/ShareContent.vue";
import Tracks from "../../components/playlist/Tracks.vue";
import AlbumGallery from "../../components/AlbumGallery.vue";
import { isAlbum, isEP, isSingle, useCheckLiveAlbum } from "../../helpers/useCleanAlbums";
import Actions from "../../components/playlist/Actions.vue";

const props = defineProps<{ id: string }>();
const playlistStore = usePlaylist();
const albums = computed(() =>
  playlistStore.tracks
    .filter((track) => isAlbum(track.track.album) && !useCheckLiveAlbum(track.track.album.name))
    .map((e) => e.track.album),
);
const eps = computed(() => playlistStore.tracks.filter((track) => isEP(track.track.album)).map((e) => e.track.album));
const singles = computed(() => playlistStore.tracks.filter((track) => isSingle(track.track.album)));

function sumDuration(tracks: PlaylistTrack[]): number {
  return tracks.map((t: PlaylistTrack) => (t.track ? t.track.duration_ms : 0)).reduce((acc, value) => acc + value, 0);
}

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
  max-width: 100rem;
  padding: 2rem;
}

.description {
  font-size: 0.9rem;
  font-style: italic;
  margin-top: 0.5rem;
  max-width: 80%;
  opacity: 0.5;
}

.metas {
  font-size: 0.9rem;
  font-weight: bold;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.2rem;
  margin-top: -1rem;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.2rem;

  img {
    margin-right: 2rem;
  }

  &__left {
    align-items: center;
    display: flex;
  }

  &__right {
    display: flex;
    font-size: 1.1rem;
    gap: 0.5rem;
  }
}

.cover {
  border-radius: 0.3rem;
  height: 7rem;
  width: 7rem;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
