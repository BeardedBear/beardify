<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <PageScroller v-else>
    <div class="playlist">
      <div class="playlist-header">
        <div class="playlist-header__left">
          <div><Cover size="large" :images="playlistStore.playlist.images" class="cover" /></div>
          <div>
            <div class="title">{{ playlistStore.playlist.name }}</div>
            <div v-if="playlistStore.playlist.description !== 'No description'" class="description">
              {{ playlistStore.playlist.description }}
            </div>
            <div>
              {{ playlistStore.playlist.owner.display_name }} · {{ playlistStore.playlist.tracks.total }} tracks ·
              {{ timecodeWithUnits(sumDuration(playlistStore.tracks)) }}
            </div>
          </div>
        </div>

        <div class="playlist-header__right">
          <div>
            <button
              class="button button--nude"
              @click="dialogStore.open({ type: 'editPlaylist', playlistId: playlistStore.playlist.id })"
            >
              <i class="icon-more-vertical"></i>
            </button>
          </div>
          <ShareContent :spotify-url="playlistStore.playlist.external_urls.spotify" :beardify-url="$route.fullPath" />
        </div>
      </div>
      <template v-for="(track, index) in playlistStore.tracks" :key="track">
        <TrackItem :track="track" :index="index" />
      </template>
    </div>
  </PageScroller>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { timecodeWithUnits } from "../../helpers/date";
import Cover from "../../components/Cover.vue";
import { PlaylistTrack } from "../../@types/Playlist";
import { useDialog } from "../../components/dialog/DialogStore";
import { usePlaylist } from "./PlaylistStore";
import Loader from "../../components/LoadingDots.vue";
import PageScroller from "../../components/PageScroller.vue";
import ShareContent from "../../components/ShareContent.vue";
import TrackItem from "../../components/playlist/Track.vue";

const props = defineProps<{ id: string }>();
const dialogStore = useDialog();
const playlistStore = usePlaylist();

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

.playlist {
  margin: 0 auto;
  max-width: 100rem;
}

.description {
  font-style: italic;
  margin-bottom: 0.5rem;
  max-width: 80%;
  opacity: 0.5;
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
    align-items: center;
    display: flex;
    font-size: 1.1rem;
    gap: 0.5rem;
  }
}

.cover {
  border-radius: 0.3rem;
  height: 7rem;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
