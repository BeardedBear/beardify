<template>
  <div class="loader" v-if="playlistStore.playlist.name === ''"><Loader /></div>
  <PageScroller v-else>
    <div class="playlist">
      <Header not-fit />
      <template
        v-if="playlistStore.playlist.owner.id === 'spotify' && !playlistStore.playlist.images[0]?.url.includes('blend')"
      >
        <AlbumGallery :album-list="albums" :icon-name="'album'" class="block" title="Albums" />
        <AlbumGallery :album-list="eps" :icon-name="'ep'" class="block" title="EP's" />
        <div class="heading sticky">
          <i class="icon-single"></i>
          Singles
        </div>
        <Tracks :track-list="singles" :contributors-data="contributorsData" />
      </template>
      <Tracks :track-list="playlistStore.tracks" :contributors-data="contributorsData" v-else />
    </div>
  </PageScroller>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { PublicUser } from "@/@types/PublicUser";
import { instance } from "@/api";
import AlbumGallery from "@/components/album/AlbumGallery.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import Header from "@/components/playlist/PlaylistHeader.vue";
import Tracks from "@/components/playlist/PlaylistTracks.vue";
import { isAlbum, isEP, isSingle, useCheckLiveAlbum } from "@/helpers/useCleanAlbums";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{ id: string }>();
const playlistStore = usePlaylist();

// Optimized: single iteration through tracks array instead of three separate iterations
const categorizedTracks = computed(() => {
  const albums = [];
  const eps = [];
  const singles = [];

  for (const track of playlistStore.tracks) {
    if (isAlbum(track.track.album) && !useCheckLiveAlbum(track.track.album.name)) {
      albums.push(track.track.album);
    } else if (isEP(track.track.album)) {
      eps.push(track.track.album);
    } else if (isSingle(track.track.album)) {
      singles.push(track);
    }
  }

  return { albums, eps, singles };
});

const albums = computed(() => categorizedTracks.value.albums);
const eps = computed(() => categorizedTracks.value.eps);
const singles = computed(() => categorizedTracks.value.singles);

const uniqueContributorIds = computed(() => {
  const contributorIds = playlistStore.tracks.map((track) => track.added_by.id);
  return [...new Set(contributorIds)];
});

const contributorsData = ref<Record<string, PublicUser>>({});

const fetchContributorsData = async (): Promise<void> => {
  const api = instance();
  const newContributorsData: Record<string, PublicUser> = {};

  // Optimized: parallelize API calls using Promise.allSettled to avoid N+1 problem
  const promises = uniqueContributorIds.value.map(async (userId) => {
    try {
      const response = await api.get<PublicUser>(`users/${userId}`);
      return { userId, data: response.data };
    } catch (error) {
      console.error(`Error fetching data for user ${userId}:`, error);
      return { userId, data: null };
    }
  });

  const results = await Promise.allSettled(promises);

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.data) {
      newContributorsData[result.value.userId] = result.value.data;
    }
  });

  contributorsData.value = newContributorsData;
};

// Surveiller les changements dans uniqueContributorIds pour récupérer les nouvelles données
watch(
  uniqueContributorIds,
  () => {
    if (uniqueContributorIds.value.length > 0) {
      fetchContributorsData();
    }
  },
  { immediate: true },
);

playlistStore.clean().finally(() => {
  playlistStore.getPlaylist(`playlists/${props.id}`);
  playlistStore.getTracks(`playlists/${props.id}/tracks`);
});
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.block {
  margin-bottom: 2rem;
}

.playlist {
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.loader {
  display: grid;
  place-content: center;
}
</style>
