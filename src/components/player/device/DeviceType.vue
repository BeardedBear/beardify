<template>
  <i
    :class="['device-type', `icon-${normalizedType}`]"
    :title="type ?? ''"
    role="img"
    :aria-label="type ?? ''"
    aria-hidden="false"
  />
</template>

<script lang="ts" setup>
import type { DeviceType } from "@/@types/Device";
import { computed } from "vue";

const props = defineProps<{ type?: DeviceType | null }>();

const normalizedType = computed(() => (props.type ?? "unknown").replace(/_/g, "-").toLowerCase());
</script>

<style scoped lang="scss">
.device-type {
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
  font-size: var(--font-size-lg);
  height: 1.2rem;
  line-height: 1;
  opacity: 0.95;
  vertical-align: middle;
  width: 1.2rem;
}
</style>
