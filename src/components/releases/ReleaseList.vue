<template>
  <div class="content">
    <div v-for="month in groups" :key="month.label">
      <div class="month bd-font-bold">
        <span class="month-label">
          {{ month.label }}
          <span class="month-count">{{ month.releases.length }}</span>
        </span>
        <span v-if="month.unheard" class="month-unheard">{{ month.unheard }} unheard</span>
        <button
          v-if="month.unheard"
          class="month-heard"
          type="button"
          @click="releasesStore.markHeard(month.releases.map((release) => release.key))"
        >
          <CheckCheck :size="14" />
          Mark heard
        </button>
      </div>
      <Release v-for="release in month.releases" :key="release.key" :release="release" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CheckCheck } from "@lucide/vue";
import { computed } from "vue";

import { Release as ReleaseType } from "@/@types/Releases";
import Release from "@/components/releases/ReleaseIndex.vue";
import { monthLabel } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

interface MonthGroup {
  label: string;
  releases: ReleaseType[];
  unheard: number;
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
      month = { label, releases: [], unheard: 0 };
      months.push(month);
    }

    month.releases.push(release);
    if (!releasesStore.checks[release.key]) month.unheard += 1;
  }

  // "Highest rated" stays inside the month: scattering it across months would lose
  // the chronological orientation the feed is built around.
  if (releasesStore.sortRating) {
    for (const m of months) {
      m.releases = [...m.releases].sort(
        (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || a.name.localeCompare(b.name),
      );
    }
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
  padding: var(--bd-space-3) var(--bd-space-2);
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}

.month-label {
  align-items: center;
  display: flex;
  gap: var(--bd-space-2);
}

.month-count {
  background-color: var(--bd-bg-lighter);
  border-radius: var(--bd-radius-full);
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  padding: 0 var(--bd-space-2);
}

.month-unheard {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  margin-inline-start: auto;
  text-transform: none;
}

.month-heard {
  align-items: center;
  background: none;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: var(--bd-font-color-dark);
  cursor: pointer;
  display: inline-flex;
  font-size: var(--bd-font-size-xs);
  gap: var(--bd-space-1);
  padding: var(--bd-space-1) var(--bd-space-2);

  &:hover {
    background-color: var(--bd-bg-light);
    color: var(--bd-font-color-light);
  }
}
</style>
