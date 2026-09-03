<template>
  <div class="filters">
    <BdCheckbox v-model="releasesStore.hideChecked" full-width label="Hide listened" />
  </div>

  <div class="counts">{{ releasesStore.visibleReleases.length }} shown · {{ releasesStore.checkedCount }} listened</div>

  <div class="title bd-font-bold"><span>Months</span></div>
  <nav aria-label="Jump to a month" class="months">
    <button class="jump jump-edge" type="button" @click="scrollFeed(0)">
      <ArrowUpToLine :size="13" />
      <span class="jump-label">Top of feed</span>
    </button>
<!--
      Two controls, so a row cannot be one: the label goes to the month's first
      release, the arrow to its last.
    -->
    <div v-for="month in releasesStore.monthGroups" :key="month.label" class="jump-row">
      <button class="jump" type="button" @click="scrollToMonth(month.label, 'start')">
        <span class="jump-label">{{ month.label }}</span>
        <span class="jump-count">{{ month.releases.length }}</span>
      </button>
      <BdTooltip :content="`End of ${month.label}`" bare>
        <button
          :aria-label="`Jump to the end of ${month.label}`"
          class="jump-end"
          type="button"
          @click="scrollToMonth(month.label, 'end')"
        >
          <ArrowDownToLine :size="12" />
        </button>
      </BdTooltip>
    </div>
    <button class="jump jump-edge" type="button" @click="scrollFeed(Number.MAX_SAFE_INTEGER)">
      <ArrowDownToLine :size="13" />
      <span class="jump-label">End of feed</span>
    </button>
  </nav>

  <div class="title bd-font-bold">
    <span>Genres</span>
    <button v-if="releasesStore.genres.length" class="clear" type="button" @click="releasesStore.genres = []">
      Clear
    </button>
  </div>
  <BdInput v-model="query" class="genre-search" placeholder="Filter genres" size="small" type="search" />
  <div class="genres">
    <button
      v-for="genre in shownGenres"
      :key="genre.name"
      :aria-pressed="isSelected(genre.name)"
      class="genre"
      type="button"
      @click="releasesStore.toggleGenre(genre.name)"
    >
      <span class="name">{{ genre.name }}</span>
      <span class="count">{{ genre.count }}</span>
    </button>
    <span v-if="!shownGenres.length" class="no-match">No genre matches “{{ query }}”.</span>
    <button v-if="hasMore" class="show-more" type="button" @click="showMore()">Show more</button>
  </div>
</template>

<script lang="ts" setup>
import { ArrowDownToLine, ArrowUpToLine } from "@lucide/vue";
import { BdCheckbox, BdInput, BdTooltip } from "bearded-ui";
import { computed, ref } from "vue";

import { useDialog } from "@/components/dialog/DialogStore";
import { normalizeTag } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

/*
 * A week of releases can surface a few hundred genres, most attached to a single
 * album. The list is sorted by frequency, so cutting it here keeps the ones worth
 * filtering on — and "Show more" reveals the next batch of the same size.
 */
const GENRES_STEP = 12;
const releasesStore = useReleases();

const query = ref("");
const visible = ref(GENRES_STEP);

/* The query narrows the frequency-sorted list; the cap keeps it from becoming a wall of options. */
const matches = computed(() => {
  // Normalized the way a genre is stored, so "black  metal" matches here too.
  const needle = normalizeTag(query.value);
  if (!needle) return releasesStore.genreList;

  return releasesStore.genreList.filter((genre) => genre.name.toLowerCase().includes(needle));
});

/*
 * Selected genres are pinned above the rest and escape both the search and the cap:
 * a filter the user cannot see is a filter they cannot lift, and picking a rare genre
 * then typing anything else would push it out of a twelve-row list.
 */
const picked = computed(() => releasesStore.genreList.filter((genre) => isSelected(genre.name)));
const rest = computed(() => matches.value.filter((genre) => !isSelected(genre.name)));

const shownGenres = computed(() => [...picked.value, ...rest.value.slice(0, visible.value)]);

const hasMore = computed(() => rest.value.length > visible.value);

/*
 * Below tablet this panel is the filters dialog, sitting over the very feed it
 * scrolls, so a jump has to dismiss it — otherwise the destination arrives
 * behind a modal. On desktop the dialog is already closed and this costs
 * nothing.
 *
 * `behavior: "smooth"` needs no reduced-motion branch: browsers drop it to an
 * instant jump on their own when the preference is set, which is the wanted
 * degradation rather than a bug to route around.
 */
function feedElement(): HTMLElement | null {
  const dialogStore = useDialog();
  if (dialogStore.show) dialogStore.close();
  return document.getElementById("release-feed");
}

