<template>
  <div class="nav-container">
    <div ref="sentinelRef" class="sentinel" />
    <nav
      v-if="hasSections || hasMultipleLanguages"
      class="wikipedia-nav"
      :class="{ stuck: isStuck }"
      :style="{ top: headerHeight + 'px' }"
    >
      <BdDropdown v-if="hasSections" :label="activeSectionTitle" match-width size="small">
        <BdDropdownItem
          v-for="section in sections"
          :key="section.id"
          :active="section.id === activeSectionId"
          :style="{ paddingInlineStart: `calc(var(--bd-space-3) * ${section.level - 1})` }"
          @click="onSectionChange(section.id)"
        >
          {{ section.title }}
        </BdDropdownItem>
      </BdDropdown>

      <div class="nav-end">
        <BdDropdown v-if="hasMultipleLanguages" :label="currentLanguageName" placement="bottom-end" size="small">
          <BdDropdownItem
            v-for="language in languages"
            :key="language.code"
            :active="language.code === currentLanguage"
            @click="emit('languageChange', language)"
          >
            {{ language.name }}
          </BdDropdownItem>
        </BdDropdown>

        <!-- The reader's way out to the full article, and the CC BY-SA attribution -->
        <a v-if="sourceUrl" class="source-link" :href="sourceUrl" rel="noopener noreferrer" target="_blank">
          Wikipedia
          <ExternalLink :size="14" />
        </a>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { ExternalLink } from "@lucide/vue";
import { BdDropdown, BdDropdownItem } from "bearded-ui";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { LanguageOption } from "@/@types/Wikipedia";

interface Props {
  activeSectionId?: null | string;
  currentLanguage?: string;
  headerHeight?: number;
  languages?: LanguageOption[];
  sections?: WikipediaSection[];
  sourceUrl?: null | string;
}

interface WikipediaSection {
  id: string;
  /** 2, 3 or 4 — indents the entry so the flat menu reads as an outline */
  level: number;
  title: string;
}

const props = withDefaults(defineProps<Props>(), {
  activeSectionId: null,
  currentLanguage: "",
  headerHeight: 0,
  languages: () => [],
  sections: () => [],
  sourceUrl: null,
});

const emit = defineEmits<{
  languageChange: [option: LanguageOption];
  sectionChange: [sectionId: string];
}>();

const sentinelRef = ref<HTMLElement | null>(null);
const isStuck = ref(false);

const hasSections = computed(() => props.sections.length > 0);
const hasMultipleLanguages = computed(() => props.languages.length > 1);

const currentLanguageName = computed(
  () => props.languages.find((language) => language.code === props.currentLanguage)?.name ?? props.currentLanguage,
);

/*
 * The label says where the reader is, not what the menu does. On a 12,000-word
 * article a static "Go to section..." is the one question the control could
 * have answered and didn't.
 */
const activeSectionTitle = computed(
  () => props.sections.find((section) => section.id === props.activeSectionId)?.title ?? "Go to section...",
);

// Observer to detect when nav is stuck
let observer: IntersectionObserver | null = null;

function onSectionChange(sectionId: string): void {
  scrollToSection(sectionId);
  emit("sectionChange", sectionId);
}

function scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  const scrollContainer = document.querySelector(".artist-page");

  if (element && scrollContainer) {
    // Calculate the offset: header height + nav bar height + some padding
    const navBarHeight = 50;
    const padding = 16;
    const offset = props.headerHeight + navBarHeight + padding;

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

    // Focus follows the viewport, or the next Tab resumes back at the dropdown
    element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
  }
}

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
      rootMargin: `-${props.headerHeight}px 0px 0px 0px`,
      threshold: 0,
    },
  );

  observer.observe(sentinelRef.value);
}

// Watch for headerHeight changes to recreate observer with correct rootMargin
watch(
  () => props.headerHeight,
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
    if (sentinel && props.headerHeight > 0) {
      setupIntersectionObserver();
    }
  },
);

onMounted(() => {
  // Initial setup if both conditions are met
  if (sentinelRef.value && props.headerHeight > 0) {
    setupIntersectionObserver();
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<style scoped>

.nav-container {
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
  background: var(--bd-bg);
  border-radius: var(--bd-radius-md);
  display: flex;
  gap: var(--bd-space-2);
  justify-content: space-between;
  margin-bottom: var(--bd-space-4);
  padding: var(--bd-space-2);
  position: sticky;
  top: 0;
  transition: border-radius var(--bd-transition);
  z-index: 10;

  &.stuck {
    border-radius: 0 0 var(--bd-radius-md) var(--bd-radius-md);
  }

  @media (--mobile) {
    position: relative;
    top: 0 !important;
  }
}

.nav-end {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: var(--bd-space-2);
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
</style>
