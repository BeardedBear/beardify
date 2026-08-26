<template>
  <div class="content">
    <div v-for="(month, index) in releasesStore.monthList" :key="index">
      <div class="month bd-font-bold">
        {{ month }}
      </div>
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
import Release from "@/components/releases/ReleaseIndex.vue";
import { useReleases } from "@/views/releases/ReleasesStore";

const releasesStore = useReleases();
</script>

<style scoped>

.month {
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  padding: var(--bd-space-4) var(--bd-space-2);
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}

.content {
  padding: 0 var(--bd-space-6);
}
</style>
