<template>
  <div class="artist-info">
    <div class="main-content">
      <div v-if="artistStore.timelineLoading" class="timeline-loader">
        <BdLoader size="small" />
      </div>
      <WikipediaTimeline v-else-if="artistStore.wikiTimeline && !isSoloArtist" />
      <MemberTimeline v-else-if="artistStore.bandMembers.length > 0 && !isSoloArtist" />

      <div v-if="hasBiography" class="info-section">
        <ArtistNavigation
          :active-section-id="activeSectionId"
          :current-language="artistStore.wikipediaLanguage"
          :header-height="artistStore.headerHeight"
          :languages="artistStore.wikidataArtist?.wikipediaLanguages ?? []"
          :sections="wikipediaSections"
          :source-url="artistStore.wikipediaSourceUrl"
          @language-change="onLanguageChange"
          @section-change="onSectionChange"
        />

        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="artistStore.wikipediaExtract"
          ref="wikipediaContentRef"
          class="wikipedia-content"
          :dir="textDirection"
          :lang="artistStore.wikipediaLanguage"
          @click="onContentClick"
          v-html="sanitizedWikipediaExtract"
        />
        <!-- eslint-enable vue/no-v-html -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else-if="artistStore.discogsArtist?.profile" class="biography" v-html="formattedDiscogsProfile" />
      </div>

      <!-- A failed fetch is not an absent article: say which one happened, and offer the way out -->
      <div v-else-if="artistStore.wikipediaFailed && !artistStore.timelineLoading" class="info-section">
        <p class="no-info">Couldn't reach Wikipedia for this artist.</p>
        <BdButton size="small" variant="border" @click="artistStore.retryWikipediaExtract()">Try again</BdButton>
      </div>

      <div v-if="!artistStore.hasInfo && !artistStore.timelineLoading" class="info-section">
        <p class="no-info">No additional information available for this artist.</p>
      </div>
    </div>

    <ArtistSidebar />
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdLoader } from "bearded-ui";
import DOMPurify from "dompurify";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { type LanguageOption } from "@/@types/Wikipedia";
import ArtistNavigation from "@/components/artist/ArtistNavigation.vue";
import ArtistSidebar from "@/components/artist/ArtistSidebar.vue";
import MemberTimeline from "@/components/artist/MemberTimeline.vue";
import WikipediaTimeline from "@/components/artist/WikipediaTimeline.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { useSearch } from "@/components/search/SearchStore";
import { parseDiscogsMarkup } from "@/helpers/discogs";
import { useArtist } from "@/views/artist/ArtistStore";

interface WikipediaSection {
  id: string;
  /** 2, 3 or 4 — the dropdown indents on it, so a flat list reads as an outline */
  level: number;
  title: string;
}

/** Wikipedia editions written right-to-left; the container flips for these. */
const RTL_LANGUAGES = new Set(["ar", "arc", "arz", "ckb", "dv", "fa", "he", "ks", "pnb", "ps", "sd", "ug", "ur", "yi"]);

const artistStore = useArtist();
const wikipediaContentRef = ref<HTMLElement | null>(null);
const wikipediaSections = ref<WikipediaSection[]>([]);
const activeSectionId = ref<null | string>(null);

let sectionObserver: IntersectionObserver | null = null;

const isSoloArtist = computed(() => artistStore.musicbrainzArtist?.type === "Person");

const textDirection = computed(() => (RTL_LANGUAGES.has(artistStore.wikipediaLanguage) ? "rtl" : "ltr"));

const sanitizedWikipediaExtract = computed(() => {
  if (!artistStore.wikipediaExtract) return "";

  /*
   * DOMPurify's default profile allows `style` on any element and `<style>`
   * itself, and Wikipedia ships both — arbitrary inline colours and widths that
   * ignore this app's themes. `data-wiki-title`, set by the cleaner, survives:
   * data attributes are allowed by default.
   */
  return DOMPurify.sanitize(artistStore.wikipediaExtract, {
    FORBID_ATTR: ["style"],
    FORBID_TAGS: ["style"],
  });
});

const formattedDiscogsProfile = computed(() => {
  if (!artistStore.discogsArtist?.profile) return "";
  const parsed = parseDiscogsMarkup(artistStore.discogsArtist.profile);
  return DOMPurify.sanitize(parsed);
});

