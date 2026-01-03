<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="{ active: modelValue === tab.id }"
      class="tab"
      @click="$emit('update:modelValue', tab.id)"
    >
      <!-- <i :class="tab.icon" /> -->
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>

<script lang="ts">
export interface Tab {
  icon: string;
  id: string;
  label: string;
}
</script>

<script lang="ts" setup>
defineProps<{
  modelValue: string;
  tabs: Tab[];
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
  position: relative;
  z-index: 1;
}

.tab {
  $radius: 0.5rem;

  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: $radius $radius 0 0;
  color: var(--font-color-light);
  cursor: pointer;
  display: flex;

  // font-size: 0.9rem;

  @include font-bold;

  gap: 0.4rem;
  opacity: 0.5;
  padding: 0.5rem 1.5rem;
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;

  @include responsive.mobile {
    padding: 0.5rem 0.8rem;
  }

  &:hover {
    background-color: var(--bg-color-dark);
    opacity: 0.8;
  }

  &.active {
    background-color: var(--bg-color-darker);
    opacity: 1;
  }

  // i {
  //   font-size: 1rem;
  // }
}
</style>
