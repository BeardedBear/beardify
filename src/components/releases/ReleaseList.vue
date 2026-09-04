<template>
  <div class="content">
    <div v-for="month in releasesStore.monthGroups" :key="month.label" :data-month="month.label">
      <div class="month bd-font-bold">
        <span class="month-label">
          {{ month.label }}
          <span class="month-count">{{ month.releases.length }}</span>
        </span>
        <span v-if="month.unheard" class="month-unheard">{{ month.unheard }} unheard</span>
        <button
          v-if="month.unheard"
          class="month-heard"
          type="button"
          @click="releasesStore.markHeard(month.releases.map((release) => release.key))"
        >
          <CheckCheck :size="14" />
          Mark heard
        </button>
      </div>
      <div v-if="month.top.length" class="top">
        <div class="top-heading bd-font-bold">Top of the month</div>
        <div class="top-row">
          <!--
            The play control is a sibling of the card, not a child: the card is
            itself a <button>, and a button inside a button is not a DOM the
            browser will keep. The wrapper is what lets it sit over the cover.
          -->
          <div
            v-for="(release, rank) in month.top"
            :key="release.key"
            class="top-card-wrap"
            @mouseenter="lookupReleaseAlbum(release)"
            @mouseleave="cancelReleaseAlbumLookup()"
          >
            <button
              class="top-card"
              type="button"
              @click="searchStore.openAlbumSearch(release.key, release.artistName, release.name)"
            >
              <span class="top-cover-wrap">
                <Cover :images="release.images" class="top-cover" size="medium" />
                <span
                  v-if="albumLoading(release.key)"
                  class="top-cover-loading"
                  aria-live="polite"
                  aria-label="Searching"
                >
                  <BdLoader size="x-small" />
                </span>
                <span class="rank bd-font-bold">{{ rank + 1 }}</span>
              </span>
              <span class="top-name bd-font-bold">{{ release.name }}</span>
              <span class="top-artist">{{ release.artistName }}</span>
              <span
                v-if="typeof release.rating === 'number'"
                :class="{ 'is-hot': release.rating >= HOT_RATING }"
                :style="{ '--score': release.rating }"
                class="top-rating score-color"
              >{{ release.rating }}<span class="unit"></span></span>
            </button>
            <button
              v-if="!albumLoading(release.key) && playableUri(release.key)"
              :aria-label="`Play ${release.name}`"
              class="top-play"
              type="button"
              @click="playAlbum(playableUri(release.key)!)"
            >
              <Play :size="22" />
            </button>
          </div>
        </div>
      </div>
      <Release v-for="release in month.releases" :key="release.key" :release="release" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CheckCheck, Play } from "@lucide/vue";
import { BdLoader } from "bearded-ui";

import Release from "@/components/releases/ReleaseIndex.vue";
import { useSearch } from "@/components/search/SearchStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { playAlbum } from "@/helpers/playAlbum";
import { cancelReleaseAlbumLookup, lookupReleaseAlbum, releaseAlbum } from "@/helpers/releaseAlbum";
import { HOT_RATING } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();
const searchStore = useSearch();

/**
 * Whether either search tagged to this release key is still in flight — the
 * modal one a click starts, or the hover lookup behind the play control.
 * @param key - Release key
 */
function albumLoading(key: string): boolean {
  return searchStore.activeAlbumKey === key || Boolean(releaseAlbum(key)?.pending);
}

/**
 * The album URI a hover resolved, once it answered with something playable.
 * @param key - Release key
 */
function playableUri(key: string): string | undefined {
  return releaseAlbum(key)?.uri ?? undefined;
}
</script>

<style scoped>
.content {
  padding: 0 var(--bd-space-6) var(--bd-space-6);

  @media (--mobile) {
    padding: 0 var(--bd-space-2) var(--bd-space-2);
  }
}

.month {
  align-items: center;
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-3) var(--bd-space-2);
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}

.month-label {
  align-items: center;
  display: flex;
  gap: var(--bd-space-2);
}