const hasBiography = computed(() => {
  return artistStore.wikipediaExtract || artistStore.discogsArtist?.profile;
});

function extractSections(): void {
  // Wait a bit for the DOM to be fully updated after v-html changes
  setTimeout(() => {
    if (!wikipediaContentRef.value) {
      wikipediaSections.value = [];
      return;
    }

    const headingElements = wikipediaContentRef.value.querySelectorAll("h2, h3");
    const sections: WikipediaSection[] = [];
    const observed: Element[] = [];
    const used = new Set<string>();

    headingElements.forEach((heading, index) => {
      const title = heading.textContent?.trim();
      if (title) {
        let id = slugifySection(title, index);
        // Wikipedia repeats subsection titles ("Legacy" under two eras)
        while (used.has(id)) id = `${id}-${index}`;
        used.add(id);

        heading.id = id;
        sections.push({ id, level: Number(heading.tagName[1]), title });
        observed.push(heading);
      }
    });

    wikipediaSections.value = sections;
    activeSectionId.value = sections[0]?.id ?? null;
    observeSections(observed);
  }, 100);
}

/** Drive the nav label from what is actually on screen. */
function observeSections(headings: Element[]): void {
  sectionObserver?.disconnect();
  const scrollContainer = document.querySelector(".artist-page");
  if (!scrollContainer) return;

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length > 0) activeSectionId.value = visible[0].target.id;
    },
    {
      root: scrollContainer,
      // Only the band just under the sticky nav counts as "where you are"
      rootMargin: `-${artistStore.headerHeight + 60}px 0px -75% 0px`,
      threshold: 0,
    },
  );

  for (const heading of headings) sectionObserver.observe(heading);
}

/**
 * The cleaner strips Wikipedia's own hrefs and leaves the subject behind in
 * `data-wiki-title`. A biography is mostly names this app has pages for, so a
 * click opens the same search a band-member click does.
 */
function onContentClick(event: MouseEvent): void {
  const link = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-wiki-title]");
  const title = link?.dataset.wikiTitle;
  if (!title) return;

  event.preventDefault();
  useSearch().updateQuery(title);
  useDialog().open({ type: "search" });
}

function onLanguageChange(option: LanguageOption): void {
  artistStore.switchWikipediaLanguage(option.url, option.code);
}

function onSectionChange(sectionId: string): void {
  // The scroll is handled by the ArtistNavigation component
  activeSectionId.value = sectionId;
}

/**
 * Turn a heading title into a stable anchor. Index-based ids reshuffle on every
 * language switch, which breaks any fragment a reader saved.
 */
function slugifySection(title: string, index: number): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug ? `wiki-${slug}` : `wiki-section-${index}`;
}

watch(
  () => artistStore.wikipediaExtract,
  () => {
    nextTick(() => {
      extractSections();
    });
  },
);

onMounted(() => {
  nextTick(() => {
    extractSections();
  });
});

onBeforeUnmount(() => {
  sectionObserver?.disconnect();
});
</script>

<style scoped>

.artist-info {
  display: grid;
  gap: var(--bd-space-6);
  grid-template-columns: 1fr 18rem;

  @media (--tablet-down) {
    grid-template-columns: 1fr;
  }
}

.main-content {
  min-width: 0;
}

.info-section {
  margin-bottom: var(--bd-space-6);
  position: relative;
}

.wikipedia-content {
  color: var(--bd-font-color-light);
  hyphens: auto;
  line-height: 1.7;

  /*
   * Not whitespace: the reading column ran to ~170 characters at 1080p and ~200
   * on a wide monitor. Capping the measure spends the slack the layout already
   * had, and leaves the sidebar and every padding exactly where they were.
   */
  max-width: 68ch;
  text-wrap: pretty;
}

