<template>
  <div v-if="rows.length > 0" class="member-timeline">
    <h2 class="timeline-title">Members timeline</h2>

    <div class="timeline-legend">
      <span v-for="role in usedRoles" :key="role.label" class="legend-item">
        <span class="legend-swatch" :style="{ backgroundColor: role.color }" />
        {{ role.label }}
      </span>
    </div>

    <div class="timeline-grid">
      <!-- Year axis -->
      <div class="axis-spacer" />
      <div class="axis">
        <span
          v-for="tick in ticks"
          :key="tick.year"
          class="axis-tick"
          :style="{ left: `${tick.left}%` }"
        >
          {{ tick.year }}
        </span>
      </div>

      <!-- Member rows -->
      <template v-for="row in rows" :key="row.id">
        <div class="member-name" :class="{ 'is-active': !row.ended }">
          <MemberPopover :name="row.name">{{ row.name }}</MemberPopover>
        </div>
        <div class="member-track">
          <span
            v-for="tick in ticks"
            :key="`g-${tick.year}`"
            class="grid-line"
            :style="{ left: `${tick.left}%` }"
          />
          <Tooltip
            class="member-bar-wrapper"
            follow-cursor
            :style="{ left: `${row.left}%`, width: `${row.width}%` }"
            :text="row.tooltip"
          >
            <span
              class="member-bar"
              :class="{ 'is-active': !row.ended, 'is-undated': !row.dated }"
              :style="{ backgroundColor: row.color }"
            />
          </Tooltip>
        </div>
      </template>
    </div>

    <p class="timeline-source">Source: Wikidata / MusicBrainz</p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import MemberPopover from "@/components/artist/MemberPopover.vue";
import Tooltip from "@/components/ui/Tooltip.vue";
import { useArtist } from "@/views/artist/ArtistStore";

interface AxisTick {
  left: number;
  year: number;
}

interface Role {
  color: string;
  keywords: string[];
  label: string;
}

interface TimelineRow {
  color: string;
  dated: boolean;
  ended: boolean;
  id: string;
  left: number;
  name: string;
  start: number;
  tooltip: string;
  width: number;
}

const MIN_BAR_WIDTH = 0.8;

// Instrument -> role mapping, evaluated in order (bass before guitar matters)
const ROLES: Role[] = [
  { color: "#e2574c", keywords: ["vocal", "voice", "sing"], label: "Vocals" },
  { color: "#e2a74c", keywords: ["bass"], label: "Bass" },
  { color: "#4c9be2", keywords: ["guitar"], label: "Guitar" },
  { color: "#9b59b6", keywords: ["keyboard", "piano", "organ", "synth"], label: "Keyboards" },
  { color: "#2ecc71", keywords: ["drum", "percussion"], label: "Drums" },
];
const OTHER_ROLE: Role = { color: "#8a8a8a", keywords: [], label: "Other" };

const artistStore = useArtist();
const currentYear = new Date().getFullYear();

/**
 * Resolve a member's primary role from their instruments, for bar coloring.
 */
function roleFor(instruments: string[]): Role {
  const lowered = instruments.map((i) => i.toLowerCase());
  for (const role of ROLES) {
    if (lowered.some((instrument) => role.keywords.some((kw) => instrument.includes(kw)))) {
      return role;
    }
  }
  return OTHER_ROLE;
}

/**
 * Convert a partial date (YYYY, YYYY-MM, YYYY-MM-DD) to a fractional year so
 * months land at the right spot on the axis.
 */
function toYear(date: null | string): null | number {
  if (!date) return null;
  const [y, m] = date.split("-");
  const year = parseInt(y, 10);
  if (isNaN(year)) return null;
  const month = m ? parseInt(m, 10) : 1;
  return year + (isNaN(month) || month === 0 ? 0 : (month - 1) / 12);
}

const bounds = computed(() => {
  const starts: number[] = [];
  const ends: number[] = [];

  artistStore.bandMembers.forEach((member) => {
    const start = toYear(member.begin);
    if (start !== null) starts.push(start);
    const end = toYear(member.end) ?? (member.ended ? start : currentYear);
    if (end !== null) ends.push(end);
  });

  if (starts.length === 0) return null;

  const min = Math.floor(Math.min(...starts));
  const max = Math.ceil(Math.max(...ends, min));
  return { max: Math.max(max, min + 1), min };
});

