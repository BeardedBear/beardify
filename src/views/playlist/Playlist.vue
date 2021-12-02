<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <div v-else ref="playlistpage" class="playlist-page">
    <div class="fit">
      <div class="playlist-header">
        <div class="playlist-header__left">
          <div><Cover size="medium" :images="playlistStore.playlist.images" class-name="cover" /></div>
          <div>
            <div class="title">{{ playlistStore.playlist.name }}</div>
            <div class="description">{{ playlistStore.playlist.description }}</div>
            <div>
              {{ playlistStore.playlist.owner.display_name }} · {{ playlistStore.playlist.tracks.total }} Morceaux ·
              {{ timecodeWithUnits(sumDuration(playlistStore.tracks)) }}
            </div>
          </div>
        </div>

        <div class="playlist-header__right">
          <button class="button button--nude"><i class="icon-share"></i></button>
          <button class="button button--nude" @click="deletePlaylist(playlistStore.playlist.id)">
            <i class="icon-more-vertical"></i>
          </button>
        </div>
      </div>
      <template v-if="playerStore.currentlyPlaying.item">
        <div
          v-for="(track, index) in playlistStore.tracks"
          :key="index"
          class="track"
          :class="{
            active:
              playerStore.currentlyPlaying && track.track
                ? track.track.id === playerStore.currentlyPlaying.item.id
                : false,
          }"
          @dblclick="
            playSongs(
              index,
              playlistStore.tracks.map((e) => e.track),
            )
          "
        >
          <div class="track-icon">
            <i class="icon icon-music" />
          </div>
          <div>
            <div class="track-name">{{ track.track.name }}</div>
            <div>
              <ArtistList :artist-list="track.track.artists" feat />
            </div>
          </div>
          <div class="album">
            <div v-if="track.track.album.album_type === 'album'" class="adder">
              <i class="adder-icon icon-album" />
              <i
                class="adder-button icon-plus"
                @click="dialogStore.open({ type: 'addalbum', albumId: track.track.album.id })"
              />
            </div>
            <i
              v-else
              :class="{
                'icon-single': track.track.album.album_type === 'single',
                'icon-compilation': track.track.album.album_type === 'compilation',
              }"
            />
            <router-link class="link" :to="`/album/${track.track.album.id}`">{{ track.track.album.name }}</router-link>
          </div>

          <div class="duration">
            {{ timecode(track.track.duration_ms) }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { timecode, timecodeWithUnits } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import Cover from "../../components/Cover.vue";
import { PlaylistTrack } from "../../@types/Playlist";
import { api } from "../../api";
import { useDialog } from "../../components/dialog/DialogStore";
import ArtistList from "../../components/ArtistList.vue";
import { usePlaylist } from "./PlaylistStore";
import { usePlayer } from "../../components/player/PlayerStore";
import Loader from "../../components/LoadingDots.vue";

const props = defineProps<{ id: string }>();
const playlistpage = ref();
const dialogStore = useDialog();
const playlistStore = usePlaylist();
const playerStore = usePlayer();

function deletePlaylist(playlistId: string): void {
  dialogStore.open({ type: "editPlaylist", playlistId });
}

function sumDuration(tracks: PlaylistTrack[]): number {
  return tracks.map((t: PlaylistTrack) => (t.track ? t.track.duration_ms : 0)).reduce((acc, value) => acc + value, 0);
}

playlistStore.clean().finally(() => {
  playlistStore.getPlaylist(`${api.url}playlists/${props.id}`);
  playlistStore.getTracks(`${api.url}playlists/${props.id}/tracks`);
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.track-name {
  font-weight: bold;
}

.track {
  align-items: center;
  border-radius: 3px;
  display: grid;
  grid-template-columns: 40px 1fr 0.8fr 50px;
  margin-bottom: 5px;
  padding: 5px 10px;

  &-icon {
    font-size: 1.5rem;
  }

  .icon {
    opacity: 0.1;
  }

  .link {
    color: currentColor;
    font-style: italic;
    opacity: 0.5;
    text-decoration: none;

    &:hover {
      color: var(--primary-color);
      opacity: 1;
    }
  }

  &:hover {
    background-color: color.change(rgb(74 75 103), $alpha: 0.1);
  }

  &:active {
    background-color: color.change(rgb(74 75 103), $alpha: 0.2);
  }

  .adder {
    &-button {
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      display: none;
      opacity: 1;
      padding: 0;
      transform: scale(1.2);
    }

    &:hover {
      .adder-button {
        display: block;
      }

      .adder-icon {
        display: none;
      }
    }
  }
}

.duration {
  text-align: right;
}

.album {
  align-items: center;
  display: flex;
  font-size: 0.8rem;
  text-align: left;

  i {
    font-size: 1rem;
    margin-right: 10px;
    opacity: 0.3;

    &.icon-album {
      color: var(--primary-color);
      opacity: 1;
    }
  }
}

.description {
  font-style: italic;
  margin-bottom: 10px;
  max-width: 80%;
  opacity: 0.5;
}

.title {
  font-size: 2rem;
  font-weight: 100;
  margin-bottom: 5px;
  margin-top: -15px;
}

.playlist-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;

  img {
    margin-right: 30px;
  }

  &__left {
    align-items: center;
    display: flex;
  }

  &__right {
    flex: 0 0 140px;
    font-size: 1.1rem;
    text-align: right;
  }
}

.cover {
  border-radius: 4px;
  height: 140px;
}

.playlist-page {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  padding: 30px 40px;
}

.fit {
  margin: 0 auto;
  max-width: 1000px;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
