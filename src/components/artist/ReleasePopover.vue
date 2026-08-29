<template>
  <span
    ref="wrapperRef"
    class="release-popover-wrapper"
    tabindex="0"
    @focusin="show"
    @focusout="hide"
    @mouseenter="show"
    @mouseleave="hide"
  >
    <slot />

    <Teleport to="body">
      <transition name="release-popover">
        <div
          v-if="visible"
          ref="panelRef"
          class="release-popover"
          :style="panelStyle"
          role="tooltip"
        >
          <img v-if="cover" :src="cover" :alt="name" class="rp-cover" />
          <div v-else class="rp-cover rp-cover-placeholder" :style="{ backgroundColor: color }" />
          <span class="rp-name">{{ name }}</span>
          <span v-if="meta" class="rp-meta">{{ meta }}</span>
        </div>
      </transition>
    </Teleport>
  </span>
</template>

<script lang="ts" setup>
import { useEventListener } from "@vueuse/core";
import { nextTick, ref } from "vue";

import { clamp } from "@/helpers/volume";

withDefaults(
  defineProps<{
    color?: string;
    cover: null | string;
    meta?: string;
    name: string;
  }>(),
  { color: "var(--bd-bg-lighter)", meta: "" },
);

const GAP = 10;
const MARGIN = 8;
// Nudge the panel right so it clears the dot instead of sitting centered over it
const SHIFT_X = 40;

const OFFSCREEN: Record<string, string> = { left: "-9999px", top: "0" };

const visible = ref(false);
const panelStyle = ref<Record<string, string>>({ ...OFFSCREEN });
const wrapperRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

function hide(): void {
  visible.value = false;
  panelStyle.value = { ...OFFSCREEN };
}

function show(): void {
  visible.value = true;
  nextTick(updatePosition);
}

/*
 * Rects read on demand rather than through `useElementBounding`.
 *
 * That composable installs a ResizeObserver, a MutationObserver and a
 * capture-phase window scroll listener per element, alive whether the popover is
 * open or not — and an artist's discography mounts one of these per release. The
 * two handlers below already only fire while `visible`, which is the only time a
 * position is needed at all.
 */
function updatePosition(): void {
  const wrapper = wrapperRef.value?.getBoundingClientRect();
  const panel = panelRef.value?.getBoundingClientRect();
  if (!wrapper || !panel) return;

  const desiredLeft = wrapper.x + wrapper.width / 2 - panel.width / 2 + SHIFT_X;
  const left = clamp(desiredLeft, MARGIN, Math.max(window.innerWidth - panel.width - MARGIN, MARGIN));

  // Prefer above the dot, flip below when there is not enough room
  const above = wrapper.y - panel.height - GAP;
  const top
    = above >= MARGIN ? above : Math.min(wrapper.y + GAP, Math.max(window.innerHeight - panel.height - MARGIN, MARGIN));

  panelStyle.value = { left: `${left}px`, top: `${top}px` };
}

useEventListener(window, "scroll", () => visible.value && updatePosition(), { capture: true });
useEventListener(window, "resize", () => visible.value && updatePosition());
</script>

<style scoped>
/*
 * `outline: none` seul vivait ici : le wrapper est `tabindex="0"`, donc un
 * utilisateur au clavier y atterrissait sans rien voir bouger sous son curseur.
 * Le popover s'ouvre bien au focus, mais il est téléporté dans <body> — rien
 * n'indiquait quelle vignette de la discographie était sélectionnée.
 */
.release-popover-wrapper {
  border-radius: var(--bd-radius-sm);
  display: inline-block;

  &:focus-visible {
    outline: 2px solid var(--bd-primary);
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }
}
</style>

<style>
/* Unscoped: the popover is teleported to <body> */
.release-popover {
  align-items: center;
  background: var(--bd-bg-dark);
  border: 1px solid var(--bd-bg-lighter);
  border-radius: var(--bd-radius-md);
  box-shadow: var(--bd-shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--bd-space-2);
  padding: var(--bd-space-2);
  pointer-events: none;
  position: fixed;
  width: 9rem;
  z-index: 10000;
}

.release-popover .rp-cover {
  aspect-ratio: 1;
  border-radius: var(--bd-radius-sm);
  display: block;
  object-fit: cover;
  width: 100%;
}

.release-popover .rp-cover-placeholder {
  opacity: 0.4;
}

.release-popover .rp-name {
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-sm);
  line-height: 1.2;
  overflow-wrap: break-word;
  text-align: center;
}

.release-popover .rp-meta {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  text-align: center;
}

.release-popover-enter-active,
.release-popover-leave-active {
  transition:
    opacity var(--bd-transition-fast),
    transform var(--bd-transition-fast);
}

.release-popover-enter-from,
.release-popover-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
