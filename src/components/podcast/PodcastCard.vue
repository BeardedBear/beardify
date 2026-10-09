<template>
  <router-link :to="`/podcasts/${id}`" class="podcast">
    <div class="cover-wrap">
      <Cover :images="covers" class="cover" size="medium" />
      <Transition name="bd-pop">
        <BdBadge v-if="hasNewEpisode" class="new-badge" variant="primary">New</BdBadge>
      </Transition>
      <BdButton
        v-if="resumableEpisode"
        class="resume"
        size="small"
        variant="primary"
        @click.prevent.stop="resume()"
      >
        <Play :size="14" />
        Resume
      </BdButton>
    </div>
    <div v-if="name" class="name bd-font-bold">
      {{ name }}
    </div>
    <div v-if="publisher || episodes" class="metas">
      <span v-if="publisher">{{ publisher }}</span>
      <span v-if="publisher && episodes">&nbsp;·&nbsp;</span>
      <span v-if="episodes">{{ episodes }} episodes</span>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import { Play } from "@lucide/vue";
import { BdBadge, BdButton } from "bearded-ui";
import { RouterLink } from "vue-router";

import { Image } from "@/@types/Image";
import { Episode } from "@/@types/Podcast";
import Cover from "@/components/ui/AlbumCover.vue";
import { playSong } from "@/helpers/play";

const props = defineProps<{
  covers: Image[];
  episodes?: number;
  hasNewEpisode?: boolean;
  id: string;
  name?: string;
  publisher?: string;
  resumableEpisode?: Episode | null;
}>();

function resume(): void {
  if (!props.resumableEpisode) return;
  playSong(props.resumableEpisode.uri, props.resumableEpisode.resume_point?.resume_position_ms ?? 0);
}
</script>

<style scoped>

.podcast {
  background-color: var(--bd-bg);
  border-radius: var(--bd-radius-lg);
  color: var(--bd-font-color);
  padding: var(--bd-space-4);
  text-decoration: none;
  transition:
    background-color var(--bd-transition),
    transform var(--bd-transition);
  will-change: transform;

  &:hover {
    transform: scale(1.03);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: background-color var(--bd-transition);

    &:hover {
      transform: none;
    }
  }
}

.cover-wrap {
  position: relative;
}

.cover {
  aspect-ratio: 1;
  border-radius: var(--bd-radius-md);
  display: block;
  width: 100%;
}

.new-badge {
  left: var(--bd-space-2);
  position: absolute;
  top: var(--bd-space-2);

  /* The badge is the only arrival worth marking here: it appears once, after
     the freshness check resolves, and unlike .resume it isn't hidden behind
     hover the rest of the time. */
  @media (prefers-reduced-motion: reduce) {
    &.bd-pop-enter-active,
    &.bd-pop-leave-active {
      transition: opacity var(--bd-duration) ease;
    }

    &.bd-pop-enter-from,
    &.bd-pop-leave-to {
      transform: none;
    }
  }
}

.resume {
  bottom: var(--bd-space-2);
  left: var(--bd-space-2);
  opacity: 0;
  position: absolute;
  right: var(--bd-space-2);
  transition: opacity var(--bd-transition);

  .podcast:hover &,
  .podcast:focus-within & {
    opacity: 1;
  }

  @media (--mobile) {
    opacity: 1;
  }
}

.name {
  margin-top: var(--bd-space-4);
}

.metas {
  color: var(--bd-font-color-dark);
  font-size: var(--bd-font-size-xs);
  margin-top: var(--bd-space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
