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
      <div v-if="month.top.length" class="top">
        <div class="top-heading bd-font-bold">Top of the month</div>
        <div class="top-row">
          <button
            v-for="(release, rank) in month.top"
            :key="release.key"
            class="top-card"
            type="button"
            @click="search(release.artistName, release.name)"
          >
            <span class="top-cover-wrap">
              <Cover :images="release.images" class="top-cover" size="medium" />
              <span class="rank bd-font-bold">{{ rank + 1 }}</span>
            </span>
            <span class="top-name bd-font-bold">{{ release.name }}</span>
            <span class="top-artist">{{ release.artistName }}</span>
            <span v-if="typeof release.rating === 'number'" class="top-rating">
              {{ release.rating.toFixed(1) }}<span class="unit">/5</span>
            </span>
          </button>
        </div>
      </div>
      <Release v-for="release in month.releases" :key="release.key" :release="release" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CheckCheck } from "@lucide/vue";
import { computed } from "vue";

import { Release as ReleaseType } from "@/@types/Releases";
import { useDialog } from "@/components/dialog/DialogStore";
import Release from "@/components/releases/ReleaseIndex.vue";
import { useSearch } from "@/components/search/SearchStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { monthLabel } from "@/helpers/releases";
import { useReleases } from "@/views/releases/ReleasesStore";

interface MonthGroup {
  label: string;
  releases: ReleaseType[];
  top: ReleaseType[];
  unheard: number;
}

const releasesStore = useReleases();
const searchStore = useSearch();
const dialogStore = useDialog();

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
      month = { label, releases: [], top: [], unheard: 0 };
      months.push(month);
    }

    month.releases.push(release);
    if (!releasesStore.checks[release.key]) month.unheard += 1;
  }

  // The month's best: the five highest editorial scores, shown as a highlight
  // rail above the full list. Only rated releases qualify — a release with no
  // score has nothing to rank on. Independent of the sort-by-rating toggle so
  // the strip stays the "best of the month" no matter the current ordering.
  for (const m of months) {
    m.top = m.releases
      .filter((release) => typeof release.rating === "number")
      .sort((a, b) => (b.rating as number) - (a.rating as number) || a.name.localeCompare(b.name))
      .slice(0, 5);
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

/*
 * Same landing as a release row: opens the search dialog pre-filled with the
 * artist, narrowed to the album when the album name was the thing clicked.
 * @param artist - Artist to search for
 * @param album - Album to narrow down to
 */
function search(artist: string, album?: string): void {
  searchStore.updateQuery(album ? `artist:${artist}  &  album:${album}` : `artist:${artist}`);
  dialogStore.open({ type: "search" });
}
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

.top {
  padding: var(--bd-space-3) var(--bd-space-3) var(--bd-space-2);
}

.top-heading {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-sm);
  margin-bottom: var(--bd-space-2);
}

.top-row {
  display: flex;
  gap: var(--bd-space-4);
  overflow-x: auto;
  padding-bottom: var(--bd-space-2);
}

.top-card {
  align-items: flex-start;
  background-color: transparent;
  border: none;
  border-radius: var(--bd-radius-sm);
  color: inherit;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: var(--bd-space-1);
  padding: var(--bd-space-2);
  width: 7.5rem;

  &:hover {
    background-color: var(--bd-bg-light);
  }
}

.top-cover-wrap {
  position: relative;
  width: 100%;
}

.top-cover {
  border-radius: var(--bd-radius-sm);
  width: 100%;
}

/* Rank badge, corner-pinned over the cover — same position as the artist page's
   ranked-album cards so the visual language of "a best-of rail" stays consistent. */
.rank {
  backdrop-filter: blur(2px);
  background: color-mix(in oklab, var(--bd-bg-darker) 82%, transparent);
  border-radius: var(--bd-radius-sm);
  bottom: 0.3rem;
  color: var(--bd-font-color-light);
  font-size: var(--bd-font-size-lg);
  left: 0.3rem;
  line-height: 1;
  padding: 0.15rem var(--bd-space-2);
  position: absolute;
  z-index: 2;
}

.top-name {
  font-size: var(--bd-font-size-base);
  line-height: 1.2;
  margin-top: var(--bd-space-1);
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.top-artist {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.top-rating {
  background-color: var(--bd-bg-lighter);
  border-radius: var(--bd-radius-sm);
  font-size: var(--bd-font-size-sm);
  margin-top: var(--bd-space-1);
  padding: 0.1rem var(--bd-space-2);

  .unit {
    color: var(--bd-font-color-dark);
    font-size: var(--bd-font-size-xs);
    padding-inline-start: 0.1rem;
  }
}
</style>