.month-count {
  background-color: var(--bd-bg-lighter);
  border-radius: var(--bd-radius-full);
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: 0 var(--bd-space-2);
}

.month-unheard {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  margin-inline-start: auto;
  text-transform: none;
}

.month-heard {
  align-items: center;
  background: none;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-dark);
  cursor: pointer;
  display: inline-flex;
  font-size: var(--bd-font-size-xs);
  gap: var(--bd-space-1);
  padding: var(--bd-space-1) var(--bd-space-2);

  &:hover {
    background-color: var(--bd-bg-light);
    color: var(--bd-font-color-light);
  }
}

.top {
  padding: var(--bd-space-3) var(--bd-space-3) var(--bd-space-2);
}

.top-heading {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  margin-bottom: var(--bd-space-2);
}

.top-row {
  display: flex;
  gap: var(--bd-space-4);
  overflow-x: auto;
  padding-bottom: var(--bd-space-2);
}

.top-card-wrap {
  flex: 0 0 auto;
  position: relative;
}

.top-card {
  align-items: flex-start;
  background-color: transparent;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
  padding: var(--bd-space-2);
  width: 7.5rem;
}

/* The card lights up from the wrapper, so pointing at the play control still
   reads as pointing at the card it belongs to. */
.top-card-wrap:hover .top-card {
  background-color: var(--bd-bg-light);
}

/*
 * Sits exactly on the artwork without being inside it: the card pads by
 * space-2 and the cover fills the rest of that width, so the same inset plus a
 * square aspect ratio lands on the cover box. Its own translucent ground dims
 * the artwork — no second overlay.
 */
.top-play {
  align-items: center;
  aspect-ratio: 1;
  background-color: color-mix(in oklab, var(--bd-bg-darker) 55%, transparent);
  border: none;
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-light);
  cursor: pointer;
  display: flex;
  inset: var(--bd-space-2) var(--bd-space-2) auto;
  justify-content: center;
  opacity: 0;
  padding: 0;
  position: absolute;
  transition: opacity var(--bd-transition-fast);

  &:hover {
    color: var(--bd-primary-light);
  }
}

.top-play:focus-visible,
.top-card-wrap:hover .top-play {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .top-play {
    transition: none;
  }
}

/* isolation: isolates the rank's z-index HERE, or it leaks up and outranks the
   sticky month header (z-index 1) when the rail scrolls beneath it. */
.top-cover {
  border-radius: var(--bd-radius-sm);
  width: 100%;
}

.top-cover-wrap {
  isolation: isolate;
  position: relative;
  width: 100%;

  &:has(.top-cover-loading) .top-cover {
    opacity: 0.4;
  }
}

.top-cover-loading {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  display: flex;
  height: 100%;
  inset: 0;
  justify-content: center;
  position: absolute;
  width: 100%;
}

/* Rank badge, corner-pinned over the cover — same position as the artist page's
   ranked-album cards so the visual language of "a best-of rail" stays consistent. */
.rank {
  backdrop-filter: blur(2px);
  background: color-mix(in oklab, var(--bd-bg-darker) 82%, transparent);
  border-radius: var(--bd-radius-sm);
  bottom: 0.3rem;
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-lg);
  left: 0.3rem;
  line-height: 1;
  padding: 0.15rem var(--bd-space-2);
  position: absolute;
  z-index: 2;
}

.top-name {
  font-size: var(--bd-font-size-base);
  line-height: 1.2;
  margin-top: var(--bd-space-1);
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.top-artist {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

/* Colours come from `.score-color` (src/assets/css/score.css). */
.top-rating {
  border-radius: var(--bd-radius-sm);
  font-size: var(--bd-font-size-sm);
  margin-top: var(--bd-space-1);
  padding: 0.1rem var(--bd-space-2);

  .unit {
    font-size: var(--bd-font-size-xs);
    padding-inline-start: 0.1rem;
  }
}
</style>
