<template>
  <!--
    The lookup runs on focus as well as on hover: the play control only exists once
    it has answered, so nothing inside the cover is focusable until then — waiting
    for a focus that can never arrive is what closed this row's main action to the
    keyboard entirely. Focusing the album title is the same intent as pointing at it.
  -->
  <div
    :class="{ checked: isChecked }"
    class="release"
    @focusin="lookupReleaseAlbum(release)"
    @mouseleave="cancelReleaseAlbumLookup()"
  >
    <button
      :aria-label="isChecked ? `Mark ${release.name} as not listened` : `Mark ${release.name} as listened`"
      :aria-pressed="isChecked"
      class="check"
      type="button"
      @click="releasesStore.toggleCheck(release.key)"
    >
      <Check v-if="isChecked" :size="16" />
      <Circle v-else :size="16" />
    </button>

    <span class="cover-wrap" @mouseenter="lookupReleaseAlbum(release)">
      <Cover :images="release.images" class="cover" size="small" />
      <span v-if="isSearching" class="cover-loading" aria-live="polite" aria-label="Searching">
        <BdLoader size="xx-small" />
      </span>
      <button
        v-else-if="playableUri"
        :aria-label="`Play ${release.name}`"
        class="cover-play"
        type="button"
        @click="playAlbum(playableUri)"
      >
        <Play :size="14" />
      </button>
      <!--
        A third state, because the search answering with nothing used to render as
        nothing at all — indistinguishable from a hover too short to have fired. An
        empty answer is information: this record is not on Spotify.
      -->
      <BdTooltip v-else-if="isUnplayable" bare content="Not on Spotify">
        <span aria-label="Not on Spotify" class="cover-missing" role="img">
          <Ban :size="14" />
        </span>
      </BdTooltip>
    </span>

    <div class="names">
      <!-- Both names are clipped to their column, so each carries its own full text. -->
      <button
        :title="release.name"
        class="album bd-font-bold"
        type="button"
        @click="searchStore.openAlbumSearch(release.key, release.artistName, release.name)"
      >
        {{ release.name }}
      </button>
      <button
        :title="release.artistName"
        class="artist"
        type="button"
        @click="searchStore.openAlbumSearch(release.key, release.artistName)"
      >
        {{ release.artistName }}
      </button>
    </div>

    <div class="genres">
      <BdTooltip
        v-for="genre in shownGenres"
        :key="genre"
        :content="`Filter the feed to ${genre}`"
        bare
      >
        <button
          :aria-pressed="releasesStore.genres.includes(genre)"
          :class="{ 'is-active': releasesStore.genres.includes(genre) }"
          class="genre"
          type="button"
          @click="releasesStore.toggleGenre(genre)"
        >
          {{ genre }}
        </button>
      </BdTooltip>
    </div>

    <!--
      The score, absent for a release the listing has not rated. Tested by type rather
      than against null: a row restored from a cache written before this field existed
      has it `undefined`, which `!== null` lets through.

      No release date beside it: the source dates to the month and no further, which
      the month heading above already says.
    -->
    <div class="rating">
      <BdTooltip v-if="typeof release.rating === 'number'" bare content="Critic rating out of 100">
        <span
          :class="{ 'is-hot': release.rating >= HOT_RATING }"
          :style="{ '--score': release.rating }"
          class="score score-color"
        >{{ release.rating }}</span>
      </BdTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ban, Check, Circle, Play } from "@lucide/vue";
import { BdLoader, BdTooltip } from "bearded-ui";
import { computed } from "vue";

import { Release } from "@/@types/Releases";
import { useSearch } from "@/components/search/SearchStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { playAlbum } from "@/helpers/playAlbum";
import { cancelReleaseAlbumLookup, lookupReleaseAlbum, releaseAlbum } from "@/helpers/releaseAlbum";
import { HOT_RATING } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

/** The scrapers file up to a dozen micro-genres per release; past three the row is a wall of tags. */
const GENRES_SHOWN = 3;

const props = defineProps<{
  release: Release;
}>();

const releasesStore = useReleases();
const searchStore = useSearch();

const isChecked = computed(() => Boolean(releasesStore.checks[props.release.key]));
/*
 * One loader for two waits, because from the row's side they are the same wait:
 * the modal search a click starts, and the hover lookup that decides whether
 * this cover can be played straight from here.
 */
const isSearching = computed(
  () => searchStore.activeAlbumKey === props.release.key || Boolean(releaseAlbum(props.release.key)?.pending),
);
/** Set only once the lookup has answered with an album this account can play. */
const playableUri = computed(() => releaseAlbum(props.release.key)?.uri ?? undefined);
/* The search ran and came back empty — a resolved absence, not a lookup that never happened. */
const isUnplayable = computed(() => {
  const album = releaseAlbum(props.release.key);

  return Boolean(album) && !album?.pending && !album?.uri;
});
// Sliced here, not in the template, so an unrelated re-render does not reallocate it.
const shownGenres = computed(() => props.release.genres.slice(0, GENRES_SHOWN));
</script>

