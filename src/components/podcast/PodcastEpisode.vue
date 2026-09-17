<template>
  <div :class="{ active: isCurrentEpisode }" class="episode-wrap">
    <div v-if="episode.resume_point?.fully_played" class="played">
      <i aria-hidden="true" class="icon icon-check" />
      <span class="bd-sr-only">Fully played</span>
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
      v-if="isResumable || isCurrentEpisode"
      :aria-valuenow="Math.round(progressPercent)"
      :aria-valuetext="`${timecodeWithUnits(remainingMs)} left`"
      aria-valuemax="100"
      aria-valuemin="0"
      class="progress"
      role="progressbar"
    >
      <div :style="{ width: `${progressPercent}%` }" class="bar" />
    </div>
    <div class="infos">
      <div class="metas bd-font-italic">
        <div>{{ date(episode.release_date) }}</div>
        /
        <div>{{ timecodeWithUnits(episode.duration_ms) }}</div>
      </div>
      <div class="actions">
        <!--
          The current episode used to render a BdLoader here instead of a
          button: a permanent spinner claiming "loading" over something that
          is playing, and the one row in the app you could not pause. The
          `paused` test also used to live in the match itself, so pausing made
          the episode indistinguishable again in a list of fifty.
        -->
        <BdButton
          v-if="isCurrentEpisode"
          active
          size="small"
          variant="primary"
          @click="isPaused ? playerStore.play() : playerStore.pause()"
        >
          {{ isPaused ? "Resume" : "Pause" }}
        </BdButton>
        <BdButton v-else size="small" @click="playSong(episode.uri)">
          {{ isResumable ? "Resume" : "Play episode" }}
        </BdButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton } from "bearded-ui";
import { computed } from "vue";

import { Episode } from "@/@types/Podcast";
import { usePlayer } from "@/components/player/PlayerStore";
import Cover from "@/components/ui/AlbumCover.vue";
import { date, timecodeWithUnits } from "@/helpers/date";
import { playSong } from "@/helpers/play";

const playerStore = usePlayer();

const props = defineProps<{
  episode: Episode;
}>();

const isCurrentEpisode = computed(
  () => playerStore.playerState?.track_window?.current_track?.id === props.episode.id,
);
const isPaused = computed(() => !!playerStore.playerState?.paused);
const isResumable = computed(
  () => !props.episode.resume_point?.fully_played && (props.episode.resume_point?.resume_position_ms ?? 0) > 0,
);
const positionMs = computed(() =>
  isCurrentEpisode.value
    ? (playerStore.playerState?.position ?? 0)
    : (props.episode.resume_point?.resume_position_ms ?? 0),
);
// A zero or missing duration used to reach the template as `width: Infinity%`.
const progressPercent = computed(() => {
  if (!props.episode.duration_ms) return 0;
  return Math.min(100, Math.max(0, (positionMs.value / props.episode.duration_ms) * 100));
});
const remainingMs = computed(() => Math.max(0, props.episode.duration_ms - positionMs.value));
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
  flex-wrap: wrap;
  gap: var(--bd-space-2);
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

  /* The playing row is marked on the card, the way a playing track is. */
  &.active {
    box-shadow: inset 0 0 0 2px var(--bd-primary);
  }
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
  flex-shrink: 0;
  height: 5rem;
  width: 5rem;
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
  min-width: 0;
}
</style>
