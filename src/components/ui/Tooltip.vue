<template>
  <span class="tooltip-wrapper" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
    <slot />
    <transition name="tooltip" appear>
      <span v-if="visible" class="tooltip" :class="placement" role="status">{{ text }}</span>
    </transition>
  </span>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps<{
  text: string;
  placement?: "top" | "bottom";
}>();

const visible = ref(false);
const placement = props.placement || "top";

function show() {
  visible.value = true;
}
function hide() {
  visible.value = false;
}
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
  background: var(--bg-color-darker);
  border-radius: 0.4rem;
  color: var(--font-color);
  display: inline-block;
  font-size: 0.9rem;
  opacity: 1;
  padding: 0.4rem 0.6rem;
  pointer-events: none;
  position: absolute;
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
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, calc(-1 * var(--tooltip-translate-offset))) scale(var(--tooltip-scale-end));
}

.tooltip.top.tooltip-enter-from,
.tooltip.top.tooltip-leave-to {
  transform: translate(-50%, calc(-1 * var(--tooltip-translate-distance))) scale(var(--tooltip-scale-start));
}

.tooltip.top.tooltip-enter-to,
.tooltip.top.tooltip-leave-from {
  transform: translate(-50%, calc(-1 * var(--tooltip-translate-offset))) scale(var(--tooltip-scale-end));
}

/* Bottom placement: slide down slightly */
.tooltip.bottom {
  left: 50%;
  top: 100%;
  transform: translate(-50%, var(--tooltip-translate-offset)) scale(var(--tooltip-scale-end));
}

.tooltip.bottom.tooltip-enter-from,
.tooltip.bottom.tooltip-leave-to {
  transform: translate(-50%, var(--tooltip-translate-distance)) scale(var(--tooltip-scale-start));
}

.tooltip.bottom.tooltip-enter-to,
.tooltip.bottom.tooltip-leave-from {
  transform: translate(-50%, var(--tooltip-translate-offset)) scale(var(--tooltip-scale-end));
}
</style>
