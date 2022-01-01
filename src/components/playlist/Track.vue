<template>
  <div
    class="track"
    :class="{
      active:
        playerStore.currentlyPlaying && track.track
          ? playerStore.currentlyPlaying.item && track.track.id === playerStore.currentlyPlaying.item.id
          : false,
      deletable: playlistStore.playlist.owner.id === authStore.me?.id || playlistStore.playlist.collaborative,
    }"
    @click="playSongs(index, currentPlaylistTracks)"
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
      <ArtistList :artist-list="track.track.artists" feat />
    </div>
    <div class="album">
      <div v-if="isAlbum(track.track.album)" class="adder">
        <i class="adder-icon icon-album" />
        <i
          class="adder-button icon-plus"
          @click.prevent.stop="dialogStore.open({ type: 'addalbum', albumId: track.track.album.id })"
        />
      </div>
      <i
        v-else
        :class="{
          'icon-ep': isEP(track.track.album),
          'icon-single': isSingle(track.track.album),
          'icon-compilation': isCompilation(track.track.album),
        }"
      />
      <AlbumLink :album="track.track.album" no-icon />
    </div>
    <div class="date">{{ date(track.added_at) }}</div>
    <div class="duration">{{ timecode(track.track.duration_ms) }}</div>
    <div v-if="playlistStore.playlist.owner.id === authStore.me?.id || playlistStore.playlist.collaborative">
      <button class="button button--nude delete" @click.prevent.stop="deleteSong(track.track.uri)">
        <i class="icon-trash-2"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { NotificationType } from "../../@types/Notification";
import { PlaylistTrack } from "../../@types/Playlist";
import { Track } from "../../@types/Track";
import { instance } from "../../api";
import { date, timecode } from "../../helpers/date";
import { notification } from "../../helpers/notifications";
import { playSongs } from "../../helpers/play";
import { isAlbum, isCompilation, isEP, isSingle } from "../../helpers/useCleanAlbums";
import { useAuth } from "../../views/auth/AuthStore";
import { usePlaylist } from "../../views/playlist/PlaylistStore";
import AlbumLink from "../album/AlbumLink.vue";
import ArtistList from "../artist/ArtistList.vue";
import { useDialog } from "../dialog/DialogStore";
import { usePlayer } from "../player/PlayerStore";

defineProps<{
  track: PlaylistTrack;
  index: number;
}>();

const dialogStore = useDialog();
const playlistStore = usePlaylist();
const playerStore = usePlayer();
const authStore = useAuth();

const currentPlaylistTracks = playlistStore.tracks
  .filter((e) => isSingle(e.track.album))
  .map((e) => e.track) as Track[];

function deleteSong(songId: string): void {
  instance()
    .delete(`playlists/${playlistStore.playlist.id}/tracks`, { data: { tracks: [{ uri: songId }] } })
    .then(() => playlistStore.removeSong(songId))
    .then(() => notification({ msg: "Track deleted", type: NotificationType.Success }));
}
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
  font-size: 0.9rem;
  font-weight: bold;
  padding-right: 0.5rem;
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
</style>
