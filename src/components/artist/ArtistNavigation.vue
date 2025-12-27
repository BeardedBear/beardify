<template>
  <div class="nav-container">
    <div ref="sentinelRef" class="sentinel" />
    <nav
      class="wikipedia-nav"
      :class="{ stuck: isStuck }"
      v-if="hasSections || hasMultipleLanguages"
      :style="{ top: headerHeight + 'px' }"
    >
      <CustomSelect
        v-if="hasSections"
        :model-value="selectedSection"
        :options="sectionOptions"
        placeholder="Go to section..."
        @change="onSectionChange"
      />

      <LanguageSelect
        v-if="hasMultipleLanguages"
        :model-value="currentLanguage"
        :options="languageOptions"
        @change="onLanguageChange"
      />
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import CustomSelect, { type SelectOption } from "@/components/ui/CustomSelect.vue";
import LanguageSelect, { type LanguageOption } from "@/components/ui/LanguageSelect.vue";

interface WikipediaSection {
  id: string;
  title: string;
}

interface Props {
  sections?: WikipediaSection[];
  languages?: LanguageOption[];
  currentLanguage?: string;
  headerHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
  languages: () => [],
  currentLanguage: "",
  headerHeight: 0,
});

const emit = defineEmits<{
  sectionChange: [sectionId: string];
  languageChange: [option: LanguageOption];
}>();

const sentinelRef = ref<HTMLElement | null>(null);
const selectedSection = ref("");
const isStuck = ref(false);

const hasSections = computed(() => props.sections.length > 0);
const hasMultipleLanguages = computed(() => props.languages.length > 1);

const sectionOptions = computed<SelectOption[]>(() =>
  props.sections.map((section) => ({
    label: section.title,
    value: section.id,
  })),
);

const languageOptions = computed(() => props.languages);

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
      rootMargin: `-${props.headerHeight}px 0px 0px 0px`,
    },
  );

  observer.observe(sentinelRef.value);
}

function onSectionChange(option: SelectOption): void {
  scrollToSection(option.value);
  // Reset selection to allow re-selecting the same section
  selectedSection.value = "";
  emit("sectionChange", option.value);
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

function onLanguageChange(option: LanguageOption): void {
  emit("languageChange", option);
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

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;

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

  @include responsive.mobile {
    position: relative;
    top: 0 !important;
  }
}
</style>
