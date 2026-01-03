<template>
  <div class="release-wrap">
    <ButtonIndex no-default-class class="check" @click="releasesStore.toggleRelease(release.id)">
      <i class="icon-check" v-if="releasesStore.checks?.find((r) => r.id === release.id)"></i>
      <i class="icon-circle" v-else></i>
    </ButtonIndex>
    <div
      :class="{
        'is-playing': playerStore.currentlyPlaying.item?.artists[0].name.toLowerCase() === release.artist.toLowerCase(),
        checked: releasesStore.checks?.find((r) => r.id === release.id),
      }"
      @click="search(release.artist, release.album)"
      class="release"
    >
      <div>{{ release.artist }}</div>
      <div>{{ release.album }}</div>
      <div class="tags">
        <span
          :class="{ selected: releasesStore.activeSlug === slug }"
          :key="ii"
          class="slug"
          v-for="(slug, ii) in release.slug"
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
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
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

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

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

  @include font-bold;

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
