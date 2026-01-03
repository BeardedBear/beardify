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
        <span class="trackname">{{ currentTrack.name }}</span>
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
import { transformUriToid } from "@/helpers/helper";

const playerStore = usePlayer();
const dialogStore = useDialog();
const currentTrack = computed(() => playerStore.playerState?.track_window.current_track);
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/responsive" as responsive;

.cover {
  border-radius: 0.3rem;
  display: block;
}

.cover-wrap {
  position: relative;

  .add {
    font-size: 1.4rem;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @include responsive.mobile {
    display: flex;
    flex-direction: column;
    white-space: normal;
  }
}

.trackname {
  font-weight: bold;

  @include responsive.mobile {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
}

.separator {
  @include responsive.mobile {
    display: none;
  }
}

.artists {
  @include responsive.mobile {
    font-size: 0.9em;
    opacity: 0.8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
  }
}

.artistname {
  color: currentcolor;
  font-weight: 700;
  text-decoration: none;
}

.album {
  font-size: 0.9rem;
  font-style: italic;

  .link {
    color: currentcolor;
    cursor: pointer;
    font-size: 0.9rem;
    font-style: italic;
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
  overflow: hidden;

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
  overflow: hidden;

  > div {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
