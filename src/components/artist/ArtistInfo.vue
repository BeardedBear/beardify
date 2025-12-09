<template>
  <div class="artist-info">
    <div class="main-content">
      <div class="info-section" v-if="hasBiography">
        <div ref="sentinelRef" class="sentinel" />
        <nav
          class="wikipedia-nav"
          :class="{ stuck: isStuck }"
          v-if="wikipediaSections.length > 0 || hasMultipleLanguages"
          :style="{ top: artistStore.headerHeight + 'px' }"
        >
          <CustomSelect
            v-if="wikipediaSections.length > 0"
            :model-value="selectedSection"
            :options="sectionOptions"
            placeholder="Go to section..."
            @change="onSectionChange"
          />

          <LanguageSelect
            v-if="hasMultipleLanguages"
            :model-value="artistStore.wikipediaLanguage"
            :options="artistStore.wikidataArtist?.wikipediaLanguages ?? []"
            @change="onLanguageChange"
          />
        </nav>

        <div
          ref="wikipediaContentRef"
          class="wikipedia-content"
          v-if="artistStore.wikipediaExtract"
          v-html="artistStore.wikipediaExtract"
        />
        <div
          class="discogs-biography"
          v-else-if="artistStore.discogsArtist?.profile"
          v-html="formattedDiscogsProfile"
        />
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import ArtistSidebar from "@/components/artist/ArtistSidebar.vue";
import CustomSelect, { type SelectOption } from "@/components/ui/CustomSelect.vue";
import LanguageSelect, { type LanguageOption } from "@/components/ui/LanguageSelect.vue";
import { useArtist } from "@/views/artist/ArtistStore";

interface WikipediaSection {
  id: string;
  title: string;
}

const artistStore = useArtist();
const wikipediaContentRef = ref<HTMLElement | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);
const wikipediaSections = ref<WikipediaSection[]>([]);
const selectedSection = ref("");
const isStuck = ref(false);

const sectionOptions = computed<SelectOption[]>(() =>
  wikipediaSections.value.map((section) => ({
    label: section.title,
    value: section.id,
  })),
);

// Observer to detect when nav is stuck
let observer: IntersectionObserver | null = null;

function setupIntersectionObserver(): void {
  const scrollContainer = document.querySelector(".artist-page");
  if (!scrollContainer || !sentinelRef.value) return;

  // Disconnect existing observer if any
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      isStuck.value = !entry.isIntersecting;
    },
    {
      root: scrollContainer,
      threshold: 0,
      rootMargin: `-${artistStore.headerHeight}px 0px 0px 0px`,
    },
  );

  observer.observe(sentinelRef.value);
}

// Watch for headerHeight changes to recreate observer with correct rootMargin
watch(
  () => artistStore.headerHeight,
  (newHeight) => {
    if (newHeight > 0 && sentinelRef.value) {
      setupIntersectionObserver();
    }
  },
);

// Watch for sentinel ref to be available
watch(
  () => sentinelRef.value,
  (sentinel) => {
    if (sentinel && artistStore.headerHeight > 0) {
      setupIntersectionObserver();
    }
  },
);

