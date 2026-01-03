<template>
  <div class="content">
    <div :key="index" v-for="(month, index) in releasesStore.monthList">
      <div class="month">{{ month }}</div>
      <template :key="release.id" v-for="release in releasesStore.releases">
        <template v-if="releasesStore.activeSlug && month === release.releaseDate">
          <Release :release="release" v-if="release.slug.includes(releasesStore.activeSlug)" />
        </template>
        <template v-else>
          <Release :release="release" v-if="month === release.releaseDate" />
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useReleases } from "@/views/releases/ReleasesStore";
import Release from "@/components/releases/ReleaseIndex.vue";

const releasesStore = useReleases();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.month {
  background-color: var(--bg-color-darker);
  color: var(--primary-color);

  @include font-bold;

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
