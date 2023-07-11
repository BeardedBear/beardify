<template>
  <div class="content">
    <div v-for="(month, index) in releasesStore.monthList" :key="index">
      <div class="month">{{ month }}</div>
      <template v-for="release in releasesStore.releases" :key="release.id">
        <template v-if="releasesStore.activeSlug && month === release.releaseDate">
          <Release v-if="release.slug.includes(releasesStore.activeSlug)" :release="release" />
        </template>
        <template v-else>
          <Release v-if="month === release.releaseDate" :release="release" />
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useReleases } from "../../views/releases/ReleasesStore";
import Release from "./ReleaseIndex.vue";

const releasesStore = useReleases();
</script>

<style lang="scss" scoped>
.month {
  background-color: var(--bg-color-darker);
  color: var(--primary-color);
  font-weight: bold;
  padding: 1rem 0.5rem;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}

.content {
  padding: 0 2rem;
}
</style>
