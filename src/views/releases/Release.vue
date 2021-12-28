<template>
  <div
    class="release"
    :class="{
      'is-playing': playerStore.currentlyPlaying.item?.artists[0].name.toLowerCase() === release.artist.toLowerCase(),
    }"
    @click="search(release.artist, release.album)"
  >
    <div>{{ release.artist }}</div>
    <div>{{ release.album }}</div>
    <div class="tags">
      <span
        v-for="(slug, ii) in release.slug"
        :key="ii"
        class="slug"
        :class="{ selected: releasesStore.activeSlug === slug }"
      >
        {{ slug }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDialog } from "../../components/dialog/DialogStore";
import { usePlayer } from "../../components/player/PlayerStore";
import { useSearch } from "../../components/search/SearchStore";
import { useReleases } from "./ReleasesStore";
import { defineProps } from "vue";
import { Release } from "../../@types/Releases";

defineProps<{
  release: Release;
}>();

const releasesStore = useReleases();
const searchStore = useSearch();
const dialogStore = useDialog();
const playerStore = usePlayer();

function search(artist: string, album: string): void {
  searchStore.updateQuery(`artist:${artist} & album:${album}`);
  dialogStore.open({ type: "search" });
}
</script>

<style lang="scss" scoped>
.release {
  align-items: center;
  border-radius: 0.4rem;
  cursor: pointer;
  display: grid;
  font-size: 0.9rem;
  font-weight: bold;
  grid-template-columns: 0.6fr 0.6fr 1fr;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  padding: 0.3rem 0.8rem;
  transition: background-color 0.1s;

  &:nth-child(even) {
    background-color: var(--bg-color);
  }

  &:hover {
    background-color: var(--bg-color-light);
  }

  &.is-playing {
    background-color: var(--primary-color);
  }

  .tags {
    align-items: center;
    display: flex;
    font-size: 0.6rem;
    gap: 0.3rem;
    justify-content: end;
    text-align: right;
    text-transform: uppercase;

    .slug {
      background-color: var(--bg-color-lighter);
      border-radius: 2rem;
      display: inline-block;
      opacity: 0.3;
      padding: 0.1rem 0.5rem;

      &.selected {
        opacity: 1;
      }
    }
  }
}
</style>
