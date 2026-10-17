<template>
  <div class="artist-info">
    <div class="info-main">
      <div v-if="artistStore.timelineLoading" class="timeline-loader">
        <BdLoader size="small" />
      </div>
      <WikipediaTimeline v-else-if="artistStore.wikiTimeline && !isSoloArtist" />
      <MemberTimeline v-else-if="artistStore.bandMembers.length > 0 && !isSoloArtist" />

      <div v-if="hasBiography" class="info-section wiki-layout" :class="{ 'has-sidebar': hasWikiSidebar }">
        <aside
          v-if="hasWikiSidebar"
          class="wiki-sidebar"
          :style="{
            maxHeight: `calc(${scrollerHeight - artistStore.headerHeight}px - var(--bd-space-4) * 2)`,
            top: `calc(${artistStore.headerHeight}px + var(--bd-space-4))`,
          }"
        >
          <div v-if="languages.length > 1 || artistStore.wikipediaSourceUrl" class="wiki-meta">
            <BdDropdown v-if="languages.length > 1" :label="currentLanguageName" size="small">
              <BdDropdownItem
                v-for="language in languages"
                :key="language.code"
                :active="language.code === artistStore.wikipediaLanguage"
                @click="onLanguageChange(language)"
              >
                {{ language.name }}
              </BdDropdownItem>
            </BdDropdown>

            <!-- The reader's way out to the full article, and the CC BY-SA attribution -->
            <a
              v-if="artistStore.wikipediaSourceUrl"
              class="source-link"
              :href="artistStore.wikipediaSourceUrl"
              rel="noopener noreferrer"
              target="_blank"
            >
              Wikipedia
              <ExternalLink :size="14" />
            </a>
          </div>

          <nav v-if="wikipediaSections.length > 0" aria-label="Sections" class="wiki-toc">
            <a
              v-for="section in wikipediaSections"
              :key="section.id"
              :aria-current="section.id === activeSectionId ? 'location' : undefined"
              class="toc-link"
              :class="{ active: section.id === activeSectionId, sub: section.level > 2 }"
              :href="`#${section.id}`"
              @click.prevent="scrollToSection(section.id)"
            >
              {{ section.title }}
            </a>
          </nav>
        </aside>

        <div class="info-body">
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
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-else-if="artistStore.discogsArtist?.profile"
            class="biography"
            @click="onContentClick"
            v-html="formattedDiscogsProfile"
          />
          <!-- eslint-enable vue/no-v-html -->
        </div>
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
import { ExternalLink } from "@lucide/vue";
import { useElementSize } from "@vueuse/core";
import { BdButton, BdDropdown, BdDropdownItem, BdLoader } from "bearded-ui";
import DOMPurify from "dompurify";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { type LanguageOption } from "@/@types/Wikipedia";
import ArtistSidebar from "@/components/artist/ArtistSidebar.vue";
import MemberTimeline from "@/components/artist/MemberTimeline.vue";
import WikipediaTimeline from "@/components/artist/WikipediaTimeline.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { useSearch } from "@/components/search/SearchStore";
import { parseDiscogsMarkup } from "@/helpers/discogs";
import { normalizeDiacritics } from "@/helpers/normalizeDiacritics";
import { openLink } from "@/helpers/openLink";
import { isTauri } from "@/helpers/platform";
import { useArtist } from "@/views/artist/ArtistStore";

interface WikipediaSection {
  id: string;
  /** 2 or 3 — the sidebar indents on it, so a flat list reads as an outline */
  level: number;
  title: string;
}

/** Wikipedia editions written right-to-left; the container flips for these. */
const RTL_LANGUAGES = new Set(["ar", "arc", "arz", "ckb", "dv", "fa", "he", "ks", "pnb", "ps", "sd", "ug", "ur", "yi"]);

const artistStore = useArtist();

/*
 * The section list must fit what the scroller actually shows — the title bar
 * and the player eat into the viewport, so a vh cap left the last entries
 * below the fold.
 */
const scrollerRef = ref<HTMLElement | null>(null);
const { height: scrollerHeight } = useElementSize(scrollerRef);
const wikipediaContentRef = ref<HTMLElement | null>(null);
const wikipediaSections = ref<WikipediaSection[]>([]);
const activeSectionId = ref<null | string>(null);

let sectionObserver: IntersectionObserver | null = null;

const isSoloArtist = computed(() => artistStore.musicbrainzArtist?.type === "Person");

