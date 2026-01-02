<template>
  <div :class="{ 'not-fit': notFit }" class="playlist-header">
    <div class="playlist-header-left">
      <Cover :images="playlistStore.playlist.images" class="cover" size="large" v-if="!noCover" />
      <div>
        <div class="title">
          {{ playlistStore.playlist.name.replace("#Collection ", "") }}
        </div>
        <div class="metas">
          <router-link
            :to="`/user/${playlistStore.playlist.owner.id}`"
            class="owner"
            v-if="playlistStore.playlist.owner.display_name !== 'Spotify'"
          >
            {{ playlistStore.playlist.owner.display_name }}
          </router-link>
          <span v-else>{{ playlistStore.playlist.owner.display_name }}</span>
          <span>&nbsp;·&nbsp;{{ playlistStore.playlist.tracks.total }} items</span>
          <span v-if="!noDuration">&nbsp;·&nbsp;{{ timecodeWithUnits(sumDuration(playlistStore.tracks)) }}</span>
        </div>
        <div class="description" v-if="playlistStore.playlist.description !== 'No description'">
          {{ playlistStore.playlist.description }}
        </div>
      </div>
    </div>
    <Actions />
  </div>
</template>

<script lang="ts" setup>
import { RouterLink } from "vue-router";

import { PlaylistTrack } from "@/@types/Playlist";
import { useDialog } from "@/components/dialog/DialogStore";
import Actions from "@/components/playlist/PlaylistActions.vue";
import Cover from "@/components/ui/AlbumCover.vue";
import { timecodeWithUnits } from "@/helpers/date";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

defineProps<{
  noCover?: boolean;
  noDuration?: boolean;
  notFit?: boolean;
}>();

const playlistStore = usePlaylist();
const dialogStore = useDialog();

function openOptions(): void {
  dialogStore.open({ playlistId: playlistStore.playlist.id, type: "playlistOptions" });
}

function sumDuration(tracks: PlaylistTrack[]): number {
  return tracks.map((t: PlaylistTrack) => (t.track ? t.track.duration_ms : 0)).reduce((acc, value) => acc + value, 0);
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as mixins;

.search {
  background: var(--bg-color);
  border: none;
  border-radius: 1rem;
  color: var(--font);
  font-size: 0.9rem;
  font-weight: bold;
  outline: none;
  padding: 0.6rem 1rem;
  width: 10rem;

  @include mixins.squircle;
}

.description {
  font-size: 0.9rem;
  font-style: italic;
  margin-top: 0.5rem;
  max-width: 80%;
  opacity: 0.5;
}

.metas {
  font-size: 0.9rem;
  font-weight: bold;

  .owner {
    color: var(--primary-color);
    text-decoration: none;
  }
}

.title {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.playlist-header {
  $padd: 10rem;

  display: flex;
  justify-content: space-between;
  padding: 2rem $padd 1rem;
  transition:
    padding-right ease 0.2s,
    padding-left ease 0.2s;

  @media (width <= 1200px) {
    $padd: 2rem;

    padding: 2rem $padd 1rem;
  }

  &.not-fit {
    padding: 0 0 2rem;
  }

  @include responsive.hdpi {
    $padd: 50rem;

    padding: 2rem $padd 1rem;
  }

  @include responsive.xl {
    $padd: 2rem;

    padding: 2rem $padd 1rem;
  }

  img {
    margin-right: 2rem;
  }
}

.playlist-header-left {
  align-items: center;
  display: flex;
}

.right {
  align-items: center;
  display: flex;
  font-size: 1.1rem;
  gap: 0.5rem;

  @include responsive.mobile {
    background: var(--bg-color-dark);
    border-radius: 1rem;
    display: none;
    flex-direction: column;
    gap: 1.5rem;
    left: 50%;
    padding: 3rem 2rem 2rem;
    position: fixed;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    z-index: 1000;

    &.is-open {
      display: flex;
    }

    .search {
      width: 100%;
    }
  }
}

.mobile-options-toggle {
  display: none;
  font-size: 1.4rem;

  @include responsive.mobile {
    display: block; // ButtonIndex handles display
  }
}

.mobile-close {
  cursor: pointer;
  display: none;
  position: absolute;
  right: 1rem;
  top: 1rem;

  @include responsive.mobile {
    display: block;
  }
}

.backdrop {
  background: rgb(0 0 0 / 50%);
  display: none;
  inset: 0;
  position: fixed;
  z-index: 999;

  @include responsive.mobile {
    display: block;
  }
}

.cover {
  border-radius: 0.3rem;
  height: 7rem;
  width: 7rem;

  @include responsive.mobile {
    display: none;
  }
}
</style>
