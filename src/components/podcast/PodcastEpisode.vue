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
          <ButtonIndex
            :variant="
              !episode.resume_point?.fully_played && (episode.resume_point?.resume_position_ms || 0) > 0
                ? 'primary'
                : 'default'
            "
            :size="
              !episode.resume_point?.fully_played && (episode.resume_point?.resume_position_ms || 0) > 0
                ? 'default'
                : 'small'
            "
            @click="
              !episode.resume_point?.fully_played && (episode.resume_point?.resume_position_ms || 0) > 0
                ? playSong(episode.uri)
                : playSong(episode.uri, 0)
            "
          >
            {{
              !episode.resume_point?.fully_played && (episode.resume_point?.resume_position_ms || 0) > 0
                ? "Resume"
                : "Play episode"
            }}
          </ButtonIndex>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Episode } from "@/@types/Podcast";
import { usePlayer } from "@/components/player/PlayerStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import Loading from "@/components/ui/LoadingDots.vue";
import { date, timecodeWithUnits } from "@/helpers/date";
import { playSong } from "@/helpers/play";

const playerStore = usePlayer();

defineProps<{
  episode: Episode;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/mixins" as *;

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
    font-size: var(--font-size-md);

    @include font-bold;

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
  @include font-italic;

  margin-top: 0.5rem;
  opacity: 0.3;
}

.name {
  font-size: var(--font-size-lg);

  @include font-bold;
}

.content {
  flex: 1;
}
</style>
