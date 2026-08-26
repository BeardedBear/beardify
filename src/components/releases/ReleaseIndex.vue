<template>
  <div class="release-wrap">
    <button type="button" class="check" @click="releasesStore.toggleRelease(release.id)">
      <i v-if="releasesStore.checks?.find((r) => r.id === release.id)" class="icon-check" />
      <i v-else class="icon-circle" />
    </button>
    <div
      :class="{
        'is-playing': playerStore.currentlyPlaying.item?.artists[0].name.toLowerCase() === release.artist.toLowerCase(),
        checked: releasesStore.checks?.find((r) => r.id === release.id),
      }"
      class="release bd-font-bold"
      @click="search(release.artist, release.album)"
    >
      <div>{{ release.artist }}</div>
      <div>{{ release.album }}</div>
      <div class="tags">
        <span
          v-for="(slug, ii) in release.slug"
          :key="ii"
          :class="{ selected: releasesStore.activeSlug === slug }"
          class="slug"
        >
          {{ slug }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Release } from "@/@types/Releases";
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import { useSearch } from "@/components/search/SearchStore";
import { useReleases } from "@/views/releases/ReleasesStore";

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

<style scoped>

.release-wrap {
  display: flex;
  gap: var(--bd-space-1);
  transition: background-color var(--bd-transition);
}

.check {
  background-color: transparent;
  border: none;
  color: var(--bd-font-color);
  cursor: pointer;
  opacity: 0.2;
  position: relative;
  top: -0.1rem;
  transition: opacity var(--bd-transition);

  &:hover {
    opacity: 0.8;
  }
}

.release {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  cursor: pointer;
  display: grid;
  flex: 1;
  font-size: var(--bd-font-size-sm);
  grid-template-columns: 0.6fr 0.6fr 1fr;
  justify-content: space-between;
  margin-bottom: var(--bd-space-1);
  padding: var(--bd-space-1) var(--bd-space-3);
  transition: background-color var(--bd-transition-fast);

  &:nth-child(even) {
    background-color: var(--bd-bg);
  }

  &:hover {
    background-color: var(--bd-bg-light);
  }

  &.checked {
    opacity: 0.2;
  }

  &.is-playing {
    background-color: var(--bd-primary);
  }

  .tags {
    font-size: var(--bd-font-size-xs);
    justify-content: end;
    text-align: right;
    text-transform: uppercase;

    .slug {
      background-color: var(--bd-bg-lighter);
      border-radius: var(--bd-radius-full);
      color: var(--bd-font-color-dark);
      display: inline-block;
      margin: 0.1rem 0;
      margin-left: var(--bd-space-1);
      padding: 0.1rem var(--bd-space-2);

      &.selected {
        opacity: 1;
      }
    }
  }
}
</style>
