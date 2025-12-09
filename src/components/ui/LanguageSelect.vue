<template>
  <select class="language-select" :value="modelValue" @change="onChange">
    <option v-for="option in options" :key="option.code" :value="option.code">
      {{ option.name }}
    </option>
  </select>
</template>

<script lang="ts" setup>
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

function onChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  const code = select.value;
  const option = props.options.find((o) => o.code === code);

  emit("update:modelValue", code);
  if (option) {
    emit("change", option);
  }
}
</script>

<style lang="scss" scoped>
.language-select {
  appearance: none;
  background: var(--bg-color-light)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")
    no-repeat right 0.5rem center;
  border: 1px solid var(--bg-color-lighter);
  border-radius: 0.25rem;
  color: var(--font-color-default);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.35rem 1.5rem 0.35rem 0.5rem;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    background-color: var(--bg-color-lighter);
    border-color: var(--bg-color-lighter);
  }

  &:focus {
    border-color: var(--primary-color-default);
    outline: none;
  }

  option {
    background: var(--bg-color-dark);
    color: var(--font-color-default);
  }
}
</style>
