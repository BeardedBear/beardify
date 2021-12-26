<template>
  <div class="content">
    <div v-for="(month, index) in releasesStore.monthList" :key="index">
      <div class="month">{{ month }}</div>
      <template v-for="release in releasesStore.releases.sort((a, b) => b.note - a.note)" :key="release.id">
        <div
          v-if="
            (release.releaseDate === month && !releasesStore.activeSlug) ||
            (releasesStore.activeSlug && release.slug.includes(releasesStore.activeSlug))
          "
          class="release"
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
              >{{ slug }}</span
            >
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useDialog } from "../../components/dialog/DialogStore";
import { useSearch } from "../../components/search/SearchStore";
import { useReleases } from "./ReleasesStore";

const releasesStore = useReleases();
const searchStore = useSearch();
const dialogStore = useDialog();

function search(artist: string, album: string): void {
  searchStore.updateQuery(`artist:${artist} & album:${album}`);
  dialogStore.open({ type: "search" });
}

releasesStore.getReleases();
</script>

<style lang="scss" scoped>
.month {
  background-color: var(--bg-color-darker);
  color: var(--primary-color);

  // font-size: 1.2rem;
  font-weight: bold;
  padding: 1rem 0.5rem;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}

.content {
  padding: 0 2rem;
}

.release {
  align-items: center;
  border-radius: 0.4rem;
  cursor: pointer;
  display: grid;
  font-size: 0.9rem;
  font-weight: bold;
  grid-template-columns: 0.6fr 0.6fr 1fr;
  justify-content: space-between;
  padding: 0.5rem 0.8rem;
  transition: background-color 0.1s;

  &:nth-child(even) {
    background-color: var(--bg-color);
  }

  &:hover {
    background-color: var(--bg-color-light);
  }

  .tags {
    align-items: center;
    display: flex;
    font-style: italic;
    font-weight: normal;
    gap: 0.3rem;
    justify-content: end;
    text-align: right;

    .slug {
      background-color: var(--bg-color-lighter);
      border-radius: 2rem;
      display: inline-block;
      font-size: 0.8rem;
      opacity: 0.5;
      padding: 0 0.5rem;

      &.selected {
        background-color: var(--primary-color);
        opacity: 1;
      }
    }
  }
}
</style>
