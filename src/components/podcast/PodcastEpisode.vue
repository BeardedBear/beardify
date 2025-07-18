<template>
  <div class="episode-wrap">
    <div class="played" v-if="episode.resume_point?.fully_played">
      <i class="icon icon-check"></i>
    </div>
    <div class="episode">
      <img :src="episode.images?.[1]?.url || episode.images?.[0]?.url" class="cover" />
      <div class="content">
        <div class="name">{{ episode.name }}</div>
        <div class="description" v-if="episode.description">
          {{ `${episode.description.slice(0, 200)}...` }}
        </div>
      </div>
    </div>
    <div
      class="progress"
      v-if="!episode.resume_point?.fully_played && (episode.resume_point?.resume_position_ms || 0) > 0"
    >
      <div
        :style="{
          width: `${(playerStore.currentlyPlaying.progress_ms / episode.duration_ms) * 100}%`,
        }"
        class="bar"
        v-if="playerStore.currentFromSDK?.id === episode.id && playerStore.currentlyPlaying.is_playing"
      ></div>
      <div
        :style="{
          width: `${((episode.resume_point?.resume_position_ms || 0) / episode.duration_ms) * 100}%`,
        }"
        class="bar"
        v-else
      ></div>
    </div>
    <div class="infos">
      <div class="metas">
        <div>{{ date(episode.release_date) }}</div>
        /
        <div>{{ timecodeWithUnits(episode.duration_ms) }}</div>
      </div>
      <div class="actions">
        <Loading
          :size="'small'"
          v-if="playerStore.currentFromSDK?.id === episode.id && playerStore.currentlyPlaying.is_playing"
        />
        <div v-else>
          <button
            @click="playSong(episode.uri)"
            class="button button--small button--primary"
            v-if="!episode.resume_point?.fully_played && (episode.resume_point?.resume_position_ms || 0) > 0"
          >
            Resume
          </button>
          <button @click="playSong(episode.uri, 0)" class="button button--small" v-else>Play episode</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Episode } from "../../@types/Podcast";
import { date, timecodeWithUnits } from "../../helpers/date";
import { playSong } from "../../helpers/play";
import Loading from "../LoadingDots.vue";
import { usePlayer } from "../player/PlayerStore";

const playerStore = usePlayer();

defineProps<{
  episode: Episode;
}>();
</script>

<style lang="scss" scoped>
.progress {
  background-color: var(--bg-color-dark);
  border-radius: 1rem;
  height: 0.2rem;
  margin: 0 1rem;
  position: relative;

  .bar {
    background-color: var(--primary-color);
    border-radius: 1rem;
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
  }
}

.episode {
  align-items: center;
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

.actions {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.infos {
  align-items: center;
  border-radius: 0 0 1rem 1rem;
  display: flex;
  justify-content: space-between;
  padding: 0.7rem 1rem;

  .metas {
    display: flex;
    font-size: 0.9rem;
    font-weight: bold;
    gap: 0.5rem;
    opacity: 0.5;
  }
}

.episode-wrap {
  background-color: var(--bg-color);
  border-radius: 1rem;
  color: var(--font-color);
  margin-bottom: 1rem;
  position: relative;
  text-decoration: none;
  transition: 0.2s;
  will-change: transform;
}

.played {
  $size: 3rem;

  background-color: var(--primary-color);
  border-radius: 0 1rem 0 0;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  content: "";
  height: $size;
  position: absolute;
  right: 0;
  top: 0;
  width: $size;

  .icon {
    color: #fff;
    position: absolute;
    right: 0.4rem;
    top: 0.4rem;
  }
}

.cover {
  border-radius: 0.5rem;
  height: 5rem;
}

.description {
  font-style: italic;
  margin-top: 0.5rem;
  opacity: 0.3;
}

.name {
  font-size: 1.1rem;
  font-weight: bold;
}

.content {
  flex: 1;
}
</style>
