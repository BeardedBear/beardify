<template>
  <div v-if="artistStore.wikiTimeline && rows.length > 0" class="wiki-timeline">
    <h2 class="timeline-title">Members timeline</h2>

    <div class="timeline-legend">
      <span v-for="role in legend" :key="role.legend" class="legend-item">
        <span class="legend-swatch" :style="{ backgroundColor: role.color }" />
        {{ role.legend }}
      </span>
    </div>

    <div class="timeline-grid">
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

      <template v-for="row in rows" :key="row.id">
        <div class="member-name" :class="{ 'is-active': row.active }">
          <MemberPopover :name="row.name">{{ row.name }}</MemberPopover>
        </div>
        <div class="member-track" :class="{ 'is-inactive': !row.active }">
          <Tooltip
            v-for="event in events"
            :key="`${row.id}-${event.left}`"
            class="event-line-wrapper"
            :style="{ left: `${event.left}%` }"
            :text="event.title"
          >
            <span class="event-line" :style="{ backgroundColor: event.color }" />
          </Tooltip>
          <Tooltip
            v-for="(seg, index) in row.segments"
            :key="index"
            class="segment-wrapper"
            follow-cursor
            :style="{
              height: seg.height,
              left: `${seg.left}%`,
              width: `${seg.width}%`,
              zIndex: seg.z,
            }"
            :text="seg.title"
          >
            <span class="segment" :style="{ backgroundColor: seg.color }" />
          </Tooltip>
        </div>
      </template>
    </div>

    <p class="timeline-source">Source: Wikipedia</p>
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

interface Segment {
  color: string;
  height: string;
  left: number;
  title: string;
  width: number;
  z: number;
}

interface TimelineRow {
  active: boolean;
  id: string;
  name: string;
  segments: Segment[];
}

const MIN_SEG_WIDTH = 0.4;

const artistStore = useArtist();

function yearLabel(value: number, till: number, openEnded: boolean): string {
  return openEnded || value >= till - 0.3 ? "present" : `${Math.floor(value)}`;
}

const rows = computed<TimelineRow[]>(() => {
  const tl = artistStore.wikiTimeline;
  if (!tl) return [];

  const span = tl.till - tl.from || 1;

  const segsByBar = new Map<string, typeof tl.segments>();
  for (const seg of tl.segments) {
    const bucket = segsByBar.get(seg.barId);
    if (bucket) bucket.push(seg);
    else segsByBar.set(seg.barId, [seg]);
  }

  return tl.bars
    .map((bar) => {
      const barSegs = segsByBar.get(bar.id) ?? [];
      // Wide (main) segments first, thin overlays painted on top
      const segments = barSegs
        .sort((a, b) => Number(a.thin) - Number(b.thin))
        .map((seg, index) => {
          const role = tl.colors[seg.colorId];
          const label = role?.legend ?? seg.colorId;
          return {
            color: role?.color ?? "#8a8a8a",
            height: seg.thin ? "0.28rem" : "0.7rem",
            left: ((seg.from - tl.from) / span) * 100,
            title: `${label} · ${Math.floor(seg.from)}–${yearLabel(seg.till, tl.till, seg.openEnded)}`,
            width: Math.max(((seg.till - seg.from) / span) * 100, MIN_SEG_WIDTH),
            z: seg.thin ? 2 + index : 1,
          };
        });

      return {
        active: barSegs.some((seg) => seg.openEnded),
        id: bar.id,
        name: bar.name,
        segments,
      };
    })
    .filter((row) => row.segments.length > 0);
});

const legend = computed(() => {
  const tl = artistStore.wikiTimeline;
  if (!tl) return [];
  const used = new Set([
    ...tl.segments.map((seg) => seg.colorId),
    ...tl.events.map((event) => event.colorId),
  ]);
  return Object.entries(tl.colors)
    .filter(([id]) => used.has(id))
    .map(([, role]) => role);
});

const events = computed(() => {
  const tl = artistStore.wikiTimeline;
  if (!tl) return [];
  const span = tl.till - tl.from || 1;
  return tl.events.map((event) => ({
    color: tl.colors[event.colorId]?.color ?? "#555",
    left: ((event.date - tl.from) / span) * 100,
    title: `${tl.colors[event.colorId]?.legend ?? "Release"} (${Math.floor(event.date)})`,
  }));
});

const ticks = computed<AxisTick[]>(() => {
  const tl = artistStore.wikiTimeline;
  if (!tl) return [];

  const span = tl.till - tl.from || 1;
  const rawStep = span / 6;
  const niceSteps = [1, 2, 5, 10, 20, 25, 50];
  const step = niceSteps.find((s) => s >= rawStep) ?? 50;

  const result: AxisTick[] = [];
  const first = Math.ceil(tl.from / step) * step;
  for (let year = first; year <= tl.till; year += step) {
    result.push({ left: ((year - tl.from) / span) * 100, year });
  }
  return result;
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

.wiki-timeline {
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
  gap: 0.35rem 1rem;
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
  opacity: 0.5;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.is-active {
    opacity: 1;

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
  height: 1rem;
  position: relative;
}

.event-line-wrapper {
  bottom: 0;
  display: block;
  position: absolute;
  top: 0;
  width: 1px;
}

.event-line {
  display: block;
  height: 100%;
  opacity: 0.25;
  width: 100%;
}

.segment-wrapper {
  display: block;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.segment {
  border-radius: 0.2rem;
  display: block;
  height: 100%;
  opacity: 0.7;
  transition:
    filter 0.2s ease,
    opacity 0.2s ease;
  width: 100%;

  &:hover {
    filter: brightness(1.25);
    opacity: 1;
  }
}

.member-track.is-inactive .segment {
  opacity: 0.35;

  &:hover {
    opacity: 0.7;
  }
}

.timeline-source {
  color: var(--font-color-light);
  font-size: var(--font-size-xs);
  margin-top: 1rem;
  opacity: 0.5;
}
</style>
