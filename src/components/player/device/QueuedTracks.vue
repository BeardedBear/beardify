<template>
  <BdDropdown v-model="queueOpen" class="wrap" placement="top-end" size="small">
    <template #trigger>
      <BdTooltip bare content="Queue">
        <BdButton icon-only label="Queue">
          <i aria-hidden="true" class="icon-queue" />
        </BdButton>
      </BdTooltip>
    </template>

    <div ref="scroller" class="timeline">
      <div class="rail">
        <div v-if="past.length" class="section-title bd-font-bold">Played</div>
        <div v-for="(track, key) in past" :key="`past-${track.uri}`" class="node past">
          <TrackHistory
            clickable
            :cover-url="coverUrl(track.album.images, 'small')"
            :track="track"
            @click="replay(key)"
          />
        </div>

        <div v-if="currentTrack" ref="currentNode" class="node now">
          <TrackHistory current :cover-url="coverUrl(currentTrack.album.images, 'medium')" :track="currentTrack" />
        </div>

        <div v-if="playerStore.queue.length" class="section-title bd-font-bold">Up next</div>
        <div v-for="(track, key) in playerStore.queue" :key="`next-${key}`" class="node">
          <TrackHistory
            clickable
            :cover-url="coverUrl(track.album.images, 'small')"
            :index="key"
            :track="track"
            @click="skipTo(key)"
          />
        </div>

        <div v-if="playerStore.queue.length === 0" class="empty-queue">
          <div class="empty-message bd-font-italic">
            {{ isPlayingPodcast ? "Queue not available for podcast episodes" : "No tracks in queue" }}
          </div>
        </div>
      </div>
    </div>
  </BdDropdown>
</template>

<script lang="ts" setup>
import { BdButton, BdDropdown, BdTooltip } from "bearded-ui";
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";

import TrackHistory from "@/components/player/history/TrackHistory.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import { coverUrl } from "@/helpers/cover";
import { playSongs } from "@/helpers/play";

const playerStore = usePlayer();
const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);
const isPlayingPodcast = computed(() => {
  const track = currentTrack.value;
  return track?.type === "episode" || track?.uri?.includes("spotify:episode:");
});
/*
 * Recently-played comes back most-recent-first; the timeline reads top to
 * bottom, so the oldest track has to end up at the top.
 */
const past = computed(() => [...playerStore.history].reverse());
/*
 * Local, not in the store: this component is mounted twice (player bar and
 * slide-up panel). Sharing the open flag made both dropdowns call showPopover()
 * at once, and opening the second `popover="auto"` closed the first one — the
 * visible panel flashed shut instantly.
 */
const queueOpen = ref(false);
const scroller = useTemplateRef<HTMLElement>("scroller");
const currentNode = useTemplateRef<HTMLElement>("currentNode");

/*
 * The current track sits between the two lists, so the panel opens scrolled to
 * the middle. scrollTop rather than scrollIntoView: the latter also scrolls
 * every ancestor, dragging the page behind the popover.
 */
async function centerOnCurrent(): Promise<void> {
  await nextTick();
  const list = scroller.value;
  const node = currentNode.value;
  if (!list || !node) return;
  list.scrollTop = node.offsetTop - (list.clientHeight - node.clientHeight) / 2;
}

// Refresh only while the panel is open — a closed instance has nothing to show.
function refresh(): void {
  if (!queueOpen.value) return;
  playerStore.openQueue();
  playerStore.getHistory();
}

/*
 * Rewinding to a past track replays the timeline from there: the rest of the
 * history, the current track, then the queue. Sending the single uri instead
 * would leave playback with a one-track queue.
 */
function replay(index: number): void {
  const current = currentTrack.value;
  const rewound = past.value.slice(index).filter((track) => track.uri !== current?.uri);
  playSongs(0, [...rewound, ...(current ? [current] : []), ...playerStore.queue]);
  queueOpen.value = false;
}

/*
 * No Spotify endpoint jumps to an arbitrary queue index, so the tail of the
 * queue is replayed as its own uri list: playback still runs through the
 * tracks shown below the clicked one.
 */
function skipTo(index: number): void {
  playSongs(index, playerStore.queue);
  queueOpen.value = false;
}

watch(queueOpen, (open) => {
  if (!open) return;
  refresh();
  centerOnCurrent();
});

watch(currentTrack, refresh);
watch(past, centerOnCurrent);
</script>

<style scoped>

.wrap {
  @media (--mobile) {
    display: none;
  }
}

.section-title {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  margin-top: var(--bd-space-2);
  padding: 0 var(--bd-space-2);
  text-transform: uppercase;
}

.timeline {
  --rail-x: 0.45rem;

  font-size: var(--bd-font-size-sm);
  height: 300px;
  overflow: auto;
  white-space: nowrap;
  width: 268px;
}

/*
 * Rail drawn once on this wrapper, dots on each row: one line, no per-row
 * segment to keep aligned. It sits inside the scroller rather than on it so it
 * spans the full content height instead of the 300px viewport.
 */
.rail {
  padding-left: 1.2rem;
  position: relative;

  &::before {
    background-image: linear-gradient(
      to bottom,
      rgb(0 0 0 / 0%),
      var(--bd-bg-light) 8%,
      var(--bd-bg-light) 92%,
      rgb(0 0 0 / 0%)
    );
    content: "";
    inset: 0 auto 0 var(--rail-x);
    position: absolute;
    width: 2px;
  }
}

.node {
  position: relative;

  &::before {
    background-color: var(--bd-bg-lighter);
    border-radius: 50%;
    content: "";
    height: 6px;
    left: calc(var(--rail-x) - 3px + 1px);
    position: absolute;
    top: 50%;
    translate: -1.2rem -50%;
    width: 6px;
  }

  &.past::before {
    background-color: var(--bd-bg-light);
  }

  &.now::before {
    background-color: var(--bd-primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--bd-primary-color) 25%, transparent);
    height: 10px;
    left: calc(var(--rail-x) - 5px + 1px);
    width: 10px;
  }
}

.past {
  opacity: 0.55;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
}

.empty-queue {
  padding: var(--bd-space-4) var(--bd-space-2);
  text-align: center;
}

.empty-message {
  color: var(--bd-font-color);
  font-size: var(--bd-font-size-sm);
  opacity: 0.6;
}
</style>
