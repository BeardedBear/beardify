<template>
  <div class="album">
    <div v-if="currentlyPlayedId === album.uri" class="current">
      <i class="icon-volume-2" />
    </div>
    <div class="cover">
      <Cover size="medium" :images="album.images" class="img" @click="goAlbum()" />
      <button class="play" type="button" @click="playAlbum(album.uri)">
        <i class="icon-play" />
      </button>
      <button v-if="canSave" class="buttonAction add" type="button" @click="addAlbum('addalbum', album.id)">
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

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { Album, AlbumSimplified } from "../@types/Album";
import { RootState } from "../@types/RootState";
import { instance } from "../api";
import { defaultAlbumSimplified } from "../@types/Defaults";
import router from "../router";
import Cover from "./Cover.vue";
import ArtistList from "./ArtistList.vue";
import { Mutations } from "./dialog/DialogStore";
import { Dialog, DialogType } from "../@types/Dialog";
import { Paging } from "../@types/Paging";
import { TrackSimplified, TrackToRemove } from "../@types/Track";
import { useRoute } from "vue-router";
import { Mutations as PlaylistMutation } from "../views/playlist/PlaylistStore";

export default defineComponent({
  components: { ArtistList, Cover },
  props: {
    album: { default: defaultAlbumSimplified, type: Object as PropType<AlbumSimplified | Album> },
    currentlyPlayedId: { default: "", type: String as PropType<string> },
    withArtists: { default: false, type: Boolean as PropType<boolean> },
    withoutMetas: { default: false, type: Boolean as PropType<boolean> },
    canDelete: { default: false, type: Boolean as PropType<boolean> },
    canSave: { default: false, type: Boolean as PropType<boolean> },
  },
  setup(props) {
    const store = useStore<RootState>();
    const currentRouteId = useRoute().params.id;

    function playAlbum(albumId: string): void {
      instance.put("me/player/play", { context_uri: albumId });
    }

    function goAlbum(): void {
      router.push(`/album/${props.album.id}`);
    }

    function addAlbum(type: DialogType, albumId: string): void {
      store.commit(Mutations.OPEN_DIALOG, { type, albumId } as Dialog);
    }

    function deleteAlbum(albumId: string): void {
      instance.get<Paging<TrackSimplified>>(`albums/${albumId}/tracks`).then((e) => {
        let tracks: TrackToRemove[] = [];

        e.data.items.map((t) => t.uri).forEach((t) => tracks.push({ uri: t }));

        instance
          .delete(`playlists/${currentRouteId}/tracks`, {
            data: { tracks },
          })
          .then(() => store.commit(PlaylistMutation.REMOVE_TRACKS, tracks));
      });
    }

    return { deleteAlbum, addAlbum, playAlbum, goAlbum };
  },
});
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

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
  position: absolute;
  border: 0;
  background-color: transparent;
  color: currentColor;
  font-size: 1.5rem;
  padding: 5px 7px;
  transition: transform ease 0.1s;
  will-change: transform;
  display: none;
  cursor: pointer;
  border-radius: 100px;

  &:hover {
    background-color: rgba(black, 0.5);
    color: currentColor;
  }

  &.delete {
    top: 1vw;
    left: 1vw;
  }

  &.add {
    bottom: 1vw;
    right: 1vw;
  }
}

.img {
  transition: all ease 0.2s;
}

.current {
  $size: 45px;
  height: $size;
  width: $size;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  background: var(--primary-color);
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  border-radius: 0 4px 0 0;

  i {
    animation: bounce 0.5s cubic-bezier(1, 0, 1, 0) 0s infinite alternate;
    position: absolute;
    top: 3px;
    right: 4px;
    font-size: 1.2rem;
    color: white;
  }
}
.play {
  $offset: 1vw;
  $size: 45px;
  animation: popPlayButton 0.2s ease both;
  font-size: 1.3rem;
  height: $size;
  line-height: 0;
  width: $size;
  border-radius: $size;
  position: absolute;
  bottom: $offset;
  left: $offset;
  border: 0;
  background: var(--primary-color);
  color: rgba(white, 0.8);
  cursor: pointer;
  transition: transform ease 0.1s;
  will-change: transform;
  display: none;

  &:hover {
    background: var(--primary-color-light);
    color: white;
  }

  &:active {
    background: var(--primary-color-lighter);
  }
}

.cover {
  position: relative;
  margin-bottom: 10px;
}

.name {
  margin: 3px 0;
}

.date {
  font-style: italic;
  opacity: 0.3;
  font-size: 0.8rem;
}
</style>
