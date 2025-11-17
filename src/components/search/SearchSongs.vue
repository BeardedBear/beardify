<template>
  <div>
    <SearchTitle title="Songs" />
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
        <i class="track-icon icon-music" />
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
import SearchTitle from "./SearchTitle.vue";

const searchStore = useSearch();
</script>

<style lang="scss" scoped>
@use "../../assets/scss/colors" as colors;
@use "../../assets/scss/search-item" as search;

.track {
  align-items: center;
  border-radius: 0.3rem;
  cursor: pointer;
  display: flex;
  gap: 0.8rem;
  padding: 0.8rem;
  transition: 0.2s;

  @include search.search-item-hover;
}

.track-icon {
  font-size: 1.5rem;
  opacity: 0.1;
}

.track-name {
  font-size: 0.9rem;
  font-weight: bold;
}
</style>
