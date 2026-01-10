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

const props = withDefaults(
  defineProps<{
    placement?: "bottom" | "top";
    text: string;
  }>(),
  { placement: "top" },
);

const MARGIN = 8;

const visible = ref(false);
const currentPlacement = ref<"bottom" | "top">(props.placement);
const tooltipRef = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const tooltipStyle = ref<Record<string, string>>({});

const { height: viewportHeight, width: viewportWidth } = useWindowSize();
const { bottom: wrapBottom, width: wrapWidth, x: wrapLeft, y: wrapTop } = useElementBounding(wrapperRef);
const { height: tipHeight, width: tipWidth } = useElementBounding(tooltipRef);

function calculateHorizontalPosition(): number {
  const tipW = tipWidth.value || 0;
  const desiredLeft = wrapLeft.value + (wrapWidth.value - tipW) / 2;
  const vpW = (viewportWidth.value ?? document.documentElement.clientWidth) || window.innerWidth;

  return clamp(desiredLeft, MARGIN, Math.max(vpW - tipW - MARGIN, MARGIN));
}

function calculateVerticalPosition(
  desiredTop: number,
  tipH: number,
  fallbackToBottom: boolean,
): { placement: "bottom" | "top"; top: number } {
  const vpH = (viewportHeight.value ?? document.documentElement.clientHeight) || window.innerHeight;

  if (desiredTop < MARGIN && fallbackToBottom) {
    const spaceBelow = vpH - wrapBottom.value - MARGIN;
    if (spaceBelow >= tipH) {
      return { placement: "bottom", top: wrapBottom.value };
    }
  } else if (desiredTop + tipH > vpH - MARGIN && !fallbackToBottom) {
    const spaceAbove = wrapTop.value - MARGIN;
    if (spaceAbove >= tipH) {
      return { placement: "top", top: wrapTop.value - tipH };
    }
  }

  return { placement: props.placement, top: clamp(desiredTop, MARGIN, Math.max(vpH - tipH - MARGIN, MARGIN)) };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function hide(): void {
  visible.value = false;
  tooltipStyle.value = {};
  currentPlacement.value = props.placement;
}

function show(): void {
  visible.value = true;
  currentPlacement.value = props.placement;
  nextTick(() => updatePosition());
}

function updatePosition(): void {
  if (!tooltipRef.value || !wrapperRef.value) return;

  const tipH = tipHeight.value || 0;
  const horizontalPosition = calculateHorizontalPosition();

  let verticalPosition: { placement: "bottom" | "top"; top: number };

  if (props.placement === "top") {
    verticalPosition = calculateVerticalPosition(wrapTop.value - tipH, tipH, true);
  } else {
    verticalPosition = calculateVerticalPosition(wrapBottom.value, tipH, false);
  }

  currentPlacement.value = verticalPosition.placement;

  tooltipStyle.value = {
    left: `${horizontalPosition}px`,
    position: "fixed",
    top: `${verticalPosition.top}px`,
  };
}

useEventListener(wrapperRef, ["focusin", "mouseenter"], show);
useEventListener(wrapperRef, ["focusout", "mouseleave"], hide);

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

useResizeObserver([tooltipRef, wrapperRef], () => {
  if (visible.value) updatePosition();
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
  font-size: var(--font-size-sm);
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
