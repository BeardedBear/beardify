<template>
  <span class="tooltip-wrapper" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
    <slot />
    <span v-if="visible" class="tooltip" :class="placement" role="status">{{ text }}</span>
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
  display: inline-block;
  position: relative;
}

.tooltip {
  background: rgb(0 0 0 / 85%);
  border-radius: 0.4rem;
  color: #fff;
  font-size: 0.8rem;
  opacity: 0.98;
  padding: 0.4rem 0.6rem;
  pointer-events: none;
  position: absolute;
  transform: translateY(-0.4rem);
  white-space: nowrap;
  z-index: 50;
}

.tooltip.top {
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, -0.4rem);
}

.tooltip.bottom {
  left: 50%;
  top: 100%;
  transform: translate(-50%, 0.4rem);
}
</style>
