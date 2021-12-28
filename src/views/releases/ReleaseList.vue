<template>
  <div class="content">
    <div v-for="(month, index) in releasesStore.monthList" :key="index">
      <div class="month">{{ month }}</div>
      <template v-for="release in releasesStore.releases" :key="release.id">
        <Release :release="release" :month="month" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Release from "./Release.vue";
import { useReleases } from "./ReleasesStore";

const releasesStore = useReleases();

releasesStore.getReleases();
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
