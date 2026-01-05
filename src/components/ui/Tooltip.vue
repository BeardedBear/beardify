<template>
  <span ref="wrapperRef" class="tooltip-wrapper" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
    <slot />
    <transition name="tooltip" appear>
      <span
        v-if="visible"
        ref="tooltipRef"
        class="tooltip"
        :class="[currentPlacement, { anchored }]"
        :style="tooltipStyle"
        role="status"
      >
        {{ text }}
      </span>
    </transition>
  </span>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref } from "vue";

const props = defineProps<{
  text: string;
  placement?: "top" | "bottom";
}>();

const visible = ref(false);
const placement = props.placement || "top";
const currentPlacement = ref<typeof placement>(placement);

const tooltipRef = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const anchored = ref(false);
const tooltipStyle = ref<Record<string, string>>({});

function updatePosition() {
  if (!tooltipRef.value || !wrapperRef.value) return;
  const tip = tooltipRef.value.getBoundingClientRect();
  const wrap = wrapperRef.value.getBoundingClientRect();

  const margin = 8; // px
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

  // Horizontal: desired centered left in viewport
  const desiredLeftViewport = wrap.left + (wrap.width - tip.width) / 2;
  const clampedLeftViewport = Math.min(
    Math.max(desiredLeftViewport, margin),
    Math.max(viewportWidth - tip.width - margin, margin)
  );

  // Vertical: compute desired top depending on placement
  let desiredTopViewport: number;
  let finalPlacement = placement;

  if (placement === "top") {
    desiredTopViewport = wrap.top - tip.height;
    // If it would go above viewport, try flipping to bottom
    if (desiredTopViewport < margin) {
      const spaceBelow = viewportHeight - wrap.bottom - margin;
      if (spaceBelow >= tip.height) {
        finalPlacement = "bottom";
      } else {
        // clamp to top margin
        desiredTopViewport = margin;
      }
    }
  } else {
    // bottom placement
    desiredTopViewport = wrap.bottom;
    // If it would go below viewport, try flipping to top
    if (desiredTopViewport + tip.height > viewportHeight - margin) {
      const spaceAbove = wrap.top - margin;
      if (spaceAbove >= tip.height) {
        finalPlacement = "top";
        desiredTopViewport = wrap.top - tip.height;
      } else {
        // clamp to bottom margin
        desiredTopViewport = Math.max(viewportHeight - tip.height - margin, margin);
      }
    }
  }

  // If we ended up flipping, update currentPlacement
  currentPlacement.value = finalPlacement;

  // Determine whether we need to anchor (use fixed positioning)
  const needAnchor = Math.abs(clampedLeftViewport - desiredLeftViewport) > 1 ||
    // if we clamped vertically (clampedTop differs from desiredTopViewport) or flipped
    (finalPlacement !== placement) ||
    desiredTopViewport < margin ||
    desiredTopViewport + tip.height > viewportHeight - margin;

  if (needAnchor) {
    anchored.value = true;
    // Use fixed positioning so we can place at viewport coordinates
    const left = clampedLeftViewport;
    // If finalPlacement changed to bottom, desiredTopViewport should be wrap.bottom
    if (finalPlacement === "bottom" && placement === "top") {
      desiredTopViewport = wrap.bottom;
    }
    // Ensure desiredTopViewport is within viewport margins
    const clampedTop = Math.min(Math.max(desiredTopViewport, margin), Math.max(viewportHeight - tip.height - margin, margin));

    tooltipStyle.value = {
      position: "fixed",
      left: `${left}px`,
      top: `${clampedTop}px`
    };
  } else {
    anchored.value = false;
    tooltipStyle.value = {};
  }
}

function show() {
  visible.value = true;
  // reset to original placement each time we show
  currentPlacement.value = placement;
  nextTick(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
  });
}
function hide() {
  visible.value = false;
  anchored.value = false;
  tooltipStyle.value = {};
  currentPlacement.value = placement;
  window.removeEventListener("resize", updatePosition);
  window.removeEventListener("scroll", updatePosition, true);
}

onBeforeUnmount(() => {
  window.removeEventListener("resize", updatePosition);
  window.removeEventListener("scroll", updatePosition, true);
});
</script>

<style scoped lang="scss">
.tooltip-wrapper {
  --tooltip-duration: 0.32s;
  --tooltip-easing: cubic-bezier(0.2, 0.9, 0.2, 1);
  --tooltip-translate-offset: 0.4rem; /* base offset */
  --tooltip-translate-distance: 1rem; /* enter/leave distance */
  --tooltip-scale-start: 0.98;
  --tooltip-scale-end: 1;
  --tooltip-opacity-from: 0;
  --tooltip-opacity-to: 1;

  display: inline-block;
  position: relative;
}

.tooltip {
  --tooltip-translate: 0;
  --tooltip-scale-current: var(--tooltip-scale-end);

  background: var(--bg-color-darker);
  border: 1px solid var(--bg-color-light);
  border-radius: 0.4rem;
  color: var(--font-color);
  display: inline-block;
  font-size: 0.9rem;
  opacity: 1;
  padding: 0.4rem 0.6rem;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, var(--tooltip-translate)) scale(var(--tooltip-scale-current));
  white-space: nowrap;
  will-change: transform, opacity;
  z-index: 50;
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

  bottom: 100%;
  left: 50%;
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

  left: 50%;
  top: 100%;
}

.tooltip.bottom.tooltip-enter-from,
.tooltip.bottom.tooltip-leave-to {
  --tooltip-translate: var(--tooltip-translate-distance);
  --tooltip-scale-current: var(--tooltip-scale-start);
}

/* When the tooltip is 'anchored' (repositioned to avoid viewport overflow)
   remove the horizontal -50% translate and position it using an explicit left/top px value */
.tooltip.anchored {
  bottom: auto;
  left: auto;
  position: fixed;
  top: auto;
  transform: translate(0, var(--tooltip-translate)) scale(var(--tooltip-scale-current));
  will-change: left, top, transform;
}

/* Ensure transform-origin matches placement for smoother flips */
.tooltip.anchored.top {
  transform-origin: center bottom;
}

.tooltip.anchored.bottom {
  transform-origin: center top;
}
</style>
