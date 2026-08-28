<template>
  <Dialog title="Tracked genres" width="min(94vw, 34rem)" with-title>
    <div class="wrap">
      <p class="intro">
        Releases filed under any of these show up in the feed. Sub-genres work —
        <button class="example" type="button" @click="addGenre('atmospheric black metal')">
          atmospheric black metal
        </button>
        is as valid as
        <button class="example" type="button" @click="addGenre('metal')">metal</button>.
      </p>

      <div class="chips">
        <button
          v-for="tag in draft"
          :key="tag"
          :aria-label="`Remove ${tag}`"
          class="chip"
          type="button"
          @click="removeGenre(tag)"
        >
          <span class="chip-name">{{ tag }}</span>
          <X :size="12" />
        </button>
        <span v-if="!draft.length" class="empty">Nothing tracked — the feed falls back to Spotify's own picks.</span>
      </div>

      <!--
        The suggestions are the vocabulary MusicBrainz actually matches on, so
        picking one is the difference between tracking "black metal" and tracking a
        typo that silently returns nothing. No `role="combobox"`: that belongs on
        the field itself and brings obligations (aria-controls, aria-activedescendant)
        this plain filtered list does not honour — claiming it would mislead a screen
        reader, whereas a labelled list below a field describes itself correctly.
      -->
      <form @submit.prevent="addTyped()">
        <BdInput
          v-model="query"
          aria-label="Search genres"
          :disabled="atLimit"
          placeholder="Search a genre…"
          type="search"
          @keydown="onKeydown"
        />
        <ul v-if="suggestions.length" aria-label="Matching genres" class="suggestions">
          <li v-for="(genre, index) in suggestions" :key="genre">
            <!--
              Not `active`: that class name is taken by a global rule in
              global.css which forces `color: var(--bd-primary) !important`, so a
              highlighted row rendered primary-on-primary and read as an empty bar.
            -->
            <button
              :class="{ 'is-highlighted': index === highlighted }"
              class="suggestion"
              type="button"
              @click="addGenre(genre)"
              @mousemove="highlighted = index"
            >
              {{ genre }}
            </button>
          </li>
        </ul>
        <p v-else-if="query.trim() && !atLimit" class="no-match">
          No genre in the listing matches. Press Enter to track it anyway.
        </p>
      </form>

      <div class="footer">
        <span class="count">{{ draft.length }} / {{ MAX_TRACKED_TAGS }}</span>
        <BdButton size="small" @click="reset()">Reset to my top genres</BdButton>
        <BdButton :disabled="!dirty" size="small" variant="primary" @click="apply()">Apply</BdButton>
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { X } from "@lucide/vue";
import { BdButton, BdInput } from "bearded-ui";
import { computed, onMounted, ref } from "vue";

import { useDialog } from "@/components/dialog/DialogStore";
import Dialog from "@/components/dialog/DialogWrap.vue";
import { MAX_TRACKED_TAGS, normalizeTag, suggestGenres } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

/** Enough to show the obvious answer plus its neighbours, few enough not to need scrolling. */
const SUGGESTIONS_SHOWN = 8;

const dialogStore = useDialog();
const releasesStore = useReleases();
const vocabulary = ref<string[]>(releasesStore.genreVocabulary);

// Fetched on open, not at module load: it is one request, and only this dialog needs it.
onMounted(async () => (vocabulary.value = await releasesStore.loadGenreVocabulary()));

/*
 * Edited on a copy. The whole point of the dialog is that nothing refetches until
 * Apply, so the store must not see an intermediate list.
 */
const draft = ref<string[]>([...releasesStore.tags]);
const query = ref("");
const highlighted = ref(0);

const atLimit = computed(() => draft.value.length >= MAX_TRACKED_TAGS);
const suggestions = computed(() =>
  atLimit.value ? [] : suggestGenres(query.value, vocabulary.value, draft.value, SUGGESTIONS_SHOWN),
);
const dirty = computed(
  () =>
    draft.value.length !== releasesStore.tags.length
    || draft.value.some((tag, index) => tag !== releasesStore.tags[index]),
);

function addGenre(genre: string): void {
  const clean = normalizeTag(genre);
  if (!clean || draft.value.includes(clean) || atLimit.value) return;

  draft.value = [...draft.value, clean];
  query.value = "";
  highlighted.value = 0;
}

/** Enter takes the highlighted suggestion, or the raw text when nothing matched. */
function addTyped(): void {
  addGenre(suggestions.value[highlighted.value] ?? query.value);
}

async function apply(): Promise<void> {
  dialogStore.close();
  await releasesStore.setTags(draft.value);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

  // The field is a search input; without this the caret jumps to either end of the text.
  event.preventDefault();
  const step = event.key === "ArrowDown" ? 1 : -1;
  const count = suggestions.value.length;
  if (count) highlighted.value = (highlighted.value + step + count) % count;
}

function removeGenre(genre: string): void {
  draft.value = draft.value.filter((tag) => tag !== genre);
}

async function reset(): Promise<void> {
  dialogStore.close();
  await releasesStore.resetTags();
}
</script>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-4);
  padding: var(--bd-space-5);
}

.intro {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  margin: 0;
}

.example {
  background-color: transparent;
  border: none;
  color: var(--bd-primary);
  cursor: pointer;
  font: inherit;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bd-space-2);
  min-height: 1.8rem;
}

.chip {
  align-items: center;
  background-color: var(--bd-primary);
  border: none;
  border-radius: var(--bd-radius-full);
  color: var(--bd-on-primary);
  cursor: pointer;
  display: flex;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-1);
  padding: 0.2rem var(--bd-space-3);

  &:hover {
    opacity: 0.75;
  }
}

.chip-name {
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty,
.no-match,
.count {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
}

.no-match {
  margin: var(--bd-space-2) 0 0;
}

/*
 * In normal flow, not absolute. The dialog body is a scroll container, so an
 * absolutely-positioned panel was clipped by its overflow the moment the list
 * was longer than the room left below the field — the options were there and
 * unreachable. In flow it scrolls with the dialog and needs no stacking tricks.
 *
 * No height cap of its own either: the list is bounded at SUGGESTIONS_SHOWN, and
 * an inner scroller would take the arrow-key highlight out of view with nothing
 * scrolling it back. The dialog's own cap still handles a short viewport.
 */
.suggestions {
  background-color: var(--bd-bg-light);
  border-radius: var(--bd-radius-sm);
  list-style: none;
  margin: var(--bd-space-1) 0 0;
  padding: var(--bd-space-1);
}

.suggestion {
  background-color: transparent;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: inherit;
  cursor: pointer;
  display: block;
  font-size: var(--bd-font-size-sm);
  padding: var(--bd-space-2) var(--bd-space-3);
  text-align: left;
  width: 100%;

  &.is-highlighted {
    background-color: var(--bd-primary);
    color: var(--bd-on-primary);
  }
}

.footer {
  align-items: center;
  display: flex;
  gap: var(--bd-space-3);

  .count {
    margin-right: auto;
  }
}
</style>
