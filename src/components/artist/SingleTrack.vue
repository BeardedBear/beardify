<template>
  <div
    class="single"
    :class="{ active: playerStore.playerState?.track_window.current_track.uri === single.uri }"
    @click="playSingle(single.uri)"
  >
    <div class="what">
      <Cover :images="single.images" :size="'small'" class="cover" />
      <div>
        <div class="name">{{ single.name }}</div>
        <ArtistList :artist-list="single.artists" feat />
      </div>
    </div>
    <div class="release-date">{{ date(single.release_date) }}</div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { AlbumSimplified } from "../../@types/Album";
import { instance } from "../../api";
import { date } from "../../helpers/date";
import Cover from "../AlbumCover.vue";
import { usePlayer } from "../player/PlayerStore";
import ArtistList from "./ArtistList.vue";

defineProps<{
  single: AlbumSimplified;
}>();

const playerStore = usePlayer();

function playSingle(albumUri: string): void {
  instance().put("me/player/play", { context_uri: albumUri });
}
</script>

<style lang="scss" scoped>
.single {
  align-items: center;
  border-radius: 0.3rem;
  cursor: pointer;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  padding: 0.5rem;
  padding-right: 1rem;

  &:hover {
    background-color: var(--bg-color);
  }

  &:active {
    background-color: var(--bg-color-light);
  }
}

.what {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.release-date {
  font-size: 0.9rem;
  font-style: italic;
  opacity: 0.5;
}

.name {
  font-size: 0.9rem;
  font-weight: bold;
}

.cover {
  border-radius: 0.2rem;
  height: 2.4rem;
}
</style>
