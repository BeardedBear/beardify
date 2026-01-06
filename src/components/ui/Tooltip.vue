<template>
  <span ref="wrapperRef" class="tooltip-wrapper">
    <slot />
    <Teleport to="body">
      <transition name="tooltip" appear>
        <span
          v-if="visible"
          ref="tooltipRef"
          class="tooltip"
          :class="[currentPlacement]"
          :style="tooltipStyle"
          role="status"
        >
          {{ text }}
        </span>
      </transition>
    </Teleport>
  </span>
</template>

<script lang="ts" setup>
import { useElementBounding, useEventListener, useResizeObserver, useWindowSize } from "@vueuse/core";
import { nextTick, ref } from "vue";

const props = defineProps<{
  text: string;
  placement?: "top" | "bottom";
}>();

const visible = ref(false);
const placement = props.placement || "top";
const currentPlacement = ref<typeof placement>(placement);

const tooltipRef = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const tooltipStyle = ref<Record<string, string>>({});

// Use VueUse to reactively track viewport and element bounds
const { width: viewportWidth, height: viewportHeight } = useWindowSize();
const {
  left: wrapLeft,
  top: wrapTop,
  bottom: wrapBottom,
  width: wrapWidth,
  height: wrapHeight,
} = useElementBounding(wrapperRef);
const { width: tipWidth, height: tipHeight } = useElementBounding(tooltipRef);

function updatePosition() {
  if (!tooltipRef.value || !wrapperRef.value) return;

  const margin = 8; // px

  // Read sizes/positions from VueUse bounding refs (fall back to getBoundingClientRect if not yet populated)
  const tipW = (tipWidth.value ?? 0) || tooltipRef.value.getBoundingClientRect().width || 0;
  const tipH = (tipHeight.value ?? 0) || tooltipRef.value.getBoundingClientRect().height || 0;

  const wrapL = (wrapLeft.value ?? 0) || wrapperRef.value.getBoundingClientRect().left || 0;
  const wrapT = (wrapTop.value ?? 0) || wrapperRef.value.getBoundingClientRect().top || 0;
  const wrapW = (wrapWidth.value ?? 0) || wrapperRef.value.getBoundingClientRect().width || 0;
  const wrapH = (wrapHeight.value ?? 0) || wrapperRef.value.getBoundingClientRect().height || 0;
  const wrapBottomVal = wrapBottom.value ?? wrapT + wrapH;

  const vpW = viewportWidth.value ?? (document.documentElement.clientWidth || window.innerWidth);
  const vpH = viewportHeight.value ?? (document.documentElement.clientHeight || window.innerHeight);

  // Horizontal: desired centered left in viewport
  const desiredLeftViewport = wrapL + (wrapW - tipW) / 2;
  const clampedLeftViewport = Math.min(Math.max(desiredLeftViewport, margin), Math.max(vpW - tipW - margin, margin));

  // Vertical: compute desired top depending on placement
  let desiredTopViewport: number;
  let finalPlacement = placement;

  if (placement === "top") {
    desiredTopViewport = wrapT - tipH;
    // If it would go above viewport, try flipping to bottom
    if (desiredTopViewport < margin) {
      const spaceBelow = vpH - wrapBottomVal - margin;
      if (spaceBelow >= tipH) {
        finalPlacement = "bottom";
      } else {
        // clamp to top margin
        desiredTopViewport = margin;
      }
    }
  } else {
    // bottom placement
    desiredTopViewport = wrapBottomVal;
    // If it would go below viewport, try flipping to top
    if (desiredTopViewport + tipH > vpH - margin) {
      const spaceAbove = wrapT - margin;
      if (spaceAbove >= tipH) {
        finalPlacement = "top";
        desiredTopViewport = wrapT - tipH;
      } else {
        // clamp to bottom margin
        desiredTopViewport = Math.max(vpH - tipH - margin, margin);
      }
    }
  }

  // If we ended up flipping, update currentPlacement
  currentPlacement.value = finalPlacement;

  // Always use fixed positioning since tooltip is teleported to body
  // If finalPlacement changed to bottom, desiredTopViewport should be wrap.bottom
  if (finalPlacement === "bottom" && placement === "top") {
    desiredTopViewport = wrapBottomVal;
  }
  // Ensure desiredTopViewport is within viewport margins
  const clampedTop = Math.min(Math.max(desiredTopViewport, margin), Math.max(vpH - tipH - margin, margin));

  tooltipStyle.value = {
    position: "fixed",
    left: `${clampedLeftViewport}px`,
    top: `${clampedTop}px`,
  };
}

