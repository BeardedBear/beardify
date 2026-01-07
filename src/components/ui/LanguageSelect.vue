<template>
  <div ref="selectRef" class="language-select" :class="{ open: isOpen }">
    <!-- Hidden sizer to determine minimum width based on longest option -->
    <div class="select-sizer" aria-hidden="true">
      <span v-for="option in options" :key="option.code" class="sizer-option">
        {{ option.name }}
      </span>
    </div>

    <button type="button" class="select-trigger" @click="toggle">
      <span class="select-value">{{ displayValue }}</span>
      <i class="icon-chevron-down" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="select-dropdown">
        <button
          v-for="option in options"
          :key="option.code"
          type="button"
          class="select-option"
          :class="{ selected: option.code === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.name }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

export interface LanguageOption {
  code: string;
  name: string;
  url: string;
}

const props = defineProps<{
  modelValue: string;
  options: LanguageOption[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [option: LanguageOption];
}>();

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);

const displayValue = computed(() => {
  const option = props.options.find((o) => o.code === props.modelValue);
  return option?.name ?? props.modelValue;
});

function toggle(): void {
  isOpen.value = !isOpen.value;
}

function selectOption(option: LanguageOption): void {
  emit("update:modelValue", option.code);
  emit("change", option);
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent): void {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.language-select {
  display: inline-flex;
  flex-direction: column;
  position: relative;
}

.select-sizer {
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-sm);
  height: 0;
  overflow: hidden;
  padding: 0 2rem 0 0.75rem;
  pointer-events: none;
  visibility: hidden;
}

.sizer-option {
  white-space: nowrap;
}

.select-trigger {
  @include font-bold;

  align-items: center;
  background-color: var(--bg-color-lighter);
  border: none;
  border-radius: 0.3rem;
  color: var(--font-color-light);
  cursor: pointer;
  display: flex;
  font-size: var(--font-size-sm);
  gap: 0.5rem;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  width: 100%;

  &:hover {
    background-color: var(--bg-color-light);
    color: var(--font-color-default);
  }

  i {
    font-size: var(--font-size-xs);
    transition: transform 0.2s ease;

    .open & {
      transform: rotate(180deg);
    }
  }
}

.select-value {
  white-space: nowrap;
}

.select-dropdown {
  background-color: var(--bg-color-dark);
  border: 1px solid var(--bg-color-lighter);
  border-radius: 0.3rem;
  box-shadow: 0 4px 12px rgb(0 0 0 / 30%);
  display: flex;
  flex-direction: column;
  max-height: 200px;
  min-width: 100%;
  overflow: hidden auto;
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 100;
}

.select-option {
  background: none;
  border: none;
  color: var(--font-color-light);
  cursor: pointer;
  font-size: var(--font-size-sm);
  padding: 0.6rem 0.75rem;
  text-align: left;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: var(--bg-color-lighter);
    color: var(--font-color-default);
  }

  &.selected {
    background-color: var(--primary-color-default);
    color: var(--font-color-default);
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
