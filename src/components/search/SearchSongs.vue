<template>
  <div>
    <template v-if="searchStore.albums.length">
      <div
        v-for="(track, index) in searchStore.tracks"
        :key="index"
        class="track"
        @click="
          () => {
            playSong(track.uri);
            searchStore.reset();
          }
        "
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
    <template v-else>Aucun morceau trouvé</template>
  </div>
</template>

<script lang="ts" setup>
import { playSong } from "../../helpers/Play";
import ArtistList from "../ArtistList.vue";
import { useSearch } from "./SearchStore";

const searchStore = useSearch();
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

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
    font-size: 1rem;
    font-weight: bold;
  }

  &:hover {
    background-color: var(--bg-color-light);
  }
}
</style>
