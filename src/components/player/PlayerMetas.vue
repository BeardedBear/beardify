<template>
  <!-- <pre>{{ currentTrack }}</pre> -->
  <!-- {{ currentTrack.album.images }} -->
  <div class="what" v-if="currentTrack">
    <div class="cover-wrap">
      <img :src="currentTrack.album.images[1].url || ''" class="cover" v-if="currentTrack.album.images.length" />
      <div @click="dialogStore.open({ type: 'addSong', track: currentTrack })" class="hover">
        <i class="add icon-plus"></i>
      </div>
    </div>
    <div>
      <div>
        <span class="trackname"> {{ currentTrack.name }} — </span>
        <ArtistList :artist-list="currentTrack.artists" :feat="true" />
      </div>
      <div class="album">
        <router-link :to="`/album/${transformUriToid(currentTrack.album.uri)}`" class="link">
          {{ currentTrack.album.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

import { transformUriToid } from "../../helpers/helper";
import ArtistList from "../artist/ArtistList.vue";
import { useDialog } from "../dialog/DialogStore";
import { usePlayer } from "./PlayerStore";

const playerStore = usePlayer();
const dialogStore = useDialog();
const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);
</script>

<style lang="scss" scoped>
@use "sass:color";

.cover {
  border-radius: 0.3rem;
  display: block;
}

.cover-wrap {
  position: relative;

  .add {
    font-size: 1.4rem;
    transition: 0.2s;
    will-change: transform;

    &:hover {
      transform: scale(1.2);
    }
  }

  .hover {
    align-items: center;
    background-color: color.change(black, $alpha: 0.8);
    border-radius: 0.3rem;
    cursor: pointer;
    display: flex;
    inset: 0;
    justify-content: center;
    opacity: 0;
    position: absolute;
    transition: 0.2s;
  }

  &:hover {
    .hover {
      opacity: 1;
    }
  }
}

.trackname {
  font-weight: bold;
}

.artistname {
  color: currentcolor;
  font-weight: 700;
  text-decoration: none;
}

.album {
  font-size: 0.9rem;
  font-style: italic;

  .link {
    color: currentcolor;
    cursor: pointer;
    font-size: 0.9rem;
    font-style: italic;
    opacity: 0.5;
    text-decoration: none;

    &:hover {
      color: var(--primary-color);
      opacity: 1;
    }
  }
}

.what {
  align-items: center;
  display: flex;
  gap: 1rem;

  img {
    height: 3rem;
  }
}
</style>
