<template>
  <div class="menu">
    <RouterLink :class="{ 'active-route': $route.path.includes('/podcasts') }" :to="`/podcasts`" class="link">
      <i class="icon icon-podcast" />
      Podcasts
    </RouterLink>
    <RouterLink :class="{ 'active-route': $route.path.includes('/releases') }" :to="`/releases`" class="link">
      <i class="icon icon-album" />
      Releases
    </RouterLink>
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "../../assets/scss/colors" as colors;

.menu {
  display: flex;
  gap: 1rem;
  padding: 1rem 1rem 0.3rem;
}

.link {
  background-color: var(--bg-color);
  border-radius: 0.4rem;
  color: var(--font-color);
  display: block;
  flex: 1;
  font-size: 1rem;
  font-weight: bold;
  padding: 0.4rem 0.8rem;
  text-decoration: none;

  &:hover {
    background-color: var(--bg-color-light);
  }

  &.active-route {
    background-color: var(--primary-color);
    color: white;
  }
}

.icon {
  margin-right: 0.5rem;
}
</style>
