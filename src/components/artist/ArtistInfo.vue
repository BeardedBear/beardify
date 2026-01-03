<template>
  <div class="artist-info">
    <div class="main-content">
      <div class="info-section" v-if="hasBiography">
        <ArtistNavigation
          :sections="wikipediaSections"
          :languages="artistStore.wikidataArtist?.wikipediaLanguages ?? []"
          :current-language="artistStore.wikipediaLanguage"
          :header-height="artistStore.headerHeight"
          @section-change="onSectionChange"
          @language-change="onLanguageChange"
        />

        <div
          ref="wikipediaContentRef"
          class="wikipedia-content"
          v-if="artistStore.wikipediaExtract"
          v-html="artistStore.wikipediaExtract"
        />
        <div class="biography" v-else-if="artistStore.discogsArtist?.profile" v-html="formattedDiscogsProfile" />
      </div>

      <div
        class="info-section"
        v-if="!artistStore.discogsArtist?.profile && !artistStore.wikidataArtist && !artistStore.wikipediaExtract"
      >
        <p class="no-info">No additional information available for this artist.</p>
      </div>
    </div>

    <ArtistSidebar />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";

import ArtistNavigation from "@/components/artist/ArtistNavigation.vue";
import ArtistSidebar from "@/components/artist/ArtistSidebar.vue";
import { type LanguageOption } from "@/components/ui/LanguageSelect.vue";
import { parseDiscogsMarkup } from "@/helpers/discogs";
import { useArtist } from "@/views/artist/ArtistStore";

interface WikipediaSection {
  id: string;
  title: string;
}

const artistStore = useArtist();
const wikipediaContentRef = ref<HTMLElement | null>(null);
const wikipediaSections = ref<WikipediaSection[]>([]);

const formattedDiscogsProfile = computed(() => {
  if (!artistStore.discogsArtist?.profile) return "";
  return parseDiscogsMarkup(artistStore.discogsArtist.profile);
});

const hasBiography = computed(() => {
  return artistStore.wikipediaExtract || artistStore.discogsArtist?.profile;
});

function onLanguageChange(option: LanguageOption): void {
  artistStore.switchWikipediaLanguage(option.url, option.code);
}

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

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.artist-info {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 18rem;

  @include responsive.tablet-down {
    grid-template-columns: 1fr;
  }
}

.main-content {
  min-width: 0;
}

.info-section {
  margin-bottom: 2rem;
  position: relative;
}

.source-link {
  color: var(--font-color-light);
  opacity: 0.5;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }

  i {
    font-size: 0.9rem;
  }
}

.wikipedia-content {
  color: var(--font-color-light);
  font-size: 0.95rem;
  line-height: 1.7;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(section) {
    margin-bottom: 1.5rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(p) {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(h2) {
    @include font-bold;

    border-bottom: 1px solid var(--bg-color-light);
    color: var(--font-color-default);
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
    margin-top: 1.5rem;
    padding-bottom: 0.4rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(h3) {
    @include font-bold;

    color: var(--font-color-default);
    font-size: 1rem;
    margin-bottom: 0.6rem;
    margin-top: 1.2rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(h4) {
    @include font-bold;

    color: var(--font-color-default);
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    margin-top: 1rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(ul),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(li) {
    margin-bottom: 0.3rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(a) {
    color: var(--primary-color-light);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(b),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(strong) {
    @include font-bold;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(i),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(em) {
    @include font-italic;
    @include font-bold;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(table) {
    border-collapse: collapse;
    margin-bottom: 1rem;
    width: 100%;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(th),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(td) {
    border: 1px solid var(--bg-color-light);
    padding: 0.5rem;
    text-align: left;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(th) {
    @include font-bold;

    background-color: var(--bg-color-dark);
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(blockquote) {
    border-left: 3px solid var(--primary-color-default);
    margin: 1rem 0;
    padding-left: 1rem;
  }
}

.biography {
  color: var(--font-color-light);
  font-size: 0.95rem;
  line-height: 1.7;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(em) {
    @include font-italic;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(strong) {
    @include font-bold;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.discogs-link),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(a) {
    color: var(--primary-color-light);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.details-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-label {
  color: var(--font-color-light);
  font-size: 0.8rem;
  opacity: 0.6;
  text-transform: uppercase;
}

.detail-value {
  color: var(--font-color-default);
  font-size: 0.95rem;
}

.external-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.external-link {
  align-items: center;
  background-color: var(--bg-color-dark);
  border-radius: 0.3rem;
  color: var(--font-color-light);
  display: flex;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: var(--primary-color-default);
    color: var(--font-color-default);
  }

  i {
    font-size: 1.1rem;
  }

  span {
    font-size: 0.9rem;
  }
}

.no-info {
  color: var(--font-color-light);
  font-size: 0.95rem;
  opacity: 0.6;
}
</style>