const rows = computed<TimelineRow[]>(() => {
  const b = bounds.value;
  if (!b) return [];

  const span = b.max - b.min;

  return artistStore.bandMembers
    .map((member) => {
      const rawStart = toYear(member.begin);
      const start = rawStart ?? b.min;
      const end = toYear(member.end) ?? (member.ended ? start : currentYear);

      const left = ((start - b.min) / span) * 100;
      const width = Math.max(((end - start) / span) * 100, MIN_BAR_WIDTH);

      const period = `${member.begin ?? "?"} – ${member.end ?? (member.ended ? "?" : "present")}`;
      const instruments
        = member.instruments.length > 0 ? ` (${member.instruments.join(", ")})` : "";

      return {
        color: roleFor(member.instruments).color,
        dated: rawStart !== null,
        ended: member.ended,
        id: member.id,
        left,
        name: member.name,
        start,
        tooltip: rawStart !== null ? `${period}${instruments}` : `Dates unknown${instruments}`,
        width,
      };
    })
    .sort((a, b2) => a.start - b2.start);
});

const usedRoles = computed<Role[]>(() => {
  const colors = new Set(rows.value.map((row) => row.color));
  return [...ROLES, OTHER_ROLE].filter((role) => colors.has(role.color));
});

const ticks = computed<AxisTick[]>(() => {
  const b = bounds.value;
  if (!b) return [];

  const span = b.max - b.min;
  // Pick a readable step: ~6 ticks across the span
  const rawStep = span / 6;
  const niceSteps = [1, 2, 5, 10, 20, 25, 50];
  const step = niceSteps.find((s) => s >= rawStep) ?? 50;

  const result: AxisTick[] = [];
  const first = Math.ceil(b.min / step) * step;
  for (let year = first; year <= b.max; year += step) {
    result.push({ left: ((year - b.min) / span) * 100, year });
  }
  return result;
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.member-timeline {
  margin-bottom: 2.5rem;
}

.timeline-title {
  @include font-bold;

  border-bottom: 1px solid var(--bg-color-light);
  color: var(--font-color-default);
  font-size: var(--font-size-xl);
  margin-bottom: 1rem;
  padding-bottom: 0.4rem;
}

.timeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin-bottom: 1.2rem;
}

.legend-item {
  align-items: center;
  color: var(--font-color-light);
  display: inline-flex;
  font-size: var(--font-size-xs);
  gap: 0.4rem;
}

.legend-swatch {
  border-radius: 0.2rem;
  display: inline-block;
  height: 0.7rem;
  width: 0.7rem;
}

.timeline-grid {
  align-items: center;
  display: grid;
  gap: 0.4rem 1rem;
  grid-template-columns: minmax(7rem, max-content) 1fr;
}

.axis-spacer {
  height: 1px;
}

.axis {
  height: 1.2rem;
  position: relative;
}

.axis-tick {
  color: var(--font-color-light);
  font-size: var(--font-size-xs);
  opacity: 0.6;
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
}

.member-name {
  color: var(--font-color-light);
  font-size: var(--font-size-sm);
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.is-active {
    @include font-bold;

    color: var(--font-color-default);

    &::after {
      background-color: #2ecc71;
      border-radius: 50%;
      box-shadow: 0 0 5px rgb(46 204 113 / 80%);
      content: "";
      display: inline-block;
      height: 7px;
      margin-left: 0.4rem;
      vertical-align: middle;
      width: 7px;
    }
  }
}

.member-track {
  height: 1.1rem;
  position: relative;
}

.grid-line {
  background-color: var(--bg-color-light);
  bottom: 0;
  opacity: 0.4;
  position: absolute;
  top: 0;
  width: 1px;
}

.member-bar-wrapper {
  display: block;
  height: 0.7rem;
  min-width: 0.7rem;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.member-bar {
  border-radius: 0.55rem;
  display: block;
  height: 100%;
  opacity: 0.65;
  transition:
    filter 0.2s ease,
    opacity 0.2s ease;
  width: 100%;

  &:hover {
    filter: brightness(1.2);
    opacity: 1;
  }

  &.is-active {
    opacity: 1;
  }

  &.is-undated {
    background-image: repeating-linear-gradient(
      45deg,
      rgb(255 255 255 / 25%) 0,
      rgb(255 255 255 / 25%) 2px,
      transparent 2px,
      transparent 5px
    );
    opacity: 0.4;
  }
}

.timeline-source {
  color: var(--font-color-light);
  font-size: var(--font-size-xs);
  margin-top: 1rem;
  opacity: 0.5;
}
</style>
