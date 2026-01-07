<template>
  <div ref="selectRef" class="custom-select" :class="{ open: isOpen, disabled }">
    <!-- Hidden sizer to determine minimum width based on longest option -->
    <div class="select-sizer" aria-hidden="true">
      <span v-for="option in options" :key="option.value" class="sizer-option">
        {{ option.label }}
      </span>
      <span class="sizer-option">{{ placeholder }}</span>
    </div>

    <button type="button" class="select-trigger" :disabled="disabled" @click="toggle">
      <span class="select-value">{{ displayValue }}</span>
      <i class="icon-chevron-down" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="select-dropdown">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="select-option"
          :class="{ selected: option.value === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

export interface SelectOption {
  label: string;
  value: string;
}

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    modelValue?: string;
    options: SelectOption[];
    placeholder?: string;
  }>(),
  {
    disabled: false,
    modelValue: "",
    placeholder: "Select...",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [option: SelectOption];
}>();

const isOpen = ref(false);
const selectRef = ref<HTMLElement | null>(null);

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder;
  const option = props.options.find((o) => o.value === props.modelValue);
  return option?.label ?? props.placeholder;
});

function toggle(): void {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
  }
}

function selectOption(option: SelectOption): void {
  emit("update:modelValue", option.value);
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

.custom-select {
  @include font-bold;

  display: inline-flex;
  flex-direction: column;
  max-width: 60%;
  position: relative;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.select-sizer {
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-md);
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
  font-size: var(--font-size-md);
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
  left: 0;
  max-height: 200px;
  overflow: hidden auto;
  position: absolute;
  top: calc(100% + 4px);
  width: 100%;
  z-index: 100;
}

.select-option {
  background: none;
  border: none;
  color: var(--font-color-light);
  cursor: pointer;
  font-size: var(--font-size-md);
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
