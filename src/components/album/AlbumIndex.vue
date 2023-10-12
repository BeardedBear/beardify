<template>
  <div class="album" :class="{ 'exact-search': exactSearch }">
    <div v-if="isPlaying" class="current"><i class="icon-volume-2" /></div>
    <div class="cover" :class="{ 'is-playing': isPlaying }">
      <Cover
        :size="coverSize ? coverSize : 'medium'"
        :images="album.images"
        class="img"
        @click="router.push(`/album/${album.id}`)"
      />
      <button class="play" type="button" @click="playAlbum(album.uri)">
        <i class="icon-play" />
      </button>
      <button
        v-if="canSave"
        class="button-action add"
        type="button"
        @click="dialogStore.open({ type: 'addalbum', albumId: album.id })"
      >
        <i class="icon-plus" />
      </button>
      <button v-if="canDelete" class="button-action delete" type="button" @click="deleteAlbum(album.id)">
        <i class="icon-trash-2" />
      </button>
    </div>
    <div v-if="!withoutMetas">
      <div class="name">{{ album.name }}</div>
      <div v-if="withArtists">
        <ArtistList :artist-list="album.artists" feat />
      </div>
      <div v-if="album.release_date && !withoutReleaseDate" class="date">
        {{ album.release_date.split("-").shift() }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { Album, AlbumSimplified } from "../../@types/Album";
import { ImageSize } from "../../@types/Image";
import { NotificationType } from "../../@types/Notification";
import { Paging } from "../../@types/Paging";
import { TrackSimplified, TrackToRemove } from "../../@types/Track";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import router from "../../router";
import { usePlaylist } from "../../views/playlist/PlaylistStore";
import Cover from "../AlbumCover.vue";
import ArtistList from "../artist/ArtistList.vue";
import { useDialog } from "../dialog/DialogStore";
import { usePlayer } from "../player/PlayerStore";
import { computed } from "vue";

const props = defineProps<{
  album: AlbumSimplified | Album;
  withArtists?: boolean;
  withoutMetas?: boolean;
  canDelete?: boolean;
  canSave?: boolean;
  withoutReleaseDate?: boolean;
  coverSize?: ImageSize | undefined;
  exactSearch?: boolean;
}>();

const currentRouteId = useRoute().params.id;
const dialogStore = useDialog();
const playlistStore = usePlaylist();
const playerStore = usePlayer();
const isPlaying = computed<boolean>(
  () => props.album.uri === playerStore.playerState?.track_window.current_track.album.uri,
);

function playAlbum(albumUri: string): void {
  usePlayer().playerState.position = 0;
  instance().put("me/player/play", { context_uri: albumUri, position_ms: 0 });
}

function deleteAlbum(albumId: string): void {
  instance()
    .get<Paging<TrackSimplified>>(`albums/${albumId}/tracks`)
    .then((e) => {
      const tracks: TrackToRemove[] = [];

      e.data.items.map((t) => t.uri).forEach((t) => tracks.push({ uri: t }));

      instance()
        .delete(`playlists/${currentRouteId}/tracks`, {
          data: { tracks: tracks },
        })
        .then(() => playlistStore.removeTracks(tracks))
        .catch((error) =>
          notification({
            msg: error.response.data?.error?.message ?? "Album delete failed",
            type: NotificationType.Error,
          }),
        );
    })
    .catch((error) =>
      notification({
        msg: error.response.data?.error?.message ?? "Album delete failed",
        type: NotificationType.Error,
      }),
    );
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

.play {
  $offset: 1rem;
  $size: 2.5rem;

  animation: pop-play-button 0.2s ease both;
  background: var(--primary-color);
  border: 0;
  border-radius: $size;
  bottom: $offset;
  color: color.change(white, $alpha: 0.8);
  cursor: pointer;
  display: none;
  font-size: 1.3rem;
  height: $size;
  left: $offset;
  line-height: 0;
  position: absolute;
  transition: transform ease 0.1s;
  width: $size;
  will-change: transform;

  &:hover {
    background: var(--primary-color-light);
    color: white;
  }

  &:active {
    background: var(--primary-color-lighter);
  }
}

.album {
  animation: popAlbum 1s ease both;
  color: var(--font-color);
  font-family: "IBM Plex Sans Condensed", Helvetica, Arial, sans-serif;
  line-height: 1.4;
  position: relative;

  &:hover {
    .play,
    .add,
    .delete {
      display: block;
    }

    .img {
      opacity: 0.4;
    }
  }
}

@keyframes pop-play-button {
  from {
    opacity: 0;
    transform: scale(0.8) rotate(50deg);
  }

  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes pop-add-button {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce {
  0% {
    transform: scale(0.8);
  }

  100% {
    transform: scale(1.2);
  }
}

.button-action {
  animation: pop-add-button 0.2s ease both;
  background-color: transparent;
  border: 0;
  border-radius: 20rem;
  color: currentcolor;
  cursor: pointer;
  display: none;
  font-size: 1.5rem;
  padding: 0.4rem 0.5rem;
  position: absolute;
  transition: transform ease 0.1s;
  will-change: transform;

  &:hover {
    background-color: color.change(black, $alpha: 0.5);
    color: currentcolor;
  }

  &.delete {
    left: 1rem;
    top: 1rem;
  }

  &.add {
    bottom: 1rem;
    right: 1rem;
  }
}

.current {
  $size: 3rem;

  background: var(--primary-color);
  border-radius: 0 0.4rem 0 0;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  height: $size;
  position: absolute;
  right: 0;
  top: 0;
  transition: all ease 0.2s;
  width: $size;
  z-index: 1;

  i {
    animation: bounce 0.5s cubic-bezier(1, 0, 1, 0) 0s infinite alternate;
    color: white;
    font-size: 1.2rem;
    position: absolute;
    right: 0.3rem;
    top: 0.3rem;
  }
}

.cover {
  border-radius: 0.4rem;
  margin-bottom: 0.8rem;
  position: relative;
  transition: box-shadow ease 0.2s;

  &.is-playing {
    box-shadow:
      0 0 0 0.3rem var(--bg-color),
      0 0 0 0.5rem var(--primary-color);
  }
}

.name {
  font-weight: bold;
  line-break: auto;
  margin: 0.3rem 0 0;
  word-break: break-word;
}

.date {
  font-size: 0.8rem;
  font-style: italic;
  opacity: 0.3;
}
</style>
