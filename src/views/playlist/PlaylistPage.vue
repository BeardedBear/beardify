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

import { PublicUser } from "../../@types/PublicUser";
import { instance } from "../../api";
import AlbumGallery from "../../components/AlbumGallery.vue";
import Loader from "../../components/LoadingDots.vue";
import PageScroller from "../../components/PageScroller.vue";
import Header from "../../components/playlist/PlaylistHeader.vue";
import Tracks from "../../components/playlist/PlaylistTracks.vue";
import { isAlbum, isEP, isSingle, useCheckLiveAlbum } from "../../helpers/useCleanAlbums";
import { usePlaylist } from "./PlaylistStore";

const props = defineProps<{ id: string }>();
const playlistStore = usePlaylist();
const albums = computed(() =>
  playlistStore.tracks
    .filter((track) => isAlbum(track.track.album) && !useCheckLiveAlbum(track.track.album.name))
    .map((e) => e.track.album),
);
const eps = computed(() => playlistStore.tracks.filter((track) => isEP(track.track.album)).map((e) => e.track.album));
const singles = computed(() => playlistStore.tracks.filter((track) => isSingle(track.track.album)));

const uniqueContributorIds = computed(() => {
  const contributorIds = playlistStore.tracks.map((track) => track.added_by.id);
  return [...new Set(contributorIds)];
});

const contributorsData = ref<Record<string, PublicUser>>({});

const fetchContributorsData = async () => {
  const api = instance();
  const newContributorsData: Record<string, PublicUser> = {};

  for (const userId of uniqueContributorIds.value) {
    try {
      const response = await api.get<PublicUser>(`users/${userId}`);
      newContributorsData[userId] = response.data;
    } catch (error) {
      console.error(`Error fetching data for user ${userId}:`, error);
    }
  }

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
@use "../../assets/scss/colors" as colors;
@use "../../assets/scss/responsive" as responsive;

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
