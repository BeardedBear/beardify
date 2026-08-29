<template>
  <BdTooltip :content="type ?? ''" bare>
    <i :class="['device-type', `icon-${normalizedType}`]" role="img" :aria-label="type ?? ''" aria-hidden="false" />
  </BdTooltip>
</template>

<script lang="ts" setup>
import { BdTooltip } from "bearded-ui";
import { computed } from "vue";

import type { DeviceType } from "@/@types/Device";

const props = defineProps<{ type?: DeviceType | null }>();

const normalizedType = computed(() => (props.type ?? "unknown").replace(/_/g, "-").toLowerCase());
</script>

<style scoped>
.device-type {
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
  font-size: var(--bd-font-size-lg);
  height: 1.2rem;
  line-height: 1;
  opacity: 0.95;
  vertical-align: middle;
  width: 1.2rem;
}
</style>
