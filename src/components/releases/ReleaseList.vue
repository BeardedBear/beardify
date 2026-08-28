<template>
  <div class="content">
    <div v-for="month in groups" :key="month.label">
      <div class="month bd-font-bold">{{ month.label }}</div>
      <div v-for="day in month.days" :key="day.label" class="day-group">
        <div class="day">
          {{ day.label }}
          <span class="day-count">{{ day.releases.length }}</span>
        </div>
        <Release v-for="release in day.releases" :key="release.key" :release="release" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { Release as ReleaseType } from "@/@types/Releases";
import Release from "@/components/releases/ReleaseIndex.vue";
import { dayLabel, monthLabel } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

/** Where a release with no exact date lands, at the tail of its month. */
const UNDATED = "Exact date unknown";

interface DayGroup {
  label: string;
  releases: ReleaseType[];
}

interface MonthGroup {
  days: DayGroup[];
  label: string;
}

const releasesStore = useReleases();

/*
 * One pass over an already-sorted feed rather than a scan per heading, which is
 * what the old list did: with the sidebar filters in play that was a full pass
 * over every release for every month on screen.
 *
 * Order comes entirely from the sort, never from re-sorting the buckets. That is
 * also what puts the undated rows last within their month for free: a release
 * dated only to "2026-08" carries the timestamp of August 1st, so it has already
 * sorted below every dated day of that month.
 */
const groups = computed<MonthGroup[]>(() => {
  const months: MonthGroup[] = [];
  let month: MonthGroup | undefined;
  let day: DayGroup | undefined;

  for (const release of releasesStore.visibleReleases) {
    const monthName = monthLabel(release.timestamp);
    const dayName = dayLabel(release) ?? UNDATED;

    if (month?.label !== monthName) {
      month = { days: [], label: monthName };
      months.push(month);
      day = undefined;
    }

    if (day?.label !== dayName) {
      day = { label: dayName, releases: [] };
      month.days.push(day);
    }

    day.releases.push(release);
  }

  return months;
});
</script>

<style scoped>
.content {
  padding: 0 var(--bd-space-6) var(--bd-space-6);
}

.month {
  background-color: var(--bd-bg-darker);
  color: var(--bd-primary);
  padding: var(--bd-space-4) var(--bd-space-2);
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 1;
}

/*
 * Deliberately not sticky. The month heading above already is, and pinning a
 * second band under it needs a hard-coded offset equal to the first one's height
 * — which the month heading does not have at every width.
 */
.day {
  align-items: center;
  color: var(--bd-font-color-dark);
  display: flex;
  font-size: var(--bd-font-size-xs);
  gap: var(--bd-space-2);
  letter-spacing: 0.05em;
  padding: var(--bd-space-3) var(--bd-space-2) var(--bd-space-1);
  text-transform: uppercase;

  /* A hairline running to the end of the row, so the day reads as a divider rather than a row. */
  &::after {
    background-color: var(--bd-bg-lighter);
    content: "";
    flex: 1;
    height: 1px;
  }
}

.day-count {
  background-color: var(--bd-bg-lighter);
  border-radius: var(--bd-radius-full);
  padding: 0 var(--bd-space-2);
}
</style>
