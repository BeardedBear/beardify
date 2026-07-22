<template>
  <div class="tier-row" :class="{ 'tier-row-side': sideLayout, 'tier-row-unsorted': scrollable }">
    <div
      class="tier-heading"
      :class="{ 'tier-heading-colored': !!color, 'tier-heading-unsorted': unsorted, 'tier-heading-side': sideLayout }"
      :style="color ? { backgroundColor: color } : undefined"
    >
      {{ label }}
    </div>
    <div v-if="scrollable" class="unsorted-scroll-wrap">
      <button
        class="scroll-arrow"
        :disabled="!canScrollLeft"
        title="Scroll left"
        type="button"
        @click="scroll(-1)"
      >
        <i class="icon-arrow-left" />
      </button>
      <div ref="scrollRef" class="unsorted-scroll" @scroll="updateScrollState">
        <slot />
      </div>
      <button
        class="scroll-arrow"
        :disabled="!canScrollRight"
        title="Scroll right"
        type="button"
        @click="scroll(1)"
      >
        <i class="icon-arrow-right" />
      </button>
    </div>
    <slot v-else />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

withDefaults(
  defineProps<{
    color?: string;
    label: string;
    scrollable?: boolean;
    sideLayout?: boolean;
    unsorted?: boolean;
  }>(),
  { color: undefined, scrollable: false, sideLayout: false, unsorted: false },
);

const scrollRef = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
let resizeObserver: null | ResizeObserver = null;

function scroll(direction: -1 | 1): void {
  const el = scrollRef.value;
  if (!el) return;
  el.scrollBy({ behavior: "smooth", left: direction * el.clientWidth * 0.9 });
}

function updateScrollState(): void {
  const el = scrollRef.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 0;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}

// Watches the slotted grid's own box (not the scroll container's, which stays
// a fixed size) so the arrows update whenever content is added/removed or the
// window resizes, without the parent having to notify us explicitly.
onMounted(() => {
  const container = scrollRef.value;
  if (!container) return;
  updateScrollState();
  resizeObserver = new ResizeObserver(updateScrollState);
  resizeObserver.observe(container.firstElementChild ?? container);
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;
@use "@/assets/scss/responsive" as responsive;

.tier-row {
  display: contents;
}

.tier-row-side {
  align-items: stretch;
  display: flex;
  margin-bottom: 1.5rem;
}

// Sticky requires an actual box (display: contents, used by .tier-row, opts an
// element out of sticky positioning entirely), so the scrollable row gets its
// own always-boxed variant instead of reusing .tier-row.
.tier-row-unsorted {
  background-color: var(--bg-color-darker);
  bottom: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-bottom: 1rem;
  position: sticky;
  z-index: 2;

  &.tier-row-side {
    flex-direction: row;
  }

  &::before {
    background-image: linear-gradient(to top, var(--bg-color-darker) 0%, transparent 100%);
    bottom: 100%;
    content: "";
    height: 20px;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
  }
}

.tier-heading {
  background-color: var(--bg-color);
  border-radius: 0.4rem;
  font-size: var(--font-size-lg);
  line-break: anywhere;
  margin: 2rem 0 1rem;
  padding: 0.7rem 1.2rem;

  @include font-bold;
}

.tier-heading-colored {
  color: #fff;
  text-shadow: 0 0.1rem 0.2rem rgb(0 0 0 / 40%);
}

.tier-heading-unsorted {
  background-color: transparent;
  border: 0.1rem dashed var(--bg-color-lighter);
  color: var(--font-color-dark);
  font-style: italic;
  opacity: 0.7;
}

.tier-heading-side {
  align-items: center;
  border-radius: 0.4rem 0 0 0.4rem;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  margin: 0;
  text-align: center;
  width: 8rem;

  @include responsive.mobile {
    width: 5rem;
  }
}

.unsorted-scroll-wrap {
  align-items: center;
  background-color: var(--bg-color);
  border-radius: 0 0.4rem 0.4rem 0;
  display: flex;
  flex: 1;
  gap: 0.5rem;
  min-width: 0;
  padding: 0 1rem;
}

// flex + min-width: 0 are required here: flex items default to min-width:
// auto, which without this would let the grid's intrinsic content width blow
// out the container instead of scrolling inside it.
.unsorted-scroll {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.scroll-arrow {
  align-items: center;
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 50%;
  color: currentcolor;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: var(--font-size-lg);
  height: 2.4rem;
  justify-content: center;
  width: 2.4rem;

  &:hover:not(:disabled) {
    background-color: var(--bg-color-lighter);
  }

  &:disabled {
    cursor: default;
    opacity: 0.3;
  }
}
</style>