onMounted(() => {
  // Initial setup if both conditions are met
  if (sentinelRef.value && artistStore.headerHeight > 0) {
    setupIntersectionObserver();
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

const DISCOGS_BASE_URL = "https://www.discogs.com";
const LINK_ATTRS = 'target="_blank" rel="noopener noreferrer" class="discogs-link"';

const DISCOGS_ENTITIES: Record<string, { path: string; searchType: string; text: string }> = {
  a: { path: "artist", searchType: "artist", text: "artist" },
  l: { path: "label", searchType: "label", text: "label" },
  m: { path: "master", searchType: "master", text: "release" },
  r: { path: "release", searchType: "release", text: "release" },
};

const TEXT_FORMATS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\[b\](.*?)\[\/b\]/gi, replacement: "<strong>$1</strong>" },
  { pattern: /\[i\](.*?)\[\/i\]/gi, replacement: "<em>$1</em>" },
  { pattern: /\[u\](.*?)\[\/u\]/gi, replacement: "<u>$1</u>" },
];

function createDiscogsLinkById(type: string, id: string): string {
  const entity = DISCOGS_ENTITIES[type.toLowerCase()];
  if (!entity) return `[${type}${id}]`;
  return `<a href="${DISCOGS_BASE_URL}/${entity.path}/${id}" ${LINK_ATTRS}>${entity.text}</a>`;
}

function createDiscogsSearchLink(type: string, name: string): string {
  const entity = DISCOGS_ENTITIES[type.toLowerCase()];
  if (!entity) return `[${type}=${name}]`;
  return `<a href="${DISCOGS_BASE_URL}/search/?q=${encodeURIComponent(name)}&type=${entity.searchType}" ${LINK_ATTRS}>${name}</a>`;
}

function parseDiscogsMarkup(text: string): string {
  let result = text;
  result = result.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  for (const { pattern, replacement } of TEXT_FORMATS) {
    result = result.replace(pattern, replacement);
  }

  result = result.replace(/\[([almr])=?(\d+)\]/gi, (_, type, id) => createDiscogsLinkById(type, id));
  result = result.replace(/\[([al])=([^\]]+)\]/gi, (_, type, name) => createDiscogsSearchLink(type, name));
  result = result.replace(
    /\[url=(.*?)\](.*?)\[\/url\]/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
  );
  result = result.replace(/\[url\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  result = result.replace(/\n/g, "<br>");

  return result;
}

const formattedDiscogsProfile = computed(() => {
  if (!artistStore.discogsArtist?.profile) return "";
  return parseDiscogsMarkup(artistStore.discogsArtist.profile);
});

const hasBiography = computed(() => {
  return artistStore.wikipediaExtract || artistStore.discogsArtist?.profile;
});

const hasMultipleLanguages = computed(() => {
  return (artistStore.wikidataArtist?.wikipediaLanguages?.length ?? 0) > 1;
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

function onSectionChange(option: SelectOption): void {
  scrollToSection(option.value);
  // Reset selection to allow re-selecting the same section
  selectedSection.value = "";
}

function scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  const scrollContainer = document.querySelector(".artist-page");

  if (element && scrollContainer) {
    // Calculate the offset: header height + nav bar height + some padding
    const navBarHeight = 50;
    const padding = 16;
    const offset = artistStore.headerHeight + navBarHeight + padding;

    // Get element position relative to the scroll container
    const containerRect = scrollContainer.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const currentScroll = scrollContainer.scrollTop;
    const elementPosition = elementRect.top - containerRect.top + currentScroll;
    const offsetPosition = elementPosition - offset;

    scrollContainer.scrollTo({
      behavior: "smooth",
      top: offsetPosition,
    });
  }
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
.artist-info {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 18rem;
}

.main-content {
  min-width: 0;
}

.info-section {
  margin-bottom: 2rem;
  position: relative;
}

.sentinel {
  height: 1px;
  pointer-events: none;
  position: relative;
  width: 100%;
}

.wikipedia-nav {
  align-items: center;
  background: var(--bg-color);
  border-radius: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem;
  position: sticky;
  top: 0;
  transition: border-radius 0.2s ease;
  z-index: 10;

  &.stuck {
    border-radius: 0 0 0.5rem 0.5rem;
  }
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
    border-bottom: 1px solid var(--bg-color-light);
    color: var(--font-color-default);
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
    margin-top: 1.5rem;
    padding-bottom: 0.4rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(h3) {
    color: var(--font-color-default);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
    margin-top: 1.2rem;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(h4) {
    color: var(--font-color-default);
    font-size: 0.95rem;
    font-weight: 600;
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
    font-weight: bold;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(i),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(em) {
    font-style: italic;
    font-weight: bold;
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
    background-color: var(--bg-color-dark);
    font-weight: 600;
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
    font-style: italic;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(strong) {
    font-weight: bold;
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
