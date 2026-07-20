<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader">
    <Loader />
  </div>
  <PageScroller v-else ref="scrollerRef">
    <div class="playlist">
      <Header not-fit />
      <template
        v-if="playlistStore.playlist.owner.id === 'spotify' && !playlistStore.playlist.images[0]?.url.includes('blend')"
      >
        <AlbumGallery :album-list="albums" :icon-name="'album'" class="block" title="Albums" />
        <AlbumGallery :album-list="eps" :icon-name="'ep'" class="block" title="EP's" />
        <div class="heading sticky">
          <i class="icon-single" />
          Singles
        </div>
        <Tracks :track-list="singles" :contributors-data="contributorsData" />
      </template>
      <Tracks v-else :track-list="playlistStore.tracks" :contributors-data="contributorsData" />
    </div>
  </PageScroller>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import { PublicUser } from "@/@types/PublicUser";
import { instance } from "@/api";
import AlbumGallery from "@/components/album/AlbumGallery.vue";
import Header from "@/components/playlist/PlaylistHeader.vue";
import Tracks from "@/components/playlist/PlaylistTracks.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { isAlbum, isEP, isSingle, useCheckLiveAlbum } from "@/helpers/useCleanAlbums";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{ id: string }>();
const playlistStore = usePlaylist();
const scrollerRef = ref<InstanceType<typeof PageScroller>>();

// Optimized: single iteration through tracks array instead of three separate iterations
const categorizedTracks = computed(() => {
  const albums = [];
  const eps = [];
  const singles = [];

  for (const track of playlistStore.tracks) {
    if (isAlbum(track.item.album) && !useCheckLiveAlbum(track.item.album.name)) {
      albums.push(track.item.album);
    } else if (isEP(track.item.album)) {
      eps.push(track.item.album);
    } else if (isSingle(track.item.album)) {
      singles.push(track);
    }
  }

  return { albums: removeDuplicatesAlbums(albums), eps: removeDuplicatesAlbums(eps), singles };
});

const albums = computed(() => categorizedTracks.value.albums);
const eps = computed(() => categorizedTracks.value.eps);
const singles = computed(() => categorizedTracks.value.singles);

const uniqueContributorIds = computed(() => {
  const contributorIds = playlistStore.tracks.map((track) => track.added_by.id).filter(Boolean);
  return [...new Set(contributorIds)];
});

const contributorsData = ref<Record<string, PublicUser>>({});
const attemptedContributors = new Set<string>();

const fetchContributorsData = async (): Promise<void> => {
  const missing = uniqueContributorIds.value.filter((userId) => !attemptedContributors.has(userId));
  if (missing.length === 0) return;

  for (const id of missing) attemptedContributors.add(id);

  const api = instance();
  const newContributorsData: Record<string, PublicUser> = {};

  const results = await Promise.allSettled(
    missing.map(async (userId) => {
      try {
        const response = await api.get<PublicUser>(`users/${userId}`, {
          signal: AbortSignal.timeout(3000),
        });
        return { data: response.data, userId };
      } catch {
        return { data: null, userId };
      }
    }),
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.data) {
      newContributorsData[result.value.userId] = result.value.data;
    }
  }

  if (Object.keys(newContributorsData).length > 0) {
    contributorsData.value = { ...contributorsData.value, ...newContributorsData };
  }
};

playlistStore.clean().finally(() => {
  Promise.all([
    playlistStore.getPlaylist(`playlists/${props.id}`),
    playlistStore.getTracks(`playlists/${props.id}/items`),
  ]).then(() => {
    fetchContributorsData();
    // Restore scroll after tracks finished loading (height is now stable)
    scrollerRef.value?.restoreScroll();
  });
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
