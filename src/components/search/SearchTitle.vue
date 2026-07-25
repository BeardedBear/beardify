<template>
  <h3 class="search-title font-bold">
    {{ title }}
  </h3>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
}>();
</script>

<style scoped>

.search-title {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  margin: 0 0 1rem;
  text-transform: uppercase;

  @media (width <= 767px) {
    padding: 0 0 0.5rem;
  }
}
</style>
