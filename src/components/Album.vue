<template>
  <div class="album">
    <div class="cover">
      <img class="img" :src="album.images[1].url" alt="" />
      <button class="play" type="button" @click="playAlbum(album.uri)">
        <i class="icon-play"></i>
      </button>
    </div>
    <div class="name">{{ album.name }}</div>
    <div class="date">{{ album.release_date.split("-").shift() }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { AlbumSimplified, defaultAlbumSimplified } from "../@types/Artist";
import { RootState } from "../@types/rootStore";
import { instance } from "../api";

export default defineComponent({
  props: {
    album: { default: defaultAlbumSimplified, type: Object as PropType<AlbumSimplified> }
  },
  setup() {
    const store = useStore<RootState>();

    function playAlbum(albumId: string) {
      instance.put("https://api.spotify.com/v1/me/player/play", { context_uri: albumId });
    }

    return { store, playAlbum };
  }
});
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

@keyframes popAlbum {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.album {
  animation: popAlbum 1s ease both;
  &:hover {
    .play {
      display: block;
    }
  }
}
@keyframes popPlayButton {
  from {
    transform: scale(0.8) rotate(50deg);
  }
}

.play {
  $offset: 20px;
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
  background: $primary-color;
  color: currentColor;
  cursor: pointer;
  transition: transform ease 0.1s;
  will-change: transform;
  display: none;

  &:hover {
    background: $primary-color-light;
  }

  &:active {
    background: $primary-color-lighter;
  }
}

.cover {
  position: relative;
}
.img {
  width: 100%;
  border-radius: 4px;
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
