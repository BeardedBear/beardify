<template>
  <div class="wrap">
    <div class="content">
      <div class="head">
        <button class="heading" :class="{ active: activeTab === 'queue' }" @click="activeTab = 'queue'">Queue</button>
        <button class="heading" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
          History
        </button>
      </div>
      <div class="tab-content">
        <div v-if="activeTab === 'queue'" class="queue-list">
          <div class="wrap-current">
            <div v-if="currentTrack" class="track current">
              <img :src="currentTrack.album.images[0].url" class="cover" />
              <div>
                <div>
                  {{ currentTrack.name.length }}
                  {{ currentTrack.name.length > 20 ? currentTrack.name.substring(0, 20) + "..." : currentTrack.name }}
                </div>
                <ArtistList :artist-list="currentTrack.artists" feat />
              </div>
            </div>
          </div>
          <div v-for="(track, key) in playerStore.queue" :key="key" class="track">
            <img :src="track.album.images[2].url" class="cover" />
            <div>
              <div>
                {{ key + 1 }}.
                {{ track.name.length > 20 ? track.name.substring(0, 20) + "..." : track.name }}
              </div>
              <div><ArtistList :artist-list="track.artists" feat /></div>
            </div>
          </div>
        </div>
        <div v-else>history</div>
      </div>
    </div>
    <button @click="playerStore.getQueue()">Queue</button>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import ArtistList from "../../artist/ArtistList.vue";
import { usePlayer } from "../PlayerStore";

const playerStore = usePlayer();
const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);
const activeTab = ref<"queue" | "history">("queue");

watch(currentTrack, (track) => {
  if (track) {
    playerStore.getQueue();
  }
});
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  flex-direction: column;
  position: relative;
}

.tab-content {
  background-color: var(--bg-color-dark);
  border: 1px solid var(--bg-color-lighter);
  border-radius: 0 0 10px 10px;
  box-shadow: 0 0 10px 0 rgb(0 0 0 / 20%);
  height: 300px;
  overflow: auto;
  width: 250px;
}

.content {
  bottom: 100%;
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
    background-color: transparent;
    border: none;
    color: var(--text-color-dark);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    padding: 5px 10px;

    &.active {
      color: var(--text-color);
    }
  }
}

.queue-list {
  font-size: 0.9rem;
  white-space: nowrap;
}

.wrap-current {
  background-image: linear-gradient(to bottom, var(--bg-color-dark), var(--bg-color-darker), rgb(0 0 0 / 0%));
  padding: 10px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.track {
  align-items: center;
  display: flex;
  gap: 10px;
  padding: 10px 15px;

  &.current {
    $o: 10px;

    background-color: var(--bg-color);
    border: 1px solid var(--bg-color-light);
    border-radius: 5px;
    padding: 10px;
  }

  .cover {
    border-radius: 5px;
    height: 40px;
    width: 40px;
  }
}
</style>
