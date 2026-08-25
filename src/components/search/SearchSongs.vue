<template>
  <div class="song-list">
    <SearchTitle title="Songs" />
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
        <i class="track-icon icon-music" />
        <div>
          <div class="track-name font-bold">
            {{ track.name }}
          </div>
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
import ArtistList from "@/components/artist/ArtistList.vue";
import { useSearch } from "@/components/search/SearchStore";
import SearchTitle from "@/components/search/SearchTitle.vue";
import { playSong } from "@/helpers/play";

const searchStore = useSearch();
</script>

<style scoped>

.song-list {
  padding: 0 1rem;
}

.track {
  align-items: center;
  border-radius: 0.3rem;
  cursor: pointer;
  display: flex;
  gap: 0.8rem;
  padding: 0.8rem;
  transition: 0.2s;

  &:hover {
    background-color: var(--bg-color-light);
    transform: scale(1.03);
  }
}

.track-icon {
  font-size: var(--font-size-xl);
  opacity: 0.1;
}

.track-name {
  font-size: var(--font-size-sm);
}
</style>
