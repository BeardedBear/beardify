<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader">
    <Loader />
  </div>
  <PageScroller v-else ref="scrollerRef">
    <PageFit>
      <div class="collection">
        <Header no-cover no-duration with-filter />
        <div class="content">
          <template v-if="playlistStore.filter !== ''">
            <div class="album-list">
              <Album v-for="item in albumListFiltered" :key="item.id" :album="item" can-delete can-save with-artists />
            </div>
          </template>
          <template v-else-if="topTiers">
            <div class="tier-section">
              <template v-if="tier0.length">
                <div class="tier-heading">{{ getTierLabel(0, topTiers) }}</div>
                <VueDraggable v-model="tier0" v-bind="dragOptions" class="tier-grid tier-grid-0" @end="handleTierEnd">
                  <Album
                    v-for="item in tier0"
                    :key="item.id"
                    :album="item"
                    :rank="rankOf(item.id)"
                    can-delete
                    can-save
                    with-artists
                  />
                </VueDraggable>
              </template>
              <template v-if="tier1.length">
                <div class="tier-heading">{{ getTierLabel(1, topTiers) }}</div>
                <VueDraggable v-model="tier1" v-bind="dragOptions" class="tier-grid tier-grid-1" @end="handleTierEnd">
                  <Album
                    v-for="item in tier1"
                    :key="item.id"
                    :album="item"
                    :rank="rankOf(item.id)"
                    can-delete
                    can-save
                    with-artists
                  />
                </VueDraggable>
              </template>
              <template v-if="tier2.length">
                <div class="tier-heading">{{ getTierLabel(2, topTiers) }}</div>
                <VueDraggable v-model="tier2" v-bind="dragOptions" class="tier-grid tier-grid-2" @end="handleTierEnd">
                  <Album
                    v-for="item in tier2"
                    :key="item.id"
                    :album="item"
                    :rank="rankOf(item.id)"
                    can-delete
                    can-save
                    with-artists
                  />
                </VueDraggable>
              </template>
            </div>
          </template>
          <VueDraggable v-else v-model="albumList" v-bind="dragOptions" class="album-list" @end="syncNewPositions">
            <Album v-for="item in albumList" :key="item.id" :album="item" can-delete can-save with-artists />
          </VueDraggable>
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
import { getTierLabel, parseTopTiers, TopTiers } from "@/helpers/collectionOptions";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { useAuth } from "@/views/auth/AuthStore";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{ id: string }>();
const playlistStore = usePlaylist();
const albumList = ref<AlbumSimplified[]>([]);
const authStore = useAuth();
const scrollerRef = ref<InstanceType<typeof PageScroller>>();
const tier0 = ref<AlbumSimplified[]>([]);
const tier1 = ref<AlbumSimplified[]>([]);
const tier2 = ref<AlbumSimplified[]>([]);
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

const AUTO_SCROLL_SENSITIVITY = 150;
const AUTO_SCROLL_MAX_SPEED = 100;

function handleAutoScroll(
  _offsetX: number,
  _offsetY: number,
  originalEvent: Event,
  touchEvt: TouchEvent,
  hoverTargetEl: HTMLElement,
): "continue" | void {
  const pointerEvent = touchEvt?.touches?.length ? touchEvt.touches[0] : (originalEvent as MouseEvent);
  const rect = hoverTargetEl.getBoundingClientRect();
  const distanceFromTop = pointerEvent.clientY - rect.top;
  const distanceFromBottom = rect.bottom - pointerEvent.clientY;

  if (distanceFromTop >= 0 && distanceFromTop < AUTO_SCROLL_SENSITIVITY) {
    const ratio = 1 - distanceFromTop / AUTO_SCROLL_SENSITIVITY;
    hoverTargetEl.scrollTop -= Math.ceil(AUTO_SCROLL_MAX_SPEED * ratio);
    return;
  }
  if (distanceFromBottom >= 0 && distanceFromBottom < AUTO_SCROLL_SENSITIVITY) {
    const ratio = 1 - distanceFromBottom / AUTO_SCROLL_SENSITIVITY;
    hoverTargetEl.scrollTop += Math.ceil(AUTO_SCROLL_MAX_SPEED * ratio);
    return;
  }
  return "continue";
}

const dragOptions = computed(() => ({
  animation: 150,
  delay: 200,
  disabled: playlistStore.playlist.owner.id !== authStore.me?.id,
  forceFallback: true,
  group: "collection-tiers",
  scrollFn: handleAutoScroll,
  scrollSensitivity: AUTO_SCROLL_SENSITIVITY,
  scrollSpeed: AUTO_SCROLL_MAX_SPEED,
}));

/**
 * Finds the single item that moved between two otherwise-identical lists by
 * locating the first index where they diverge and tracing that item's prior
 * position via its id.
 */
function findMove(previous: AlbumSimplified[], next: AlbumSimplified[]): { newIndex: number; oldIndex: number } | null {
  const newIndex = previous.findIndex((album, i) => album.id !== next[i]?.id);
  if (newIndex === -1) return null;
  const oldIndex = previous.findIndex((album) => album.id === next[newIndex].id);
  return { newIndex, oldIndex };
}

function handleTierEnd(): void {
  const nextOrder = [...tier0.value, ...tier1.value, ...tier2.value];
  const move = findMove(albumList.value, nextOrder);
  if (move) playlistStore.updateCollectionPosition(move.oldIndex, move.newIndex);
  albumList.value = nextOrder;
}

function indexOfAlbum(id: string): number {
  return albumList.value.findIndex((album) => album.id === id);
}

function rankOf(id: string): number {
  return indexOfAlbum(id) + 1;
}

function syncNewPositions(event: { newIndex?: number; oldIndex?: number }): void {
  if (event.oldIndex === undefined || event.newIndex === undefined) return;
  playlistStore.updateCollectionPosition(event.oldIndex, event.newIndex);
}

function syncTiers(): void {
  if (!topTiers.value) {
    tier0.value = [];
    tier1.value = [];
    tier2.value = [];
    return;
  }
  const [big, medium] = topTiers.value;
  tier0.value = albumList.value.slice(0, big);
  tier1.value = albumList.value.slice(big, big + medium);
  tier2.value = albumList.value.slice(big + medium);
}

watch([albumList, topTiers], syncTiers, { immediate: true });

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

.tier-section {
  padding: 1rem 5rem 2rem;

  @include responsive.tablet {
    padding: 1rem 1.5rem 1.5rem;
  }

  @include responsive.mobile {
    padding: 1rem;
  }
}

.tier-heading {
  background-color: var(--bg-color);
  border-radius: 0.4rem;

  @include font-bold;

  font-size: var(--font-size-lg);
  margin: 2rem 0 1rem;
  padding: 0.7rem 1.2rem;

  &:first-child {
    margin-top: 0;
  }
}

.tier-grid {
  display: grid;
  gap: 2rem;

  @include responsive.mobile {
    gap: 1rem;
  }
}

.tier-grid-0 {
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}

.tier-grid-1 {
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
}

.tier-grid-2 {
  grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
}
</style>
