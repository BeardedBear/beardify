<template>
  <h3 class="search-title">
    {{ title }}
  </h3>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
}>();
</script>

<style lang="scss" scoped>
.search-title {
  color: var(--primary-color);
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0 0 1rem;
  text-transform: uppercase;
}
</style>
