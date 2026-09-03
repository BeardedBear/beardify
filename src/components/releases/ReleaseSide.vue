<template>
  <div class="filters">
    <BdCheckbox v-model="releasesStore.hideChecked" full-width label="Hide listened" />
  </div>

  <!--
    One denominator. This used to read "N shown · M listened", two numbers off
    two different sets, and the second was pinned to 0 for as long as "Hide
    listened" was on — the toggle one line above appeared to erase the progress
    it was measuring.
  -->
  <div class="counts">{{ releasesStore.checkedCount }} of {{ releasesStore.genreFiltered.length }} listened</div>

  <h2 class="title bd-font-bold"><span>Months</span></h2>
  <nav aria-label="Jump to a month" class="months">
    <div class="jump-row">
      <button class="jump jump-edge" type="button" @click="scrollFeed(0)">
        <span class="jump-label">Top of feed</span>
        <ArrowUpToLine :size="13" />
      </button>
      <span class="jump-slot" />
    </div>
    <!--
      Two controls, so a row cannot be one: the label goes to the month's first
      release, the arrow to its last.
    -->
    <div v-for="month in releasesStore.monthNav" :key="month.label" class="jump-row">
      <button :disabled="!month.count" class="jump" type="button" @click="scrollToMonth(month.label, 'start')">
        <span class="jump-label">{{ month.label }}</span>
        <span class="jump-count">{{ month.count }}</span>
      </button>
      <BdTooltip :content="`End of ${month.label}`" bare>
        <button
          :aria-label="`Jump to the end of ${month.label}`"
          :disabled="!month.count"
          class="jump-end"
          type="button"
          @click="scrollToMonth(month.label, 'end')"
        >
          <ArrowDownToLine :size="12" />
        </button>
      </BdTooltip>
    </div>
    <div class="jump-row">
      <button class="jump jump-edge" type="button" @click="scrollFeed(Number.MAX_SAFE_INTEGER)">
        <span class="jump-label">End of feed</span>
        <ArrowDownToLine :size="13" />
      </button>
      <span class="jump-slot" />
    </div>
  </nav>

  <div class="genre-head">
    <h2 class="title bd-font-bold">
      <span>Genres</span>
      <button v-if="releasesStore.genres.length" class="clear" type="button" @click="releasesStore.genres = []">
        Clear
      </button>
    </h2>
    <div class="genre-search">
      <BdInput
        v-model="query"
        aria-label="Filter genres"
        placeholder="Filter genres"
        size="small"
        type="search"
        @keyup.enter="selectFirstMatch()"
      />
    </div>
  </div>
  <!--
    Always in the DOM, never rendered: a live region only announces changes to a
    region that already existed, so one mounted on demand alongside .no-match
    would stay silent — and filtering would give a screen reader no evidence
    that typing did anything at all.
  -->
  <p aria-live="polite" class="bd-sr-only">{{ genreStatus }}</p>
  <div
    ref="genresRef"
    aria-label="Genres"
    class="genres"
    role="group"
    @keydown.down.prevent="moveGenreFocus(1)"
    @keydown.up.prevent="moveGenreFocus(-1)"
  >
    <button
      v-for="(genre, index) in shownGenres"
      :key="genre.name"
      :aria-pressed="isSelected(genre.name)"
      :tabindex="index === activeGenre ? 0 : -1"
      class="genre"
      type="button"
      @click="releasesStore.toggleGenre(genre.name)"
      @focus="genreFocus = index"
    >
      <span class="name">{{ genre.name }}</span>
      <span class="count">{{ genre.count }}</span>
    </button>
    <span v-if="!shownGenres.length" class="no-match">No genre matches “{{ query }}”.</span>
    <button v-if="hasMore" class="show-more" type="button" @click="showMore()">Show more</button>
    <button v-if="visible > GENRES_STEP" class="show-more" type="button" @click="visible = GENRES_STEP">
      Show less
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ArrowDownToLine, ArrowUpToLine } from "@lucide/vue";
import { BdCheckbox, BdInput, BdTooltip } from "bearded-ui";
import { computed, ref, watch } from "vue";

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

