<template>
  <div v-if="currentTrack" class="what">
    <div class="cover-wrap">
      <img v-if="currentTrack.album.images.length" :src="currentTrack.album.images[1].url || ''" class="cover" />
      <div class="hover" @click="dialogStore.open({ type: 'addSong', track: currentTrack })">
        <i class="add icon-plus" />
      </div>
    </div>
    <div class="text-content">
      <div class="track-details">
        <template v-if="!isTrackNameLong">
          <span class="trackname font-bold">{{ currentTrack.name }}</span>
        </template>
        <template v-else>
          <BdTooltip :content="currentTrack.name">
            <span class="trackname font-bold">{{ truncatedTrackName }}</span>
          </BdTooltip>
        </template>
        <span class="separator">&nbsp;·&nbsp;</span>
        <span class="artists">
          <ArtistList :artist-list="currentTrack.artists" feat />
        </span>
      </div>
      <div class="album font-italic">
        <router-link :to="`/album/${transformUriToid(currentTrack.album.uri)}`" class="link font-italic">
          {{ currentTrack.album.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdTooltip } from "bearded-ui";
import { computed } from "vue";
import { RouterLink } from "vue-router";

import ArtistList from "@/components/artist/ArtistList.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
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

<style scoped>

.cover {
  border-radius: 0.3rem;
  display: block;
}

.cover-wrap {
  position: relative;

  .add {
    font-size: var(--font-size-xl);
    transition: transform 0.2s ease;
    will-change: transform;

    &:hover {
      transform: scale(1.2);
    }
  }

  .hover {
    align-items: center;
    background-color: rgb(0 0 0 / 80%);
    border-radius: 0.3rem;
    cursor: pointer;
    display: flex;
    inset: 0;
    justify-content: center;
    opacity: 0;
    position: absolute;
    transition: opacity 0.2s ease;
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

  @media (--tablet-down) {
    display: flex;
    flex-direction: column;
    white-space: normal;
  }
}

.trackname {
  @media (--mobile) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
}

.separator {
  @media (--tablet-down) {
    display: none;
  }
}

.artists {
  @media (--mobile) {
    font-size: var(--font-size-sm);
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
}

.artistname {
  color: currentcolor;
  font-variation-settings: var(--font-variation-settings-bold);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
}

.album {
  color: var(--font-color-dark);
  font-size: var(--font-size-sm);

  @media (--mobile) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }

  .link {
    color: currentcolor;
    cursor: pointer;
    font-size: var(--font-size-sm);
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

  @media (--mobile) {
    pointer-events: none;
  }

  img {
    height: 3rem;

    @media (--mobile) {
      height: 2.5rem;
    }
  }

  @media (--mobile) {
    gap: 0.6rem;
  }

  .cover-wrap {
    @media (--mobile) {
      display: none;
    }
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
