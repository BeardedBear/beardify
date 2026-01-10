<template>
  <div class="tabs">
    <template v-for="tab in tabs" :key="tab.id">
      <Tooltip v-if="tab.disabled && tab.tooltip" :text="tab.tooltip">
        <button
          :class="{ active: modelValue === tab.id, disabled: tab.disabled }"
          class="tab"
          :aria-disabled="tab.disabled ? 'true' : 'false'"
          :disabled="tab.disabled"
          @click="!tab.disabled && $emit('update:modelValue', tab.id)"
        >
          <span>{{ tab.label }}</span>
        </button>
      </Tooltip>
      <button
        v-else
        :key="tab.id + '-btn'"
        :class="{ active: modelValue === tab.id, disabled: tab.disabled }"
        class="tab"
        :aria-disabled="tab.disabled ? 'true' : 'false'"
        :disabled="tab.disabled"
        @click="!tab.disabled && $emit('update:modelValue', tab.id)"
      >
        <span>{{ tab.label }}</span>
      </button>
    </template>
  </div>
</template>

<script lang="ts">
export interface Tab {
  disabled?: boolean;
  icon: string;
  id: string;
  label: string;
  tooltip?: string;
}
</script>

<script lang="ts" setup>
import Tooltip from "@/components/ui/Tooltip.vue";

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

  &.disabled {
    cursor: not-allowed;
    opacity: 0.45;

    &:hover {
      background-color: transparent;
      opacity: 0.45;
    }
  }
}
</style>

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
}
</style>
