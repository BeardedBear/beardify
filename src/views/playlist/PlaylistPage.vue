<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader"><Loader /></div>
  <PageScroller v-else>
    <div class="playlist">
      <div class="playlist-header">
        <div class="playlist-header__left">
          <div><Cover size="large" :images="playlistStore.playlist.images" class-name="cover" /></div>
          <div>
            <div class="title">{{ playlistStore.playlist.name }}</div>
            <div v-if="playlistStore.playlist.description !== 'No description'" class="description">
              {{ playlistStore.playlist.description }}
            </div>
            <div>
              {{ playlistStore.playlist.owner.display_name }} · {{ playlistStore.playlist.tracks.total }} morceaux ·
              {{ timecodeWithUnits(sumDuration(playlistStore.tracks)) }}
            </div>
          </div>
        </div>

        <div class="playlist-header__right">
          <button class="button button--nude"><i class="icon-share"></i></button>
          <button
            class="button button--nude"
            @click="dialogStore.open({ type: 'editPlaylist', playlistId: playlistStore.playlist.id })"
          >
            <i class="icon-more-vertical"></i>
          </button>
        </div>
      </div>
      <div
        v-for="(track, index) in playlistStore.tracks"
        :key="index"
        class="track"
        :class="{
          active:
            playerStore.currentlyPlaying && track.track
              ? playerStore.currentlyPlaying.item && track.track.id === playerStore.currentlyPlaying.item.id
              : false,
          deletable: playlistStore.playlist.owner.id === authStore.me?.id || playlistStore.playlist.collaborative,
        }"
        @click="
          playSongs(
            index,
            playlistStore.tracks.map((e) => e.track),
          )
        "
      >
        <div class="track-icon">
          <i class="track-icon-item music icon-music" />
          <i
            class="track-icon-item save icon-plus"
            @click.prevent.stop="dialogStore.open({ type: 'addSong', songUri: track.track.uri })"
          ></i>
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
            v-else-if="track.track.album.album_type === 'single' && track.track.album.total_tracks >= 3"
            class="icon-ep"
          />
          <i
            v-else
            :class="{
              'icon-single': track.track.album.album_type === 'single',
              'icon-compilation': track.track.album.album_type === 'compilation',
            }"
          />
          <AlbumLink :album="track.track.album" no-icon />
        </div>

        <div class="date">
          {{ date(track.added_at) }}
        </div>

        <div class="duration">
          {{ timecode(track.track.duration_ms) }}
        </div>

        <div v-if="playlistStore.playlist.owner.id === authStore.me?.id || playlistStore.playlist.collaborative">
          <button class="button button--nude delete" @click.prevent.stop="deleteSong(track.track.uri)">
            <i class="icon-trash-2"></i>
          </button>
        </div>
      </div>
    </div>
  </PageScroller>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { timecode, timecodeWithUnits, date } from "../../helpers/date";
import { playSongs } from "../../helpers/play";
import Cover from "../../components/Cover.vue";
import { PlaylistTrack } from "../../@types/Playlist";
import { useDialog } from "../../components/dialog/DialogStore";
import ArtistList from "../../components/artist/ArtistList.vue";
import { usePlaylist } from "./PlaylistStore";
import { usePlayer } from "../../components/player/PlayerStore";
import Loader from "../../components/LoadingDots.vue";
import { useAuth } from "../auth/AuthStore";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { NotificationType } from "../../@types/Notification";
import PageScroller from "../../components/PageScroller.vue";
import AlbumLink from "../../components/album/AlbumLink.vue";

const props = defineProps<{ id: string }>();
const dialogStore = useDialog();
const playlistStore = usePlaylist();
const playerStore = usePlayer();
const authStore = useAuth();

function sumDuration(tracks: PlaylistTrack[]): number {
  return tracks.map((t: PlaylistTrack) => (t.track ? t.track.duration_ms : 0)).reduce((acc, value) => acc + value, 0);
}

function deleteSong(songId: string): void {
  instance()
    .delete(`playlists/${playlistStore.playlist.id}/tracks`, { data: { tracks: [{ uri: songId }] } })
    .then(() => playlistStore.removeSong(songId))
    .then(() => notification({ msg: "Morceau supprimé", type: NotificationType.Success }));
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

.track-name {
  font-weight: bold;
}

.track {
  align-items: center;
  border-radius: 0.3rem;
  cursor: pointer;
  display: grid;
  gap: 0.8rem;
  grid-template-columns: 2.2rem 1fr 0.9fr 0.3fr 2.8rem;
  margin-bottom: 0.4rem;
  padding: 0.4rem 0.8rem;

  &.deletable {
    grid-template-columns: 2.2rem 1fr 0.9fr 0.3fr 2.8rem auto;
  }

  &-icon {
    &-item {
      font-size: 1.5rem;
      opacity: 0.1;
    }

    .save {
      cursor: pointer;
      display: none;
    }

    &:hover {
      .music {
        display: none;
      }

      .save {
        display: block;
        opacity: 0.8;
      }
    }
  }

  .delete {
    opacity: 0.3;

    &:hover {
      opacity: 1;
    }
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

  .date {
    text-align: right;
  }

  .link {
    &:hover {
      color: var(--primary-color);
      opacity: 1;
    }
  }

  &:hover {
    background-color: var(--bg-color-dark);
  }

  &:active {
    background-color: var(--bg-color);
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
    flex: 0 0 10rem;
    font-size: 1.1rem;
    text-align: right;
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
