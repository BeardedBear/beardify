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
          :sections="wikipediaSections"
          :languages="artistStore.wikidataArtist?.wikipediaLanguages ?? []"
          :current-language="artistStore.wikipediaLanguage"
          :header-height="artistStore.headerHeight"
          @section-change="onSectionChange"
          @language-change="onLanguageChange"
        />

        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="artistStore.wikipediaExtract"
          ref="wikipediaContentRef"
          class="wikipedia-content"
          v-html="sanitizedWikipediaExtract"
        />
        <!-- eslint-enable vue/no-v-html -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-else-if="artistStore.discogsArtist?.profile" class="biography" v-html="formattedDiscogsProfile" />
      </div>

      <div v-if="!artistStore.hasInfo" class="info-section">
        <p class="no-info">No additional information available for this artist.</p>
      </div>
    </div>

    <ArtistSidebar />
  </div>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";
import DOMPurify from "dompurify";
import { computed, nextTick, onMounted, ref, watch } from "vue";

import { type LanguageOption } from "@/@types/Wikipedia";
import ArtistNavigation from "@/components/artist/ArtistNavigation.vue";
import ArtistSidebar from "@/components/artist/ArtistSidebar.vue";
import MemberTimeline from "@/components/artist/MemberTimeline.vue";
import WikipediaTimeline from "@/components/artist/WikipediaTimeline.vue";
import { parseDiscogsMarkup } from "@/helpers/discogs";
import { useArtist } from "@/views/artist/ArtistStore";

interface WikipediaSection {
  id: string;
  title: string;
}

const artistStore = useArtist();
const wikipediaContentRef = ref<HTMLElement | null>(null);
const wikipediaSections = ref<WikipediaSection[]>([]);

const isSoloArtist = computed(() => artistStore.musicbrainzArtist?.type === "Person");

const sanitizedWikipediaExtract = computed(() => {
  if (!artistStore.wikipediaExtract) return "";
  return DOMPurify.sanitize(artistStore.wikipediaExtract);
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

    headingElements.forEach((heading, index) => {
      const title = heading.textContent?.trim();
      if (title) {
        const id = `wiki-section-${index}`;
        heading.id = id;
        sections.push({ id, title });
      }
    });

    wikipediaSections.value = sections;
  }, 100);
}

function onLanguageChange(option: LanguageOption): void {
  artistStore.switchWikipediaLanguage(option.url, option.code);
}

function onSectionChange(): void {
  // The scroll is handled by the ArtistNavigation component
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

.source-link {
  color: var(--bd-font-color-dark);
  transition: opacity var(--bd-transition);

  &:hover {
    opacity: 1;
  }

  i {
    font-size: var(--bd-font-size-sm);
  }
}

.wikipedia-content {
  color: var(--bd-font-color-light);
  line-height: 1.7;
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
  color: var(--bd-font-color);
  font-size: var(--bd-font-size-xl);
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
  margin-bottom: var(--bd-space-3);
  margin-top: var(--bd-space-5);
  padding-bottom: var(--bd-space-2);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(h3) {
  color: var(--bd-font-color);
  font-size: var(--bd-font-size-base);
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
  margin-bottom: var(--bd-space-2);
  margin-top: var(--bd-space-4);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(h4) {
  color: var(--bd-font-color);
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
  padding-left: var(--bd-space-5);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(li) {
  margin-bottom: var(--bd-space-1);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(a) {
  color: var(--bd-primary-light);
  text-decoration: none;
}

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

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(i),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(em) {
  font-style: var(--bd-style-italic-fallback);
  font-variation-settings: var(--bd-font-variation-settings-bold-italic);
  font-weight: var(--bd-weight-bold-fallback);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(table) {
  border-collapse: collapse;
  margin-bottom: var(--bd-space-4);
  width: 100%;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(th),
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(td) {
  border: 1px solid var(--bd-bg-light);
  padding: var(--bd-space-2);
  text-align: left;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(th) {
  background-color: var(--bd-bg-dark);
  font-variation-settings: var(--bd-font-variation-settings-bold);
  font-weight: var(--bd-weight-bold-fallback);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.wikipedia-content :deep(blockquote) {
  border-left: 1px solid var(--bd-bg-lighter);
  color: var(--bd-font-color-dark);
  margin: var(--bd-space-4) 0;
  padding-left: var(--bd-space-5);
}

.biography {
  color: var(--bd-font-color-light);
  line-height: 1.7;
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

.details-grid {
  display: grid;
  gap: var(--bd-space-4);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-1);
}

.detail-label {
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-xs);
  opacity: 0.6;
  text-transform: uppercase;
}

.detail-value {
  color: var(--bd-font-color);
}

.external-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bd-space-3);
}

.external-link {
  align-items: center;
  background-color: var(--bd-bg-dark);
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-light);
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-2) var(--bd-space-4);
  text-decoration: none;
  transition:
    background-color var(--bd-transition),
    color var(--bd-transition);

  &:hover {
    background-color: var(--bd-primary);
    color: var(--bd-font-color);
  }

  i {
    font-size: var(--bd-font-size-lg);
  }

  span {
    font-size: var(--bd-font-size-sm);
  }
}

.no-info {
  color: var(--bd-font-color-light);
  opacity: 0.6;
}

.timeline-loader {
  display: flex;
  justify-content: center;
  margin-bottom: var(--bd-space-6);
  padding: var(--bd-space-6) 0;
}
</style>
