<template>
  <div class="tabs">
    <template v-for="tab in tabs" :key="tab.id">
      <Tooltip v-if="tab.disabled && tab.tooltip" :text="tab.tooltip">
        <button
          :class="tabClass(tab)"
          :aria-disabled="tab.disabled ? 'true' : 'false'"
          :disabled="tab.disabled"
          @click="!tab.disabled && $emit('update:modelValue', tab.id)"
        >
          <component :is="tab.icon" />
          <span>{{ tab.label }}</span>
        </button>
      </Tooltip>
      <button
        v-else
        :key="tab.id + '-btn'"
        :class="tabClass(tab)"
        :aria-disabled="tab.disabled ? 'true' : 'false'"
        :disabled="tab.disabled"
        @click="!tab.disabled && $emit('update:modelValue', tab.id)"
      >
        <component :is="tab.icon" />
        <span>{{ tab.label }}</span>
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import type { Component } from "vue";

export interface Tab {
  bar?: boolean;
  disabled?: boolean;
  icon: Component;
  id: string;
  label: string;
  loading?: boolean;
  tooltip?: string;
}
</script>

<script lang="ts" setup>
import Tooltip from "@/components/ui/Tooltip.vue";

const props = defineProps<{
  modelValue: string;
  tabs: Tab[];
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();

function tabClass(tab: Tab): (Record<string, boolean | undefined> | string)[] {
  return [
    "tab",
    {
      active: props.modelValue === tab.id,
      disabled: tab.disabled,
      "tab-bar": tab.bar,
      "tab-loading": tab.loading,
    },
  ];
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes gradient-slide {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
  position: relative;
  z-index: 1;
}

.tab {
  $radius: 0.2rem;

  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: $radius $radius 0 0;
  color: var(--font-color-light);
  cursor: pointer;
  display: flex;

  @include font-bold;

  gap: 0.5rem;
  opacity: 0.5;
  padding: 0.5rem 1rem;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(svg) {
    height: 1rem;
    width: 1rem;
  }

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

  &.tab-loading {
    /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
    :deep(svg) {
      animation: spin 1s linear infinite;
    }
  }

  &.tab-bar {
    position: relative;

    &::before {
      animation: gradient-slide 2s linear infinite;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--primary-color) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      border-radius: 0.5rem 0.5rem 0 0;
      content: "";
      height: 2px;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }
  }
}
</style>
