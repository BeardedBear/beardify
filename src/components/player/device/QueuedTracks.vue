<template>
  <div class="wrap">
    <div v-if="playerStore.queueOpened" ref="popup" class="content">
      <div class="head"><div class="heading">Queue</div></div>
      <div class="body">
        <div class="queue-list">
          <div class="section-title">Now</div>
          <TrackHistory v-if="currentTrack" :track="currentTrack" :cover-url="currentTrack.album.images[1].url" />
          <div class="section-title">Next</div>
          <div v-for="(track, key) in playerStore.queue" :key="key">
            <TrackHistory :track="track" :index="key" :cover-url="track.album.images[2].url" />
          </div>
        </div>
      </div>
    </div>
    <button class="button button--small" @click="playerStore.openQueue()"><i class="icon-queue"></i></button>
  </div>
</template>

<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { usePlayer } from "../PlayerStore";
import TrackHistory from "../history/TrackHistory.vue";

const playerStore = usePlayer();
const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);
const popup = ref<HTMLElement | null>();

watch(currentTrack, (track) => {
  if (track) {
    playerStore.getQueue();
  }
});

onClickOutside(popup, () => playerStore.closeQueue());
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  flex-direction: column;
  position: relative;
  text-align: left;
}

.body {
  background-color: var(--bg-color-dark);
  border: 1px solid var(--bg-color-lighter);
  border-radius: 0 0 10px 10px;
  box-shadow: 0 0 10px 0 rgb(0 0 0 / 20%);
  height: 300px;
  overflow: auto;
  width: 250px;
}

.content {
  bottom: calc(100% + 10px);
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  z-index: 20;
}

.head {
  background-color: var(--bg-color-lighter);
  border-radius: 10px 10px 0 0;
  line-height: 1;
  padding: 10px;
  position: relative;
  z-index: 3;

  .heading {
    color: var(--text-color-dark);
    font-size: 0.9rem;
    padding: 3px 10px;
  }
}

.section-title {
  font-size: 0.8rem;
  font-weight: bold;
  margin-top: 10px;
  opacity: 0.5;
  padding: 0 10px;
  text-transform: uppercase;
}

.queue-list {
  font-size: 0.9rem;
  white-space: nowrap;
}
</style>