const genreFocus = ref(0);
const genresRef = ref<HTMLElement | null>(null);
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
 * Selecting a genre changes exactly one thing: that row's pressed state.
 *
 * Selected rows used to be pulled to the top and excused from the cap, so a
 * single click both jumped the row out from under the pointer and promoted one
 * more genre into the twelve visible — the list you were reading rearranged
 * itself and grew every time you used it.
 *
 * What the pinning was protecting against — a filter scrolled or searched out
 * of sight and therefore impossible to lift — is covered by `Clear`, which
 * appears the moment anything is selected and rides in the sticky header, so it
 * is on screen whatever the list is doing.
 */
const shownGenres = computed(() => matches.value.slice(0, visible.value));

const hasMore = computed(() => matches.value.length > visible.value);

/*
 * Clamped, because toggling a genre re-partitions picked/rest without touching
 * the query: left raw, the index could point past the end and no row would hold
 * `tabindex="0"`, which takes the whole list out of the tab order.
 */
const activeGenre = computed(() => Math.min(genreFocus.value, Math.max(shownGenres.value.length - 1, 0)));

/** What the live region reads out after a keystroke — the only evidence filtering happened. */
const genreStatus = computed(() =>
  shownGenres.value.length ? `${shownGenres.value.length} genres shown` : `No genre matches ${query.value}`,
);

/*
 * Below tablet this panel is the filters dialog, sitting over the very feed it
 * scrolls, so a jump has to dismiss it — otherwise the destination arrives
 * behind a modal. On desktop the dialog is already closed and this costs
 * nothing.
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
 * Arrow-key traversal inside the genre list, which is one tab stop rather than
 * twelve to thirty-six: reaching the feed by keyboard used to mean tabbing past
 * every genre in the column.
 * @param delta - How far to move, in rows
 */
function moveGenreFocus(delta: number): void {
  const buttons = [...(genresRef.value?.querySelectorAll<HTMLButtonElement>(".genre") ?? [])];
  if (!buttons.length) return;
  genreFocus.value = (activeGenre.value + delta + buttons.length) % buttons.length;
  buttons[genreFocus.value].focus();
}

/*
 * `scroll-behavior: smooth` in CSS is dropped by the browser under the
 * preference; the CSSOM option is not, and Chromium reads it as explicit author
 * intent. A jump across two months is a multi-thousand-pixel animated sweep,
 * which is precisely the motion the preference exists to stop.
 */