/*
 * :deep() rules below are intentionally NOT nested inside .wikipedia-content /
 * .biography: Vue's scoped-CSS compiler mishandles :deep() when it's nested
 * via native CSS nesting — it emits ".wikipedia-content [data-v-x] p" (scope
 * attribute floating as its own descendant segment) instead of
 * ".wikipedia-content[data-v-x] p", which never matches anything in the real
 * DOM. Writing the full selector at the top level sidesteps the bug (this is
 * also how Sass used to emit it, since Sass flattened nesting before Vue's
 * scoped compiler ever ran).
 */

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(section) {
  margin-bottom: var(--bd-space-5);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(p) {
  margin-bottom: var(--bd-space-4);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(p):last-child {
  margin-bottom: 0;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(h2) {
  border-bottom: 1px solid var(--bd-bg-light);
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-xl);
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
  margin-bottom: var(--bd-space-3);

  /* A section break has to outrank a paragraph break, which is --bd-space-4 */
  margin-top: var(--bd-space-7);
  padding-bottom: var(--bd-space-2);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(h3) {
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-lg);
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
  margin-bottom: var(--bd-space-2);
  margin-top: var(--bd-space-5);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(h4) {
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-base);
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
  margin-bottom: var(--bd-space-2);
  margin-top: var(--bd-space-4);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(ul),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(ol) {
  margin-bottom: var(--bd-space-4);

  /* Logical, not physical: six of the offered editions are right-to-left */
  padding-inline-start: var(--bd-space-5);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(li) {
  margin-bottom: var(--bd-space-1);
}

/*
 * The cleaner strips Wikipedia's hrefs and leaves the subject in
 * `data-wiki-title`, so this is the whole link style: anything still carrying
 * an href is a plain anchor the cleaner deliberately left alone.
 */
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep([data-wiki-title]),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(a) {
  color: var(--bd-primary-light);
  cursor: pointer;
  text-decoration: none;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep([data-wiki-title]):hover,
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(a):hover {
  text-decoration: underline;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(b),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(strong) {
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
}

/*
 * Italic, not bold-italic: Wikipedia uses <i> for album and song titles and
 * emits 150-300 of them per article against a handful of <b>. Bolding them all
 * destroys the one emphasis signal a music reader scans for.
 */
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(i),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(em) {
  font-style: var(--bd-style-italic-fallback);
  font-variation-settings: var(--bd-font-variation-settings-italic);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(cite) {
  font-style: var(--bd-style-italic-fallback);
  font-variation-settings: var(--bd-font-variation-settings-italic);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(sup),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(sub),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(small) {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
}

/*
 * The UA sheet underlines abbr[title] with dotted rule — the only decorated
 * text on a page whose real links carry no underline until hover.
 */
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(abbr) {
  text-decoration: none;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(dl) {
  margin-bottom: var(--bd-space-4);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(dt) {
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(dd) {
  color: var(--bd-font-color);
  margin-bottom: var(--bd-space-2);
  padding-inline-start: var(--bd-space-4);
}

/* The cleaner wraps every table so a wide one scrolls itself, not the page */
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(.wiki-table-scroll) {
  margin-bottom: var(--bd-space-4);
  max-width: 100%;
  overflow-x: auto;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(th),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(td) {
  border: 1px solid var(--bd-bg-light);
  padding: var(--bd-space-2);
  text-align: start;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(th) {
  background-color: var(--bd-bg-dark);
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(blockquote) {
  border-inline-start: 1px solid var(--bd-bg-lighter);
  color: var(--bd-font-color-dark);
  margin: var(--bd-space-4) 0;
  padding-inline-start: var(--bd-space-5);
}

.biography {
  color: var(--bd-font-color-light);
  line-height: 1.7;
  max-width: 68ch;
  text-wrap: pretty;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.biography :deep(em) {
  font-style: var(--bd-style-italic-fallback);
  font-variation-settings: var(--bd-font-variation-settings-italic);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.biography :deep(strong) {
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.biography :deep(.discogs-link),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.biography :deep(a) {
  color: var(--bd-primary-light);
  text-decoration: none;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.biography :deep(.discogs-link):hover,
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.biography :deep(a):hover {
  text-decoration: underline;
}

.no-info {
  color: var(--bd-font-color-light);
  margin-bottom: var(--bd-space-3);
  opacity: 0.6;
}

.timeline-loader {
  display: flex;
  justify-content: center;
  margin-bottom: var(--bd-space-6);
  padding: var(--bd-space-6) 0;
}
</style>
