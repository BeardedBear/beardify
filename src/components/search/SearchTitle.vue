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
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.search-title {
  color: var(--primary-color);
  font-size: var(--font-size-sm);

  @include font-bold;

  margin: 0 0 1rem;
  text-transform: uppercase;

  @include responsive.mobile {
    padding: 0 0 0.5rem;
  }
}
</style>
