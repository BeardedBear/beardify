<template>
  <BdDropdown v-model="queueOpen" class="wrap" placement="top-end" size="small">
    <template #trigger>
      <BdTooltip bare content="Queue">
        <BdButton icon-only label="Queue">
          <i aria-hidden="true" class="icon-queue" />
        </BdButton>
      </BdTooltip>
    </template>

    <div class="queue-panel">
      <BdButtonGroup v-model="tab" class="tabs" full :options="tabs" size="small" />

      <div class="track-list">
        <template v-if="tab === 'queue'">
          <div class="section-title bd-font-bold">Now</div>
          <TrackHistory
            v-if="currentTrack"
            :cover-url="coverUrl(currentTrack.album.images, 'medium')"
            :track="currentTrack"
          />
          <div class="section-title bd-font-bold">Next</div>
          <div v-for="(track, key) in playerStore.queue" :key="key">
            <TrackHistory :cover-url="coverUrl(track.album.images, 'small')" :index="key" :track="track" />
          </div>
          <div v-if="playerStore.queue.length === 0" class="empty-queue">
            <div class="empty-message bd-font-italic">
              {{ isPlayingPodcast ? "Queue not available for podcast episodes" : "No tracks in queue" }}
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="(track, key) in playerStore.history" :key="key">
            <TrackHistory
              clickable
              :cover-url="coverUrl(track.album.images, 'small')"
              :index="key"
              :track="track"
              @click="replay(track)"
            />
          </div>
          <div v-if="playerStore.history.length === 0" class="empty-queue">
            <div class="empty-message bd-font-italic">No recently played tracks</div>
          </div>
        </template>
      </div>
    </div>
  </BdDropdown>
</template>

<script lang="ts" setup>
import { BdButton, BdButtonGroup, BdDropdown, BdTooltip } from "bearded-ui";
import { computed, ref, watch } from "vue";

import TrackHistory from "@/components/player/history/TrackHistory.vue";
import { usePlayer } from "@/components/player/PlayerStore";
import { coverUrl } from "@/helpers/cover";
import { playSong } from "@/helpers/play";

const playerStore = usePlayer();
const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);
const isPlayingPodcast = computed(() => {
  const track = currentTrack.value;
  return track?.type === "episode" || track?.uri?.includes("spotify:episode:");
});
/*
 * Local, not in the store: this component is mounted twice (player bar and
 * slide-up panel). Sharing the open flag made both dropdowns call showPopover()
 * at once, and opening the second `popover="auto"` closed the first one — the
 * visible panel flashed shut instantly.
 */
const queueOpen = ref(false);
const tab = ref<"history" | "queue">("queue");
const tabs = [
  { label: "Queue", value: "queue" as const },
  { label: "History", value: "history" as const },
];

// Refresh the visible tab only — a closed instance, or a hidden tab, has nothing to show.
function refresh(): void {
  if (!queueOpen.value) return;
  if (tab.value === "queue") playerStore.openQueue();
  else playerStore.getHistory();
}

function replay(track: Spotify.Track): void {
  playSong(track.uri);
  queueOpen.value = false;
}

watch([queueOpen, tab, currentTrack], refresh);
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

.queue-panel {
  font-size: var(--bd-font-size-sm);
  white-space: nowrap;
  width: 250px;
}

.tabs {
  padding: var(--bd-space-2) var(--bd-space-2) 0;
}

.track-list {
  height: 300px;
  overflow: auto;
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