function show() {
  visible.value = true;
  // reset to original placement each time we show
  currentPlacement.value = placement;
  nextTick(() => updatePosition());
}
function hide() {
  visible.value = false;
  tooltipStyle.value = {};
  currentPlacement.value = placement;
}

// Mouse enter/leave and focus handlers (use VueUse event helpers)
useEventListener(wrapperRef, "mouseenter", show);
useEventListener(wrapperRef, "mouseleave", hide);
useEventListener(wrapperRef, "focusin", show);
useEventListener(wrapperRef, "focusout", hide);

// Update position on viewport changes when visible
useEventListener(window, "resize", () => {
  if (visible.value) updatePosition();
});
useEventListener(
  window,
  "scroll",
  () => {
    if (visible.value) updatePosition();
  },
  { capture: true },
);

// React to dimension changes of the wrapper or tooltip
useResizeObserver(wrapperRef, () => {
  if (visible.value) updatePosition();
});
useResizeObserver(tooltipRef, () => {
  if (visible.value) updatePosition();
});

// Click outside to hide tooltip
useEventListener(document, "pointerdown", (e: PointerEvent) => {
  const target = e.target as Node | null;
  if (visible.value && wrapperRef.value && target && !wrapperRef.value.contains(target)) {
    hide();
  }
});
</script>

<style scoped lang="scss">
.tooltip-wrapper {
  display: inline-block;
  position: relative;
}
</style>

<style lang="scss">
/* Tooltip styles - unscoped because tooltip is teleported to body */
.tooltip {
  --tooltip-duration: 0.32s;
  --tooltip-easing: cubic-bezier(0.2, 0.9, 0.2, 1);
  --tooltip-translate-offset: 0.4rem;
  --tooltip-translate-distance: 1rem;
  --tooltip-scale-start: 0.98;
  --tooltip-scale-end: 1;
  --tooltip-opacity-from: 0;
  --tooltip-opacity-to: 1;
  --tooltip-translate: 0;
  --tooltip-scale-current: var(--tooltip-scale-end);

  background: var(--bg-color-darker);
  border: 1px solid var(--bg-color-lighter);
  border-radius: 0.4rem;
  box-shadow: 0.12rem 0.12rem 0.24rem rgb(0 0 0 / 12%);
  color: var(--font-color);
  display: inline-block;
  font-family: inherit;
  font-size: 0.9rem;
  max-width: 300px;
  opacity: 1;
  overflow-wrap: normal;
  padding: 0.3rem 0.6rem;
  pointer-events: none;
  position: fixed;
  transform: translate(0, var(--tooltip-translate)) scale(var(--tooltip-scale-current));
  white-space: normal;
  will-change: transform, opacity, left, top;
  word-break: normal;
  z-index: 10000;
}

/* Transition states */
.tooltip-enter-active,
.tooltip-leave-active {
  transition:
    opacity var(--tooltip-duration) var(--tooltip-easing),
    transform var(--tooltip-duration) var(--tooltip-easing);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: var(--tooltip-opacity-from);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: var(--tooltip-opacity-to);
}

/* Top placement: slide up slightly */
.tooltip.top {
  --tooltip-translate: calc(-1 * var(--tooltip-translate-offset));
  --tooltip-scale-current: var(--tooltip-scale-end);

  transform-origin: center bottom;
}

.tooltip.top.tooltip-enter-from,
.tooltip.top.tooltip-leave-to {
  --tooltip-translate: calc(-1 * var(--tooltip-translate-distance));
  --tooltip-scale-current: var(--tooltip-scale-start);
}

/* Bottom placement: slide down slightly */
.tooltip.bottom {
  --tooltip-translate: var(--tooltip-translate-offset);
  --tooltip-scale-current: var(--tooltip-scale-end);

  transform-origin: center top;
}

.tooltip.bottom.tooltip-enter-from,
.tooltip.bottom.tooltip-leave-to {
  --tooltip-translate: var(--tooltip-translate-distance);
  --tooltip-scale-current: var(--tooltip-scale-start);
}
</style>