<style scoped>
.release {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  display: grid;
  gap: var(--bd-space-3);
  grid-template-columns: 1.2rem 2.5rem minmax(0, 1.4fr) minmax(0, 1fr) 4rem;
  padding: var(--bd-space-2) var(--bd-space-3);
  transition: background-color var(--bd-transition-fast);

  &:hover {
    background-color: var(--bd-bg-light);
  }

  @media (--tablet-down) {
    /* Genres drop out, but the rating keeps a column — left in the flow it would
       wrap onto an implicit second row and hang under the checkbox. */
    grid-template-columns: 1.2rem 2.5rem minmax(0, 1fr) auto;

    .genres {
      display: none;
    }
  }
}

.check {
  background-color: transparent;
  border: none;
  color: var(--bd-font-color);
  cursor: pointer;
  display: block;
  height: 1.5rem;
  margin: auto 0;
  opacity: 0.65;
  padding: 0;
  transition: opacity var(--bd-transition);
  width: 1.5rem;

  &:hover {
    opacity: 1;
  }
}

.release.checked .check {
  color: var(--bd-primary);
  opacity: 1;
}

.cover {
  border-radius: var(--bd-radius-sm);
  height: 2.5rem;
  object-fit: cover;
  width: 2.5rem;
}

.cover-wrap {
  height: 2.5rem;
  position: relative;
  transition: opacity var(--bd-transition-fast);
  width: 2.5rem;

  &:has(.cover-loading) .cover {
    opacity: 0.4;
  }
}

/*
 * The cover becomes the control rather than growing a neighbour: at 2.5rem
 * there is no room beside it, and the row's four columns are already spoken
 * for. Its own translucent ground is what dims the artwork underneath — one
 * mechanism, not a dim plus an overlay.
 *
 * Hidden until the row is hovered, because the answer is cached: without the
 * gate, every cover the pointer has ever crossed would keep a play button lit
 * on a row nobody is pointing at.
 */
.cover-play {
  align-items: center;
  background-color: color-mix(in oklab, var(--bd-bg-darker) 55%, transparent);
  border: none;
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-light);
  cursor: pointer;
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: 0;
  padding: 0;
  position: absolute;
  transition: opacity var(--bd-transition-fast);

  &:hover {
    color: var(--bd-primary-light);
  }
}

.cover-play:focus-visible,
.release:hover .cover-play {
  opacity: 1;
}

/* The play control's footprint, gated the same way: the answer is cached, so an
   ungated marker would sit on every cover the pointer has ever crossed. */
.cover-missing {
  align-items: center;
  background-color: color-mix(in oklab, var(--bd-bg-darker) 55%, transparent);
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color);
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: 0;
  position: absolute;
  transition: opacity var(--bd-transition-fast);
}

.release:hover .cover-missing {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .cover-missing,
  .cover-play {
    transition: none;
  }
}

.cover-loading {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.names {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.album,
.artist {
  background-color: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: var(--bd-font-size-base);
  overflow: hidden;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--bd-primary);
    text-decoration: underline;
  }
}

.artist {
  align-items: center;
  color: var(--bd-font-color-dark);
  display: flex;
  gap: var(--bd-space-1);
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bd-space-1);
  justify-content: flex-end;
}

.genre {
  background-color: var(--bd-bg-lighter);
  border: none;
  border-radius: var(--bd-radius-full);
  color: var(--bd-font-color-dark);
  cursor: pointer;
  font-size: var(--bd-font-size-xs);
  padding: 0.1rem var(--bd-space-2);
  text-transform: uppercase;
  white-space: nowrap;

  &:hover {
    background-color: var(--bd-bg-light);
    color: var(--bd-font-color-light);
  }

  &.is-active {
    background-color: var(--bd-primary);
    color: var(--bd-on-primary);
  }
}

.rating {
  font-size: var(--bd-font-size-xs);
  text-align: right;

  /* Colours come from `.score-color` (src/assets/css/score.css) — only the box
     is decided here. */
  .score {
    border-radius: var(--bd-radius-sm);
    padding: 0.1rem var(--bd-space-2);
  }
}

/*
 * Ticked off, not greyed out. Dimming the whole row also dimmed the album title,
 * which is the only thing on the row that identifies it — so a month worked through
 * became unreadable exactly where it was the record of the work. The artwork and the
 * tag strip carry the "done" reading; the title keeps full strength, and the tick
 * stays the way back.
 */
.release.checked .cover-wrap,
.release.checked .genres,
.release.checked .rating {
  opacity: 0.4;
}
</style>
