<template>
  <div class="tabs">
    <template v-for="tab in tabs" :key="tab.id">
      <BdTooltip v-if="tab.disabled && tab.tooltip" :content="tab.tooltip">
        <button
          :class="tabClass(tab)"
          :aria-disabled="tab.disabled ? 'true' : 'false'"
          :disabled="tab.disabled"
          @click="!tab.disabled && $emit('update:modelValue', tab.id)"
        >
          <component :is="tab.icon" />
          <span>{{ tab.label }}</span>
        </button>
      </BdTooltip>
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

import { BdTooltip } from "bearded-ui";

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
    "font-bold",
    {
      active: props.modelValue === tab.id,
      disabled: tab.disabled,
      "tab-bar": tab.bar,
      "tab-loading": tab.loading,
    },
  ];
}
</script>

<style scoped>

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
  gap: var(--bd-space-2);
  margin-top: var(--bd-space-3);
  position: relative;
  z-index: 1;
}

.tab {
  --tab-radius: 0.2rem;

  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: var(--tab-radius) var(--tab-radius) 0 0;
  color: var(--bd-font-color-dark);
  cursor: pointer;
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-2) var(--bd-space-4);
  transition:
    background-color var(--bd-transition),
    opacity var(--bd-transition);

  @media (--mobile) {
    padding: var(--bd-space-2) var(--bd-space-3);
  }

  &:hover {
    background-color: var(--bd-bg-dark);
    opacity: 0.8;
  }

  &.active {
    background-color: var(--bd-bg-darker);
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

  &.tab-bar {
    position: relative;

    &::before {
      animation: gradient-slide 2s linear infinite;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--bd-primary) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      border-radius: var(--bd-radius-md) var(--bd-radius-md) 0 0;
      content: "";
      height: 2px;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    }
  }
}

/* See the comment in ArtistInfo.vue: :deep() must stay top-level, never nested. */
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.tab :deep(svg) {
  height: 1rem;
  width: 1rem;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.tab.tab-loading :deep(svg) {
  animation: spin 1s linear infinite;
}
</style>
