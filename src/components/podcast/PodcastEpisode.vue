<template>
  <div class="episode-wrap">
    <div v-if="episode.resume_point?.fully_played" class="played">
      <i class="icon icon-check" />
    </div>
    <div class="episode">
      <Cover :images="episode.images" class="cover" size="medium" />
      <div class="content">
        <div class="name bd-font-bold">
          {{ episode.name }}
        </div>
        <div v-if="episode.description" class="description bd-font-italic">
          {{ episode.description }}
        </div>
      </div>
    </div>
    <div
      v-if="!episode.resume_point?.fully_played && (episode.resume_point?.resume_position_ms || 0) > 0"
      class="progress"
    >
      <div
        v-if="playerStore.currentFromSDK?.id === episode.id && playerStore.currentlyPlaying.is_playing"
        :style="{
          width: `${(playerStore.currentlyPlaying.progress_ms / episode.duration_ms) * 100}%`,
        }"
        class="bar"
      />
      <div
        v-else
        :style="{
          width: `${((episode.resume_point?.resume_position_ms || 0) / episode.duration_ms) * 100}%`,
        }"
        class="bar"
      />
    </div>
    <div class="infos">
      <div class="metas bd-font-bold">
        <div>{{ date(episode.release_date) }}</div>
        /
        <div>{{ timecodeWithUnits(episode.duration_ms) }}</div>
      </div>
      <div class="actions">
        <BdLoader
          v-if="playerStore.currentFromSDK?.id === episode.id && playerStore.currentlyPlaying.is_playing"
          :size="'small'"
        />
        <div v-else>
          <BdButton
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
          </BdButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdLoader } from "bearded-ui";

import { Episode } from "@/@types/Podcast";
import { usePlayer } from "@/components/player/PlayerStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { date, timecodeWithUnits } from "@/helpers/date";
import { playSong } from "@/helpers/play";

const playerStore = usePlayer();

defineProps<{
  episode: Episode;
}>();
</script>

<style scoped>

.progress {
  background-color: var(--bd-bg-dark);
  border-radius: var(--bd-radius-lg);
  height: 0.2rem;
  margin: 0 var(--bd-space-4);
  position: relative;

  .bar {
    background-color: var(--bd-primary);
    border-radius: var(--bd-radius-lg);
    bottom: 0;
    left: 0;
    position: absolute;
    top: 0;
  }
}

.episode {
  align-items: center;
  display: flex;
  gap: var(--bd-space-4);
  padding: var(--bd-space-4);
}

.actions {
  align-items: center;
  display: flex;
  gap: var(--bd-space-4);
}

.infos {
  align-items: center;
  border-radius: 0 0 var(--bd-radius-lg) var(--bd-radius-lg);
  display: flex;
  justify-content: space-between;
  padding: var(--bd-space-3) var(--bd-space-4);

  .metas {
    color: var(--bd-font-color-dark);
    display: flex;
    font-size: var(--bd-font-size-sm);
    gap: var(--bd-space-2);
  }
}

.episode-wrap {
  background-color: var(--bd-bg);
  border-radius: var(--bd-radius-lg);
  color: var(--bd-font-color);
  margin-bottom: var(--bd-space-4);
  position: relative;
  text-decoration: none;
  transition: background-color var(--bd-transition);
  will-change: transform;
}

.played {
  --played-size: 3rem;

  background-color: var(--bd-primary);
  border-radius: 0 var(--bd-radius-lg) 0 0;
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  content: "";
  height: var(--played-size);
  position: absolute;
  right: 0;
  top: 0;
  width: var(--played-size);

  .icon {
    color: var(--bd-on-primary);
    position: absolute;
    right: 0.4rem;
    top: 0.4rem;
  }
}

.cover {
  border-radius: var(--bd-radius-md);
  height: 5rem;
}

/*
 * Coupé par la mise en page, plus par `slice(0, 200)` : la troncature JS
 * ajoutait « ... » même à une description de trois mots, et coupait au même
 * caractère quelle que soit la largeur disponible.
 */
.description {
  -webkit-box-orient: vertical;
  color: var(--bd-font-color-dark);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  margin-top: var(--bd-space-2);
  overflow: hidden;
}

.name {
  font-size: var(--bd-font-size-base);
}

.content {
  flex: 1;
}
</style>