function scrollBehavior(): "auto" | "smooth" {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/**
 * Jumps to an absolute offset in the feed. Clamped by the browser, so
 * `MAX_SAFE_INTEGER` is simply "the end" without having to read scrollHeight.
 * @param top - Target scroll offset
 */
function scrollFeed(top: number): void {
  feedElement()?.scrollTo({ behavior: scrollBehavior(), top });
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
    ?.scrollIntoView({ behavior: scrollBehavior(), block });
}

/** Enter in the search field takes the top hit, so a typed genre never ends in a mouse trip. */
function selectFirstMatch(): void {
  const first = matches.value[0];
  if (!first) return;
  releasesStore.toggleGenre(first.name);
  query.value = "";
}

function showMore(): void {
  visible.value += GENRES_STEP;
}

/*
 * A cap raised to 36 and then left there silently applies to the next search
 * too, so a two-word query can still return a wall. The focus index is reset
 * with it: the row it pointed at is gone.
 */
watch(query, () => {
  visible.value = GENRES_STEP;
  genreFocus.value = 0;
});
</script>

<style scoped>
/*
 * One inset for the whole column: the section headers used to span the panel's
 * own padding box while every row it heads inset a further --bd-space-2, so the
 * heading was wider than its own list and no hover band lined up with anything
 * above it.
 */
.title {
  align-items: baseline;
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  display: flex;
  font-size: var(--bd-font-size-base);
  justify-content: space-between;
  margin: 0 var(--bd-space-2);
  padding: var(--bd-space-4) var(--bd-space-2) var(--bd-space-2);
  text-transform: uppercase;
}

/*
 * The genre list is the last and longest block in the column, so its heading and
 * its field travel with it — the same move the feed's month heading already
 * makes, which is what stops the two columns from merely looking alike while
 * behaving differently. It matters more with the month rail above: by the time
 * the list is scrolling, the rail has gone and the field would have gone with
 * it. One box rather than two sticky elements: the field's offset would
 * otherwise be a hand-kept copy of the heading's line height.
 */
.genre-head {
  background-color: var(--bd-bg-darker);
  position: sticky;
  top: 0;
  z-index: 2;
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
  padding: var(--bd-space-4) var(--bd-space-4) 0;
}

.counts {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: var(--bd-space-2) var(--bd-space-4) var(--bd-space-1);
}

/*
 * The padding lives on this wrapper, not on BdInput. BdInput is compiled with
 * `inheritAttrs: false` and merges the parent's attrs onto its inner <input>,
 * while Vue stamps the parent's scope id only onto a child's ROOT element — so
 * a `.genre-search` class passed to the component produced the selector
 * `.genre-search[data-v-…]` matching nothing, and the field was the only thing
 * in the column touching the edges.
 */
.genre-search {
  padding: 0 var(--bd-space-4) var(--bd-space-2);
}

.genres {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
  margin: 0 var(--bd-space-2);
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
  padding: var(--bd-space-1) var(--bd-space-2);
  text-align: left;

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
  margin: var(--bd-space-1) 0;
  padding: var(--bd-space-1) var(--bd-space-2);
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
}

.months {
  /* Shared by the per-month arrow and by the empty slot the edge rows hold in
     its place, so one value keeps the trailing column straight. */
  --jump-end-size: 1.9rem;

  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
}

.jump-row {
  align-items: center;
  display: flex;
  margin: 0 var(--bd-space-2);
}

/*
 * Deliberately the genre row's box, not a new one: both are "narrow the feed to
 * this" and a second visual language for the same gesture in the same column
 * would be a second thing to learn.
 */
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
 * A month the current filter emptied. It stays in place, dimmed and inert,
 * because a navigation list that drops rows rearranges itself under the pointer
 * — and the 0 beside it is itself the answer to "anything in August?".
 */
.jump:disabled {
  background-color: transparent;
  cursor: default;
  opacity: 0.35;
}

.jump-edge {
  color: var(--bd-font-color-dark);

  &:hover {
    color: var(--bd-font-color);
  }
}

.jump-slot {
  flex-shrink: 0;
  width: var(--jump-end-size);
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
 * Held a register below the month itself: the month is the destination anyone
 * is looking for, its tail the occasional one. Sized past the 24px target floor
 * — it was 19px, on the component that doubles as the mobile touch surface —
 * and rested at 0.6 rather than 0.4, which put a 12px glyph on an already
 * dimmed foreground well under any usable contrast.
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
  height: var(--jump-end-size);
  justify-content: center;
  opacity: 0.6;
  padding: 0;
  transition:
    background-color var(--bd-transition-fast),
    opacity var(--bd-transition-fast);
  width: var(--jump-end-size);

  &:hover {
    background-color: var(--bd-bg);
    color: var(--bd-font-color);
  }
}

.jump-end:disabled {
  background-color: transparent;
  color: var(--bd-font-color-dark);
  cursor: default;
  opacity: 0.35;
}

.jump-end:focus-visible,
.jump-row:hover .jump-end:not(:disabled) {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .jump-end {
    transition: none;
  }
}
</style>