function isSelected(name: string): boolean {
  return releasesStore.genres.includes(name);
}

/**
 * Jumps to an absolute offset in the feed. Clamped by the browser, so
 * `MAX_SAFE_INTEGER` is simply "the end" without having to read scrollHeight.
 * @param top - Target scroll offset
 */
function scrollFeed(top: number): void {
  feedElement()?.scrollTo({ behavior: "smooth", top });
}

/**
 * Jumps to one end of a month. Addressed by label rather than by index because
 * the rail and the list read the same grouping — the label is the identity both
 * share, and it survives a filter change that drops months in between.
 *
 * `block` does the work either way: the group element spans the whole month, so
 * aligning its start puts the heading under the top edge and aligning its end
 * puts the month's last release above the bottom one.
 * @param label - The month's heading, as `monthGroups` names it
 * @param block - Which end of the month to bring into view
 */
function scrollToMonth(label: string, block: "end" | "start"): void {
  feedElement()
    ?.querySelector(`[data-month="${CSS.escape(label)}"]`)
    ?.scrollIntoView({ behavior: "smooth", block });
}

function showMore(): void {
  visible.value += GENRES_STEP;
}
</script>

<style scoped>
.title {
  align-items: baseline;
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  display: flex;
  justify-content: space-between;
  padding: var(--bd-space-4) var(--bd-space-2) var(--bd-space-2);
  text-transform: uppercase;
}

.clear {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: var(--bd-font-size-xs);
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
  padding: var(--bd-space-4) var(--bd-space-2) 0;
}

.counts {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: var(--bd-space-2) var(--bd-space-2) var(--bd-space-1);
}

.genre-search {
  padding: 0 var(--bd-space-2) var(--bd-space-2);
}

.months {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
}

/*
 * Deliberately the genre row's box, not a new one: both are "narrow the feed to
 * this" and a second visual language for the same gesture in the same column
 * would be a second thing to learn.
 */
.jump-row {
  align-items: center;
  display: flex;
  margin: 0 var(--bd-space-2);
}

.jump {
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: inherit;
  cursor: pointer;
  display: flex;
  flex: 1;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-2);
  justify-content: space-between;
  min-width: 0;
  padding: var(--bd-space-1) var(--bd-space-2);
  text-align: left;

  &:hover {
    background-color: var(--bd-bg);
  }
}

/*
 * Held at a lower weight than the month itself: the month is the destination
 * anyone is looking for, its tail is the occasional one. Full strength as soon
 * as the row is under the pointer, so it is never a control you have to guess
 * at — and it keeps its own box on touch, where there is no hover to reveal it.
 */
.jump-end {
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-dark);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  opacity: 0.4;
  padding: var(--bd-space-1);
  transition:
    background-color var(--bd-transition-fast),
    opacity var(--bd-transition-fast);

  &:hover {
    background-color: var(--bd-bg);
    color: var(--bd-font-color);
  }
}

.jump-end:focus-visible,
.jump-row:hover .jump-end {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .jump-end {
    transition: none;
  }
}

.jump-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jump-count {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
}

/*
 * The two ends are destinations, not months, so they read as one register
 * quieter — and the icon does the pointing, which is why the label sits after
 * it instead of pushing to the far edge like a count.
 */
.jump-edge {
  color: var(--bd-font-color-dark);
  justify-content: flex-start;
  margin: 0 var(--bd-space-2);

  &:hover {
    color: var(--bd-font-color);
  }
}

.genres {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
}

.genre {
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: inherit;
  cursor: pointer;
  display: flex;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-2);
  justify-content: space-between;
  margin: 0 var(--bd-space-2);
  padding: var(--bd-space-1) var(--bd-space-2);
  text-align: left;
  width: calc(100% - var(--bd-space-4));

  &:hover {
    background-color: var(--bd-bg);
  }

  &[aria-pressed="true"] {
    background-color: var(--bd-primary);
    color: var(--bd-on-primary);
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .count {
    color: var(--bd-font-color-dark);
    font-size: var(--bd-font-size-xs);
  }

  &[aria-pressed="true"] .count {
    color: inherit;
  }
}

.no-match {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: var(--bd-space-1) var(--bd-space-2);
}

.show-more {
  align-self: flex-start;
  background: none;
  border: none;
  color: var(--bd-primary);
  cursor: pointer;
  font-size: var(--bd-font-size-xs);
  margin: var(--bd-space-1) var(--bd-space-2);
  padding: var(--bd-space-1) var(--bd-space-2);
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
}
</style>
