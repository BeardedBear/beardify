<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <div v-else ref="playlistpage" class="playlist-page">
    <div class="playlist-header">
      <div class="playlist-header__left">
        <div><Cover size="large" :images="playlistStore.playlist.images" class-name="cover" /></div>
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

        <div class="owner">
          {{ track.added_by.id }}
        </div>

        <div class="date">
          {{ date(track.added_at) }}
        </div>

        <div class="duration">
          {{ timecode(track.track.duration_ms) }}
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { timecode, timecodeWithUnits, date } from "../../helpers/date";
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
  border-radius: 0.3rem;
  display: grid;
  gap: 0.8rem;
  grid-template-columns: 2.2rem 1fr 0.9fr 0.4fr 0.3fr 2.8rem;
  margin-bottom: 0.4rem;
  padding: 0.4rem 0.8rem;

  &-icon {
    font-size: 1.5rem;
  }

  .icon {
    opacity: 0.1;
  }

  .link,
  .date,
  .owner {
    color: currentColor;
    font-size: 0.9rem;
    font-style: italic;
    opacity: 0.5;
    text-decoration: none;
  }

  .link {
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
  font-size: 0.9rem;
  text-align: left;

  i {
    font-size: 1rem;
    margin-right: 0.8rem;
    opacity: 0.3;

    &.icon-album {
      color: var(--primary-color);
      opacity: 1;
    }
  }
}

.description {
  font-style: italic;
  margin-bottom: 0.8rem;
  max-width: 80%;
  opacity: 0.5;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.4rem;
  margin-top: -1rem;
}

.playlist-header {
  align-items: center;
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
    flex: 0 0 10rem;
    font-size: 1.1rem;
    text-align: right;
  }
}

.cover {
  border-radius: 0.3rem;
  height: 10rem;
}

.playlist-page {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
  padding: 2rem 2.2rem;
}

.fit {
  margin: 0 auto;
  max-width: 57rem;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
