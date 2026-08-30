<template>
  <div :class="{ checked: isChecked }" class="release">
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

    <span class="cover-wrap">
      <Cover :images="release.images" class="cover" size="small" />
      <span v-if="isSearching" class="cover-loading" aria-live="polite" aria-label="Searching">
        <BdLoader size="xx-small" />
      </span>
    </span>

    <div class="names">
      <button
        class="album bd-font-bold"
        type="button"
        @click="searchStore.openAlbumSearch(release.key, release.artistName, release.name)"
      >
        {{ release.name }}
      </button>
      <button class="artist" type="button" @click="searchStore.openAlbumSearch(release.key, release.artistName)">
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
          :aria-pressed="releasesStore.genre === genre"
          :class="{ 'is-active': releasesStore.genre === genre }"
          class="genre"
          type="button"
          @click="releasesStore.setGenre(genre)"
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
      <BdTooltip v-if="typeof release.rating === 'number'" bare content="Editorial rating out of 5">
        <span>{{ release.rating.toFixed(1) }}<span class="unit">/5</span></span>
      </BdTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Check, Circle } from "@lucide/vue";
import { BdLoader, BdTooltip } from "bearded-ui";
import { computed } from "vue";

import { Release } from "@/@types/Releases";
import { useSearch } from "@/components/search/SearchStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { useReleases } from "@/views/releases/ReleasesStore";

/** The scrapers file up to a dozen micro-genres per release; past three the row is a wall of tags. */
const GENRES_SHOWN = 3;

const props = defineProps<{
  release: Release;
}>();

const releasesStore = useReleases();
const searchStore = useSearch();

const isChecked = computed(() => Boolean(releasesStore.checks[props.release.key]));
const isSearching = computed(() => searchStore.activeAlbumKey === props.release.key);
// Sliced here, not in the template, so an unrelated re-render does not reallocate it.
const shownGenres = computed(() => props.release.genres.slice(0, GENRES_SHOWN));
</script>

<style scoped>
.release {
  align-items: center;
  border-radius: var(--bd-radius-sm);
  display: grid;
  gap: var(--bd-space-3);
  grid-template-columns: 1.2rem 2.5rem minmax(0, 1.4fr) minmax(0, 1fr) 2.5rem;
  padding: var(--bd-space-2) var(--bd-space-3);
  transition: background-color var(--bd-transition-fast), opacity var(--bd-transition-fast);

  &:hover {
    background-color: var(--bd-bg-light);
  }

  /* Ticked off, not gone: still readable, clearly done, and one click from undone. */
  &.checked {
    opacity: 0.5;
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
  width: 2.5rem;

  &:has(.cover-loading) .cover {
    opacity: 0.4;
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

  span {
    background-color: var(--bd-bg-lighter);
    border-radius: var(--bd-radius-sm);
    padding: 0.1rem var(--bd-space-2);
  }

  .unit {
    color: var(--bd-font-color-dark);
    padding-inline-start: 0.1rem;
  }
}
</style>