const languages = computed(() => artistStore.wikidataArtist?.wikipediaLanguages ?? []);

const currentLanguageName = computed(
  () => languages.value.find((language) => language.code === artistStore.wikipediaLanguage)?.name
    ?? artistStore.wikipediaLanguage,
);

const hasWikiSidebar = computed(
  () => wikipediaSections.value.length > 0 || languages.value.length > 1 || !!artistStore.wikipediaSourceUrl,
);

const textDirection = computed(() => (RTL_LANGUAGES.has(artistStore.wikipediaLanguage) ? "rtl" : "ltr"));

const sanitizedWikipediaExtract = computed(() => {
  if (!artistStore.wikipediaExtract) return "";

  /*
   * `target` is NOT in DOMPurify's default allowlist, so without ADD_ATTR every
   * outbound link would quietly load Wikipedia over the app. `rel` is allowed by
   * default and the cleaner already pairs `noopener noreferrer` with it.
   *
   * The two FORBID entries close the opposite hole: the default profile allows
   * `style` on any element and `<style>` itself, and Wikipedia ships both —
   * arbitrary inline colours and widths that ignore this app's themes.
   * `data-wiki-title` and `data-music` survive: data attributes are allowed.
   */
  return DOMPurify.sanitize(artistStore.wikipediaExtract, {
    ADD_ATTR: ["target"],
    FORBID_ATTR: ["style"],
    FORBID_TAGS: ["style"],
  });
});

const formattedDiscogsProfile = computed(() => {
  if (!artistStore.discogsArtist?.profile) return "";
  const parsed = parseDiscogsMarkup(artistStore.discogsArtist.profile);

  // Same reason as above: parseDiscogsMarkup writes target="_blank" on every
  // link it builds, and the default profile would strip all of them
  return DOMPurify.sanitize(parsed, { ADD_ATTR: ["target"] });
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
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSectionId.value = entry.target.id;
        } else if (entry.rootBounds && entry.boundingClientRect.top > entry.rootBounds.bottom) {
          // Scrolling up: the heading dropped below the band, so the reader is back in the section before it
          const index = wikipediaSections.value.findIndex((section) => section.id === entry.target.id);
          if (index > 0) activeSectionId.value = wikipediaSections.value[index - 1].id;
        }
      }
    },
    {
      root: scrollContainer,
      // Only the band just under the sticky header counts as "where you are"
      rootMargin: `-${artistStore.headerHeight}px 0px -75% 0px`,
      threshold: 0,
    },
  );

  for (const heading of headings) sectionObserver.observe(heading);
}

/**
 * Two kinds of link live in a biography. Wikidata marked the ones that are
 * artists or albums with `data-music`: those open the in-app search, the same
 * one a band-member click opens. Everything else — places, genres, events —
 * is worth nothing to a music search, so it stays an ordinary outbound link to
 * Wikipedia and is left to the browser (or Tauri's opener on desktop).
 *
 * Modified clicks are never intercepted: ctrl/cmd/middle-click opens the
 * Wikipedia article in a new tab, for music links too.
 */
function onContentClick(event: MouseEvent): void {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

  const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
  if (!link) return;

  const title = link.dataset.wikiTitle;
  if (title && link.hasAttribute("data-music")) {
    event.preventDefault();
    useSearch().updateQuery(title);
    useDialog().open({ type: "search" });
    return;
  }

  /*
   * Everything else leaves the app. On the web the anchor's own target="_blank"
   * does it — which only works because the sanitizer is told to keep `target`.
   * Tauri has no tab to hand it to, so the native opener takes over and the
   * article opens in the user's real browser instead of replacing the app.
   */
  if (isTauri()) {
    event.preventDefault();
    openLink(link.href);
  }
}

function onLanguageChange(option: LanguageOption): void {
  artistStore.switchWikipediaLanguage(option.url, option.code);
}

function scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  const scrollContainer = document.querySelector(".artist-page");
  if (!element || !scrollContainer) return;

  // Header + breathing room
  const offset = artistStore.headerHeight + 16;
  const containerTop = scrollContainer.getBoundingClientRect().top;
  const top = element.getBoundingClientRect().top - containerTop + scrollContainer.scrollTop;

  scrollContainer.scrollTo({ behavior: "smooth", top: top - offset });
  activeSectionId.value = sectionId;

  // Focus follows the viewport, or the next Tab resumes back at the sidebar
  element.setAttribute("tabindex", "-1");
  element.focus({ preventScroll: true });
}

