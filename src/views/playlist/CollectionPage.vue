<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader">
    <Loader />
  </div>
  <PageScroller v-else ref="scrollerRef">
    <PageFit>
      <div class="collection">
        <Header no-cover no-duration with-filter />
        <div class="content">
          <template v-if="playlistStore.filter === ''">
            <VueDraggable
              v-model="albumList"
              :animation="150"
              :delay="200"
              :disabled="playlistStore.playlist.owner.id !== authStore.me?.id"
              :force-fallback="true"
              :scroll-sensitivity="100"
              :scroll-speed="15"
              class="album-list"
              @end="syncNewPositions"
            >
              <Album
                v-for="item in albumList"
                :key="item.id"
                :album="item"
                :class="topTiers ? tierClassFor(item.id) : undefined"
                :data-tier-label="topTiers && isTierStart(item.id) ? tierLabelFor(item.id) : undefined"
                :rank="topTiers ? rankOf(item.id) : undefined"
                can-delete
                can-save
                with-artists
              />
            </VueDraggable>
          </template>
          <div v-else class="album-list">
            <Album
              v-for="item in albumListFiltered"
              :key="item.id"
              :album="item"
              :class="topTiers ? tierClassFor(item.id) : undefined"
              :data-tier-label="topTiers && isTierStart(item.id) ? tierLabelFor(item.id) : undefined"
              :rank="topTiers ? rankOf(item.id) : undefined"
              can-delete
              can-save
              with-artists
            />
          </div>
        </div>
      </div>
    </PageFit>
  </PageScroller>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";

import { AlbumSimplified } from "@/@types/Album";
import Album from "@/components/album/AlbumIndex.vue";
import Header from "@/components/playlist/PlaylistHeader.vue";
import Loader from "@/components/ui/LoadingDots.vue";
import PageFit from "@/components/ui/PageFit.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import { getTierForIndex, getTierLabel, parseTopTiers, TopTiers } from "@/helpers/collectionOptions";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { useAuth } from "@/views/auth/AuthStore";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{ id: string }>();
const playlistStore = usePlaylist();
const albumList = ref<AlbumSimplified[]>([]);
const authStore = useAuth();
const scrollerRef = ref<InstanceType<typeof PageScroller>>();
const syncAlbumList = (): void => {
  albumList.value = removeDuplicatesAlbums(playlistStore.tracks.map((a) => a.item.album));
};

onMounted(syncAlbumList);

const albumListFiltered = computed<AlbumSimplified[]>(() =>
  albumList.value.filter((album) => {
    const matchedArtistName = album.artists[0].name.toLowerCase().includes(playlistStore.filter.toLowerCase());
    const matchedAlbumName = album.name.toLowerCase().includes(playlistStore.filter.toLowerCase());
    return matchedArtistName || matchedAlbumName;
  }),
);

const topTiers = computed<null | TopTiers>(() => parseTopTiers(playlistStore.playlist.description));

function indexOfAlbum(id: string): number {
  return albumList.value.findIndex((album) => album.id === id);
}

function isTierStart(id: string): boolean {
  if (!topTiers.value) return false;
  const index = indexOfAlbum(id);
  if (index === 0) return true;
  return getTierForIndex(index, topTiers.value) !== getTierForIndex(index - 1, topTiers.value);
}

function rankOf(id: string): number {
  return indexOfAlbum(id) + 1;
}

function syncNewPositions(event: { newIndex?: number; oldIndex?: number }): void {
  if (event.oldIndex === undefined || event.newIndex === undefined) return;
  playlistStore.updateCollectionPosition(event.oldIndex, event.newIndex);
}

function tierClassFor(id: string): string {
  const tier = tierOf(id);
  return tier === null ? "" : `tier-${tier}`;
}

function tierLabelFor(id: string): string {
  const tier = tierOf(id);
  return tier === null || !topTiers.value ? "" : getTierLabel(tier, topTiers.value);
}

function tierOf(id: string): 0 | 1 | 2 | null {
  if (!topTiers.value) return null;
  return getTierForIndex(indexOfAlbum(id), topTiers.value);
}

watch(
  () => playlistStore.tracks,
  syncAlbumList,
);

playlistStore.clean().finally(() => {
  Promise.all([
    playlistStore.getPlaylist(`playlists/${props.id}`),
    playlistStore.getTracks(`playlists/${props.id}/items`),
  ]).then(() => {
    // Restore scroll after albums finished loading (height is now stable)
    scrollerRef.value?.restoreScroll();
  });
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as *;
@use "@/assets/scss/responsive" as responsive;

.collection {
  display: grid;
  grid-template-rows: auto auto;
}

.content {
  display: contents;
}

.album-list {
  $padd: 10rem;

  display: grid;
  gap: 2rem;
  grid-auto-flow: dense;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 2rem 5rem;
  padding-left: $padd;
  padding-right: $padd;
  transition:
    padding-right ease 0.2s,
    padding-left ease 0.2s;

  @media (width <= 1200px) {
    $padd: 2rem;

    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding-left: $padd;
    padding-right: $padd;
  }

  @include responsive.l {
    $padd: 2rem;

    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding-left: $padd;
    padding-right: $padd;
  }

  @include responsive.l {
    $padd: 2rem;

    grid-template-columns: repeat(8, minmax(0, 1fr));
    padding-left: $padd;
    padding-right: $padd;
  }

  @include responsive.hdpi {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  @include responsive.tablet {
    gap: 1.5rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 1.5rem;
  }

  @include responsive.mobile {
    gap: 1rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 1rem;
  }
}

.loader {
  display: grid;
  place-content: center;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
:deep(.tier-0) {
  grid-column: span 2;
  grid-row: span 2;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
:deep(.tier-2) {
  transform: scale(0.85);
  transform-origin: top left;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
:deep(.tier-start)::before {
  content: attr(data-tier-label);
  display: block;

  @include font-bold;

  font-size: var(--font-size-sm);
  opacity: 0.5;
  position: absolute;
  top: -1.8rem;
}
</style>
