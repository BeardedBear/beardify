<template>
  <div class="menu">
    <ButtonIndex
      :class="{ 'active-route': $route.path.includes('/podcasts') }"
      :to="`/podcasts`"
      class="link font-bold squircle"
      no-default-class
    >
      <i class="icon icon-podcast" />
      Podcasts
    </ButtonIndex>
    <ButtonIndex
      :class="{ 'active-route': $route.path.includes('/releases') }"
      :to="`/releases`"
      class="link disabled font-bold squircle"
      no-default-class
    >
      <i class="icon icon-album" />
      Releases
    </ButtonIndex>
  </div>
</template>

<script lang="ts" setup>
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
</script>

<style scoped>

.menu {
  display: flex;
  gap: 1rem;
  padding: 1rem 1rem 0.3rem;
}

.link {
  background-color: var(--bg-color);
  border-radius: 1rem;
  color: var(--font-color);
  display: block;
  flex: 1;
  font-size: var(--font-size-base);
  padding: 0.4rem 0.8rem;
  text-decoration: none;

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }

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
