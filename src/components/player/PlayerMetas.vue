<template>
  <div class="what" v-if="currentTrack">
    <div class="cover-wrap">
      <img :src="currentTrack.album.images[1].url || ''" class="cover" v-if="currentTrack.album.images.length" />
      <div @click="dialogStore.open({ type: 'addSong', track: currentTrack })" class="hover">
        <i class="add icon-plus"></i>
      </div>
    </div>
    <div class="text-content">
      <div class="track-details">
        <template v-if="!isTrackNameLong">
          <span class="trackname">{{ currentTrack.name }}</span>
        </template>
        <template v-else>
          <Tooltip :text="currentTrack.name">
            <span class="trackname">{{ truncatedTrackName }}</span>
          </Tooltip>
        </template>
        <span class="separator">&nbsp;·&nbsp;</span>
        <span class="artists">
          <ArtistList :artist-list="currentTrack.artists" feat />
        </span>
      </div>
      <div class="album">
        <router-link :to="`/album/${transformUriToid(currentTrack.album.uri)}`" class="link">
          {{ currentTrack.album.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

import ArtistList from "@/components/artist/ArtistList.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import Tooltip from "@/components/ui/Tooltip.vue";
import { transformUriToid } from "@/helpers/helper";

const playerStore = usePlayer();
const dialogStore = useDialog();
const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);

// Limit for track name characters before showing tooltip
const TRACKNAME_CHAR_LIMIT = 35;
const isTrackNameLong = computed(() => (currentTrack.value?.name ?? "").length > TRACKNAME_CHAR_LIMIT);
const truncatedTrackName = computed(() => {
  const name = currentTrack.value?.name ?? "";
  return name.length > TRACKNAME_CHAR_LIMIT ? name.slice(0, TRACKNAME_CHAR_LIMIT - 1) + "…" : name;
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

.cover {
  border-radius: 0.3rem;
  display: block;
}

.cover-wrap {
  position: relative;

  .add {
    font-size: var(--font-size-xl);
    transition: 0.2s;
    will-change: transform;

    &:hover {
      transform: scale(1.2);
    }
  }

  .hover {
    align-items: center;
    background-color: color.change(black, $alpha: 0.8);
    border-radius: 0.3rem;
    cursor: pointer;
    display: flex;
    inset: 0;
    justify-content: center;
    opacity: 0;
    position: absolute;
    transition: 0.2s;
  }

  &:hover {
    .hover {
      opacity: 1;
    }
  }
}

.track-details {
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (hover: hover) {
    overflow: visible;
  }

  @include responsive.tablet-down {
    display: flex;
    flex-direction: column;
    white-space: normal;
  }
}

.trackname {
  @include font-bold;

  @include responsive.mobile {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
}

.separator {
  @include responsive.tablet-down {
    display: none;
  }
}

.artists {
  @include responsive.mobile {
    font-size: var(--font-size-sm);
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
}

.artistname {
  @include font-bold;

  color: currentcolor;
  text-decoration: none;
}

.album {
  font-size: var(--font-size-sm);

  @include font-italic;

  .link {
    color: currentcolor;
    cursor: pointer;
    font-size: var(--font-size-sm);

    @include font-italic;

    opacity: 0.5;
    text-decoration: none;

    &:hover {
      color: var(--primary-color);
      opacity: 1;
    }
  }
}

.what {
  align-items: center;
  display: flex;
  flex: 1;
  gap: 1rem;
  min-width: 0;

  @include responsive.mobile {
    pointer-events: none;
  }

  img {
    height: 3rem;

    @include responsive.mobile {
      height: 2.5rem;
    }
  }

  @include responsive.mobile {
    gap: 0.6rem;
  }
}

.text-content {
  min-width: 0;

  @media (hover: hover) {
    overflow: visible;

    > div {
      overflow: visible;
    }
  }

  > div {
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
