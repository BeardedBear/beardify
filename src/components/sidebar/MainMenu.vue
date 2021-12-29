<template>
  <div class="menu">
    <router-link class="link" :to="`/podcasts`" :class="{ 'active-route': $route.path.includes('/podcasts') }">
      <i class="icon icon-podcast"></i>Podcasts
    </router-link>
    <router-link class="link" :to="`/releases`" :class="{ 'active-route': $route.path.includes('/releases') }">
      <i class="icon icon-album"></i>Releases
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

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
