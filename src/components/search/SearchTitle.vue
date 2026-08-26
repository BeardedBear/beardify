<template>
  <h3 class="search-title bd-font-bold">
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
  background-color: var(--bd-bg-dark);
  color: var(--bd-primary);
  display: flex;
  font-size: var(--bd-font-size-sm);
  gap: var(--bd-space-2);
  margin: 0 0 var(--bd-space-4);
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;

  @media (--mobile) {
    padding: 0 0 var(--bd-space-2);
  }
}

.count {
  color: var(--bd-font-color-dark);
  font-variant-numeric: tabular-nums;
}
</style>
