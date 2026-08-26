<template>
  <div class="song-list">
    <SearchTitle :count="searchStore.tracks.length" title="Songs" />
    <template v-if="searchStore.tracks.length">
      <!--
        A button, not a div: artists and podcasts are router-links and so are
        keyboard-reachable, but this column was a click handler on a plain div —
        tabbing through the modal skipped every song.
      -->
      <button
        v-for="track in searchStore.tracks"
        :key="track.id"
        class="track"
        data-search-hit
        type="button"
        @click="
          () => {
            playSong(track.uri);
            searchStore.close();
          }
        "
      >
        <i class="track-icon icon-music" />
        <div>
          <div class="track-name bd-font-bold">
            {{ track.name }}
          </div>
          <div>
            <ArtistList :artist-list="track.artists" feat />
          </div>
        </div>
      </button>
    </template>
    <template v-else-if="searchStore.loading"><BdLoader size="small" /></template>
    <template v-else>No song found</template>
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";

import ArtistList from "@/components/artist/ArtistList.vue";
import { useSearch } from "@/components/search/SearchStore";
import SearchTitle from "@/components/search/SearchTitle.vue";
import { playSong } from "@/helpers/play";

const searchStore = useSearch();
</script>

<style scoped>

.song-list {
  padding: 0 var(--bd-space-4);
}

.track {
  align-items: center;
  background: none;
  border: 0;
  border-radius: var(--bd-radius-sm);
  color: inherit;
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: var(--bd-space-3);
  padding: var(--bd-space-2);
  text-align: left;
  transition: background-color var(--bd-transition-fast);
  width: 100%;

  &:hover {
    background-color: var(--bd-bg-light);
  }
}

.track-icon {
  font-size: var(--bd-font-size-xl);
  opacity: 0.1;
}

.track-name {
  font-size: var(--bd-font-size-sm);
}
</style>
