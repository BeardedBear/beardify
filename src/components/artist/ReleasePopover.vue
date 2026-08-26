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
import { useElementBounding, useEventListener, useWindowSize } from "@vueuse/core";
import { nextTick, ref } from "vue";

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

const { height: viewportHeight, width: viewportWidth } = useWindowSize();
const { width: wrapWidth, x: wrapLeft, y: wrapTop } = useElementBounding(wrapperRef);
const { height: panelHeight, width: panelWidth } = useElementBounding(panelRef);

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hide(): void {
  visible.value = false;
  panelStyle.value = { ...OFFSCREEN };
}

function show(): void {
  visible.value = true;
  nextTick(updatePosition);
}

function updatePosition(): void {
  const vpW = viewportWidth.value || window.innerWidth;
  const vpH = viewportHeight.value || window.innerHeight;
  const panelW = panelWidth.value || 0;
  const panelH = panelHeight.value || 0;

  const desiredLeft = wrapLeft.value + wrapWidth.value / 2 - panelW / 2 + SHIFT_X;
  const left = clamp(desiredLeft, MARGIN, Math.max(vpW - panelW - MARGIN, MARGIN));

  // Prefer above the dot, flip below when there is not enough room
  const top
    = wrapTop.value - panelH - GAP >= MARGIN
      ? wrapTop.value - panelH - GAP
      : Math.min(wrapTop.value + GAP, Math.max(vpH - panelH - MARGIN, MARGIN));

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
