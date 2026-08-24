<template>
  <h3 class="search-title font-bold">
    {{ title }}
    <!-- Says the list is truncated. Six results with no count read as "six exist". -->
    <span v-if="count !== undefined" class="count">{{ count }}</span>
  </h3>
</template>

<script lang="ts" setup>
defineProps<{
  count?: number;
  title: string;
}>();
</script>

<style scoped>

/*
 * Sticky because each column scrolls on its own now: without it the label
 * scrolls away and a list of bare rows loses the only thing saying what it is.
 * The background matches the dialog surface (.bd-surface uses --bd-bg-dark,
 * aliased here as --bg-color-dark) so rows pass behind it cleanly.
 */
.search-title {
  align-items: baseline;
  background-color: var(--bg-color-dark);
  color: var(--primary-color);
  display: flex;
  font-size: var(--font-size-sm);
  gap: 0.4rem;
  margin: 0 0 1rem;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;

  @media (--mobile) {
    padding: 0 0 0.5rem;
  }
}

.count {
  color: var(--font-color-dark);
  font-variant: tabular-nums;
}
</style>