/**
 * Turn a heading title into a stable anchor. Index-based ids reshuffle on every
 * language switch, which breaks any fragment a reader saved.
 */
function slugifySection(title: string, index: number): string {
  const slug = normalizeDiacritics(title.toLowerCase())
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
  scrollerRef.value = document.querySelector<HTMLElement>(".artist-page");
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

.info-main {
  min-width: 0;
}

/*
 * The 72ch measure caps the reading column: it ran ~170 characters at 1080p
 * and ~200 on a wide monitor. Language, source link and section table sit in
 * their own sticky column to the left, and the pair is centred.
 */
.info-section {
  margin-bottom: var(--bd-space-6);
  position: relative;
}

.wiki-layout {
  display: grid;
  gap: var(--bd-space-6);
  grid-template-columns: minmax(0, 72ch);
  justify-content: center;

  &.has-sidebar {
    grid-template-columns: 14rem minmax(0, 72ch);

    @media (--tablet-down) {
      grid-template-columns: minmax(0, 72ch);
    }
  }
}

.wiki-sidebar {
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-4);
  position: sticky;

  /* No room for a column: language and source stay reachable above the text */
  @media (--tablet-down) {
    position: static;
  }
}

.wiki-meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--bd-space-2);
  justify-content: space-between;
}

.source-link {
  align-items: center;
  color: var(--bd-font-color-dark);
  display: flex;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-1);
  text-decoration: none;
  transition: color var(--bd-transition);
  white-space: nowrap;

  &:hover {
    color: var(--bd-font-color);
  }
}

/* Only the section list scrolls; the language and source stay pinned above it */
.wiki-toc {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;

  @media (--tablet-down) {
    display: none;
  }
}

.toc-link {
  border-inline-start: 2px solid var(--bd-bg-light);
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  padding: var(--bd-space-1) var(--bd-space-3);
  text-decoration: none;
  transition:
    border-color var(--bd-transition),
    color var(--bd-transition);

  &.sub {
    padding-inline-start: var(--bd-space-6);
  }

  &:hover {
    color: var(--bd-font-color);
  }

  &.active {
    border-inline-start-color: var(--bd-primary);
    color: var(--bd-font-color-light);
  }
}

.info-body {
  min-width: 0;
}

.wikipedia-content {
  color: var(--bd-font-color-light);
  hyphens: auto;
  line-height: 1.7;
  text-wrap: pretty;

  &::selection {
    background: var(--bd-primary);
    color: var(--bd-font-color-light);
  }
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

/*
 * The lead answers most visits — who they are, where they formed, what they
 * made. Styled like paragraph 86 it reads as filler before the article starts.
 */
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(p):first-of-type {
  font-size: var(--bd-font-size-lg);
  line-height: 1.55;
  margin-bottom: var(--bd-space-5);
}

/* An article opening on a heading must not push it down by a section gap */
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(.mw-heading):first-child h2 {
  margin-top: 0;
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
.wikipedia-content :deep(a) {
  /*
   * Body colour, not primary: a rendered article carries 500-800 links, almost
   * all of them proper nouns in running prose. Colouring each one turns the
   * paragraph into confetti and costs more reading than the affordance buys,
   * so the underline carries it and colour arrives on hover.
   */
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 0.30em;
  transition:
    color var(--bd-transition),
    text-decoration-color var(--bd-transition);
}

/*
 * Two destinations, two weights. A marked link is an artist or an album Spotify
 * actually has, and it stays inside the app — it carries the primary colour and
 * reads as the offer. Colouring was confetti when all 538 links were tinted;
 * Wikidata cuts that to about a fifth, which the paragraph can carry.
 */
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep([data-music]) {
  color: var(--bd-primary-light);
  cursor: pointer;
  text-decoration-color: color-mix(in oklab, var(--bd-primary) 40%, transparent);
  text-decoration-thickness: 1px;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep([data-music]):hover {
  text-decoration-color: var(--bd-primary-light);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(a):not([data-music]) {
  text-decoration-color: color-mix(in oklab, var(--bd-font-color-dark) 60%, transparent);
  text-decoration-style: dotted;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(a):not([data-music]):hover {
  color: var(--bd-font-color);
  text-decoration-color: var(--bd-font-color-dark);
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
