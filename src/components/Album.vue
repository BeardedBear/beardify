<template>
  <div class="album">
    <div v-if="currentlyPlayedId === album.uri" class="current">
      <i class="icon-volume-2" />
    </div>
    <div class="cover">
      <Cover size="medium" :images="album.images" class="img" @click="router.push(`/album/${props.album.id}`)" />
      <button class="play" type="button" @click="instance().put('me/player/play', { context_uri: album.uri })">
        <i class="icon-play" />
      </button>
      <button
        v-if="canSave"
        class="buttonAction add"
        type="button"
        @click="dialogStore.open({ type: 'addalbum', albumId: album.id })"
      >
        <i class="icon-save" />
      </button>
      <button v-if="canDelete" class="buttonAction delete" type="button" @click="deleteAlbum(album.id)">
        <i class="icon-trash-2" />
      </button>
    </div>
    <div v-if="!withoutMetas">
      <div class="name">
        {{ album.name }}
      </div>
      <div v-if="withArtists">
        <ArtistList :artist-list="album.artists" feat />
      </div>
      <div class="date">
        {{ album.release_date.split("-").shift() }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, PropType } from "vue";
import { Album, AlbumSimplified } from "../@types/Album";
import { instance } from "../api";
import router from "../router";
import Cover from "./Cover.vue";
import { Paging } from "../@types/Paging";
import { TrackSimplified, TrackToRemove } from "../@types/Track";
import { useRoute } from "vue-router";
import { useDialog } from "./dialog/DialogStore";
import { defaultAlbumSimplified } from "../@types/Defaults";
import ArtistList from "./ArtistList.vue";
import { usePlaylist } from "../views/playlist/PlaylistStore";

const props = defineProps({
  album: { default: defaultAlbumSimplified, type: Object as PropType<AlbumSimplified | Album> },
  currentlyPlayedId: { default: "", type: String as PropType<string> },
  withArtists: { default: false, type: Boolean as PropType<boolean> },
  withoutMetas: { default: false, type: Boolean as PropType<boolean> },
  canDelete: { default: false, type: Boolean as PropType<boolean> },
  canSave: { default: false, type: Boolean as PropType<boolean> },
});

const currentRouteId = useRoute().params.id;
const dialogStore = useDialog();
const playlistStore = usePlaylist();

function deleteAlbum(albumId: string): void {
  instance()
    .get<Paging<TrackSimplified>>(`albums/${albumId}/tracks`)
    .then((e) => {
      let tracks: TrackToRemove[] = [];

      e.data.items.map((t) => t.uri).forEach((t) => tracks.push({ uri: t }));

      instance()
        .delete(`playlists/${currentRouteId}/tracks`, {
          data: { tracks: tracks },
        })
        .then(() => playlistStore.removeTracks(tracks));
    });
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.img {
  transition: all ease 0.2s;
}

.play {
  $offset: 1vw;
  $size: 45px;
  animation: popPlayButton 0.2s ease both;
  background: var(--primary-color);
  border: 0;
  border-radius: $size;
  bottom: $offset;
  color: rgba(white, 0.8);
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
  position: relative;

  &:hover {
    .play,
    .add,
    .delete {
      display: block;
    }

    .img {
      opacity: 0.5;
    }
  }
}
@keyframes popPlayButton {
  from {
    opacity: 0;
    transform: scale(0.8) rotate(50deg);
  }
}
@keyframes popAddButton {
  from {
    opacity: 0;
    transform: scale(0.8);
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

.buttonAction {
  animation: popAddButton 0.2s ease both;
  background-color: transparent;
  border: 0;
  border-radius: 100px;
  color: currentColor;
  cursor: pointer;
  display: none;
  font-size: 1.5rem;
  padding: 5px 7px;
  position: absolute;
  transition: transform ease 0.1s;
  will-change: transform;

  &:hover {
    background-color: rgba(black, 0.5);
    color: currentColor;
  }

  &.delete {
    left: 1vw;
    top: 1vw;
  }

  &.add {
    bottom: 1vw;
    right: 1vw;
  }
}

.current {
  $size: 45px;
  background: var(--primary-color);
  border-radius: 0 4px 0 0;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  height: $size;
  position: absolute;
  right: 0;
  top: 0;
  width: $size;
  z-index: 1;

  i {
    animation: bounce 0.5s cubic-bezier(1, 0, 1, 0) 0s infinite alternate;
    color: white;
    font-size: 1.2rem;
    position: absolute;
    right: 4px;
    top: 3px;
  }
}

.cover {
  margin-bottom: 10px;
  position: relative;
}

.name {
  margin: 3px 0;
}

.date {
  font-size: 0.8rem;
  font-style: italic;
  opacity: 0.3;
}
</style>
