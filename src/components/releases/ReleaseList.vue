<template>
  <div class="content">
    <div v-for="month in groups" :key="month.label">
      <div class="month bd-font-bold">
        {{ month.label }}
        <span class="month-count">{{ month.releases.length }}</span>
      </div>
      <Release v-for="release in month.releases" :key="release.key" :release="release" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { Release as ReleaseType } from "@/@types/Releases";
import Release from "@/components/releases/ReleaseIndex.vue";
import { monthLabel } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

interface MonthGroup {
  label: string;
  releases: ReleaseType[];
}

const releasesStore = useReleases();

/*
 * Months, and nothing finer. The listing this feed comes from groups by month and
 * never states a day, so the day headings this used to carry would all read "exact
 * date unknown" — a heading per group that says the same thing is noise.
 *
 * One pass over an already-sorted feed rather than a scan per heading, which is what
 * the first version did: with the sidebar filters in play that was a full pass over
 * every release for every month on screen.
 */
const groups = computed<MonthGroup[]>(() => {
  const months: MonthGroup[] = [];
  let month: MonthGroup | undefined;

  for (const release of releasesStore.visibleReleases) {
    const label = monthLabel(release.timestamp);

    if (month?.label !== label) {
      month = { label, releases: [] };
      months.push(month);
    }

    month.releases.push(release);
  }

  return months;
});
</script>

<style scoped>
.content {
  padding: 0 var(--bd-space-6) var(--bd-space-6);
}

.month {
  align-items: center;
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  display: flex;
  gap: var(--bd-space-2);
  padding: var(--bd-space-4) var(--bd-space-2);
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}

.month-count {
  background-color: var(--bd-bg-lighter);
  border-radius: var(--bd-radius-full);
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: 0 var(--bd-space-2);
}
</style>
