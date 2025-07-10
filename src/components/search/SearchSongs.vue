<template>
  <div>
    <h3 class="search-title">Songs</h3>
    <template v-if="searchStore.albums.length">
      <div
        :key="index"
        @click="
          () => {
            playSong(track.uri);
            searchStore.reset();
          }
        "
        class="track"
        v-for="(track, index) in searchStore.tracks"
      >
        <i class="track__icon icon-music" />
        <div>
          <div class="track-name">{{ track.name }}</div>
          <div>
            <ArtistList :artist-list="track.artists" feat />
          </div>
        </div>
      </div>
    </template>
    <template v-else>No track found</template>
  </div>
</template>

<script lang="ts" setup>
import { playSong } from "../../helpers/play";
import ArtistList from "../artist/ArtistList.vue";
import { useSearch } from "./SearchStore";

const searchStore = useSearch();
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/scss/colors" as colors;

.search-title {
  color: var(--primary-color);
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0 0 1rem;
  text-transform: uppercase;
}

.track {
  align-items: center;
  border-radius: 0.3rem;
  cursor: pointer;
  display: flex;
  gap: 0.8rem;
  padding: 0.8rem;

  &__icon {
    font-size: 1.5rem;
    opacity: 0.1;
  }

  &-name {
    font-size: 0.9rem;
    font-weight: bold;
  }

  &:hover {
    background-color: var(--bg-color-light);
  }
}
</style>
