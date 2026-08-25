<template>
  <div class="nav-container">
    <div ref="sentinelRef" class="sentinel" />
    <nav
      v-if="hasSections || hasMultipleLanguages"
      class="wikipedia-nav"
      :class="{ stuck: isStuck }"
      :style="{ top: headerHeight + 'px' }"
    >
      <BdDropdown v-if="hasSections" label="Go to section..." match-width size="small">
        <BdDropdownItem v-for="section in sections" :key="section.id" @click="onSectionChange(section.id)">
          {{ section.title }}
        </BdDropdownItem>
      </BdDropdown>

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
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { BdDropdown, BdDropdownItem } from "bearded-ui";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { LanguageOption } from "@/@types/Wikipedia";

interface Props {
  currentLanguage?: string;
  headerHeight?: number;
  languages?: LanguageOption[];
  sections?: WikipediaSection[];
}

interface WikipediaSection {
  id: string;
  title: string;
}

const props = withDefaults(defineProps<Props>(), {
  currentLanguage: "",
  headerHeight: 0,
  languages: () => [],
  sections: () => [],
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

  @media (--mobile) {
    position: relative;
    top: 0 !important;
  }
}
</style>
