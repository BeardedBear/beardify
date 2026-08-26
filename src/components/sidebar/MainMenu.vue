<template>
  <div class="menu">
    <RouterLink
      :class="{ 'active-route': $route.path.includes('/podcasts') }"
      :to="`/podcasts`"
      class="link bd-font-bold bd-squircle"
    >
      <i class="icon icon-podcast" />
      Podcasts
    </RouterLink>
    <RouterLink
      :class="{ 'active-route': $route.path.includes('/releases') }"
      :to="`/releases`"
      class="link bd-font-bold bd-squircle"
    >
      <i class="icon icon-album" />
      Releases
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";
</script>

<style scoped>

.menu {
  display: flex;
  gap: var(--bd-space-4);
  padding: var(--bd-space-4) var(--bd-space-4) var(--bd-space-1);
}

.link {
  background-color: var(--bd-bg);
  border-radius: var(--bd-radius-lg);
  color: var(--bd-font-color);
  display: block;
  flex: 1;
  font-size: var(--bd-font-size-base);
  padding: var(--bd-space-2) var(--bd-space-3);
  text-decoration: none;

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }

  &:hover {
    background-color: var(--bd-bg-light);
  }

  &.active-route {
    background-color: var(--bd-primary);
    color: white;
  }
}

.icon {
  margin-right: var(--bd-space-2);
}
</style>
