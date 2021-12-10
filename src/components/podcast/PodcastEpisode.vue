<template>
  <div :to="`/podcasts/${episode.id}`" class="episode-wrap">
    <div class="episode">
      <img class="cover" :src="episode.images[1].url" />
      <div class="content">
        <div class="name">{{ episode.name }}</div>
        <div v-if="episode.description" class="description">{{ `${episode.description.slice(0, 200)}...` }}</div>
      </div>
    </div>
    <div class="infos">
      <div class="metas">
        <div>{{ timecodeWithUnits(episode.duration_ms) }}</div>
        /
        <div>{{ date(episode.release_date) }}</div>
      </div>
      <div>
        <button class="button button--small button--primary" @click="playSong(episode.uri)">Ecouter l'épisode</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { Episode } from "../../@types/Podcast";
import { timecodeWithUnits, date } from "../../helpers/date";
import { playSong } from "../../helpers/play";

defineProps<{
  episode: Episode;
}>();
</script>

<style lang="scss" scoped>
.episode {
  align-items: center;
  display: flex;
  gap: 1rem;
  padding: 1rem;
}

.infos {
  align-items: center;
  background-color: var(--bg-color-light);
  border-radius: 0 0 1rem 1rem;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 0.7rem 1rem;

  .metas {
    display: flex;
    gap: 1rem;
    opacity: 0.5;
  }
}

.episode-wrap {
  background-color: var(--bg-color);
  border-radius: 1rem;
  color: var(--font-color);
  margin-bottom: 1rem;
  text-decoration: none;
  transition: 0.2s;
  will-change: transform;
}

.cover {
  border-radius: 0.5rem;
  height: 6rem;
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
