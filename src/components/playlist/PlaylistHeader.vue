<template>
  <div class="playlist-header" :class="{ 'not-fit': notFit }">
    <div class="playlist-header__left">
      <Cover v-if="!noCover" size="large" :images="playlistStore.playlist.images" class="cover" />
      <div>
        <div class="title">
          {{ playlistStore.playlist.name.replace("#Collection ", "") }}
        </div>
        <div class="metas">
          <router-link
            v-if="playlistStore.playlist.owner.display_name !== 'Spotify'"
            :to="`/user/${playlistStore.playlist.owner.id}`"
            class="owner"
          >
            {{ playlistStore.playlist.owner.display_name }}
          </router-link>
          <span v-else>{{ playlistStore.playlist.owner.display_name }}</span>
          <span> — {{ playlistStore.playlist.tracks.total }} items</span>
          <span v-if="!noDuration"> — {{ timecodeWithUnits(sumDuration(playlistStore.tracks)) }} </span>
        </div>
        <div v-if="playlistStore.playlist.description !== 'No description'" class="description">
          {{ playlistStore.playlist.description }}
        </div>
      </div>
    </div>

    <div class="right">
      <Actions />
      <input
        v-if="$route.name === 'Collection'"
        ref="searchElement"
        v-model="playlistStore.filter"
        type="search"
        class="search"
        placeholder="Filter album/artist"
      />
      <ShareContent :spotify-url="playlistStore.playlist.external_urls.spotify" :beardify-url="$route.fullPath" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { PlaylistTrack } from "../../@types/Playlist";
import Cover from "../../components/AlbumCover.vue";
import ShareContent from "../../components/ShareContent.vue";
import Actions from "../../components/playlist/PlaylistActions.vue";
import { timecodeWithUnits } from "../../helpers/date";
import { usePlaylist } from "../../views/playlist/PlaylistStore";

import { RouterLink } from "vue-router";

defineProps<{
  noCover?: boolean;
  noDuration?: boolean;
  notFit?: boolean;
}>();

const playlistStore = usePlaylist();
const searchElement = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (searchElement.value) searchElement.value.focus();
});

function sumDuration(tracks: PlaylistTrack[]): number {
  return tracks.map((t: PlaylistTrack) => (t.track ? t.track.duration_ms : 0)).reduce((acc, value) => acc + value, 0);
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.search {
  background: var(--bg-color);
  border: none;
  border-radius: 0.3rem;
  color: var(--font);
  font-size: 0.9rem;
  font-weight: bold;
  outline: none;
  padding: 0.6rem 1rem;
  width: 10rem;
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

  @include hdpi {
    $padd: 50rem;

    padding: 2rem $padd 1rem;
  }

  @include xl {
    $padd: 2rem;

    padding: 2rem $padd 1rem;
  }

  img {
    margin-right: 2rem;
  }

  &__left {
    align-items: center;
    display: flex;
  }
}

.right {
  align-items: center;
  display: flex;
  font-size: 1.1rem;
  gap: 0.5rem;
}

.cover {
  border-radius: 0.3rem;
  height: 7rem;
  width: 7rem;
}
</style>
