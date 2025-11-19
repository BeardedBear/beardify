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
          <span>— {{ playlistStore.playlist.tracks.total }} items</span>
          <span v-if="!noDuration">— {{ timecodeWithUnits(sumDuration(playlistStore.tracks)) }}</span>
        </div>
        <div class="description" v-if="playlistStore.playlist.description !== 'No description'">
          {{ playlistStore.playlist.description }}
        </div>
      </div>
    </div>

    <div class="right">
      <Actions />
      <input
        class="search"
        placeholder="Filter album/artist"
        ref="searchElement"
        type="search"
        v-if="$route.name === 'Collection'"
        v-model="playlistStore.filter"
      />
      <ShareContent :beardify-url="$route.fullPath" :spotify-url="playlistStore.playlist.external_urls.spotify" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { PlaylistTrack } from "@/@types/Playlist";
import Cover from "@/components/ui/AlbumCover.vue";
import Actions from "@/components/playlist/PlaylistActions.vue";
import ShareContent from "@/components/ui/ShareContent.vue";
import { timecodeWithUnits } from "@/helpers/date";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

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
}

.cover {
  border-radius: 0.3rem;
  height: 7rem;
  width: 7rem;
}
</style>
