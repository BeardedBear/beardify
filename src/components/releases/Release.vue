<template>
  <div class="release-wrap">
    <button class="check" @click="releasesStore.toggleRelease(release.id)">
      <i v-if="releasesStore.checks?.includes(release.id)" class="icon-check"></i>
      <i v-else class="icon-circle"></i>
    </button>
    <div
      class="release"
      :class="{
        'is-playing': playerStore.currentlyPlaying.item?.artists[0].name.toLowerCase() === release.artist.toLowerCase(),
        checked: releasesStore.checks?.includes(release.id),
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
  </div>
</template>

<script lang="ts" setup>
import { useDialog } from "../dialog/DialogStore";
import { usePlayer } from "../player/PlayerStore";
import { useSearch } from "../search/SearchStore";
import { useReleases } from "../../views/releases/ReleasesStore";
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
  searchStore.updateQuery(`artist:${artist}  &  album:${album}`);
  dialogStore.open({ type: "search" });
}
</script>

<style lang="scss" scoped>
.release-wrap {
  display: flex;
  gap: 0.3rem;
  transition: 0.2s;
}

.check {
  background-color: transparent;
  border: none;
  color: var(--font-color);
  cursor: pointer;
  opacity: 0.2;
  position: relative;
  top: -0.1rem;
  transition: 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.release {
  align-items: center;
  border-radius: 0.4rem;
  cursor: pointer;
  display: grid;
  flex: 1;
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

  &.checked {
    opacity: 0.2;
  }

  &.is-playing {
    background-color: var(--primary-color);
  }

  .tags {
    font-size: 0.6rem;
    justify-content: end;
    text-align: right;
    text-transform: uppercase;

    .slug {
      background-color: var(--bg-color-lighter);
      border-radius: 2rem;
      display: inline-block;
      margin: 0.1rem 0;
      margin-left: 0.3rem;
      opacity: 0.3;
      padding: 0.1rem 0.5rem;

      &.selected {
        opacity: 1;
      }
    }
  }
}
</style>
