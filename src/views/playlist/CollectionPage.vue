<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader">
    <Loader />
  </div>
  <PageScroller v-else ref="scrollerRef">
    <PageFit>
      <div class="collection">
        <Header no-duration with-filter />
        <div class="content">
          <template v-if="playlistStore.filter !== ''">
            <div class="album-list">
              <Album v-for="item in albumListFiltered" :key="item.id" :album="item" can-delete can-save with-artists />
            </div>
          </template>
          <template v-else-if="topTiers">
            <div class="tier-section">
              <template v-for="(group, i) in topTierGroups" :key="i">
                <template v-if="group.length">
                  <div class="tier-heading">{{ getTierLabel(i, topTiers) }}</div>
                  <VueDraggable
                    v-model="topTierGroups[i]"
                    v-bind="dragOptions"
                    :class="['tier-grid', `tier-grid-${i}`, { 'draggable-grid': !dragOptions.disabled }]"
                    @end="handleTopTierEnd"
                  >
                    <Album
                      v-for="item in group"
                      :key="item.id"
                      :album="item"
                      :rank="rankOf(item.id)"
                      can-delete
                      can-save
                      with-artists
                    />
                  </VueDraggable>
                </template>
              </template>
            </div>
          </template>
          <template v-else-if="tierList">
            <div class="tier-section">
              <template v-for="(tier, i) in tierList" :key="i">
                <div class="tier-row" :class="{ 'tier-row-side': configStore.tierListSideLabels }">
                  <div
                    class="tier-heading tier-heading-colored"
                    :class="{ 'tier-heading-side': configStore.tierListSideLabels }"
                    :style="{ backgroundColor: getTierColor(i, tierList.length) }"
                  >
                    {{ displayTierLabel(tier.label) }}
                  </div>
                  <VueDraggable
                    v-model="tierGroups[i]"
                    v-bind="dragOptions"
                    class="tier-grid"
                    :class="[
                      configStore.tierListSideLabels ? 'tier-grid-side' : 'tier-grid-dynamic',
                      { 'draggable-grid': !dragOptions.disabled },
                    ]"
                    @end="handleTierListEnd"
                    @start="isDragging = true"
                  >
                    <Album
                      v-for="item in tierGroups[i]"
                      :key="item.id"
                      :album="item"
                      can-delete
                      can-save
                      :dragging="isDragging"
                      hover-metas
                      with-artists
                    />
                  </VueDraggable>
                </div>
              </template>
              <div class="tier-row-unsorted" :class="{ 'tier-row-side': configStore.tierListSideLabels }">
                <div
                  class="tier-heading tier-heading-unsorted"
                  :class="{ 'tier-heading-side': configStore.tierListSideLabels }"
                >
                  {{ UNSORTED_TIER_LABEL }}
                </div>
                <div class="unsorted-scroll-wrap">
                  <button
                    class="scroll-arrow"
                    :disabled="!unsortedCanScrollLeft"
                    title="Scroll left"
                    type="button"
                    @click="scrollUnsorted(-1)"
                  >
                    <i class="icon-arrow-left" />
                  </button>
                  <div ref="unsortedScrollRef" class="unsorted-scroll" @scroll="updateUnsortedScrollState">
                    <VueDraggable
                      v-model="tierGroups[tierList.length]"
                      v-bind="dragOptions"
                      class="tier-grid tier-grid-unsorted"
                      :class="{ 'draggable-grid': !dragOptions.disabled }"
                      @end="handleTierListEnd"
                      @start="isDragging = true"
                    >
                      <Album
                        v-for="item in tierGroups[tierList.length]"
                        :key="item.id"
                        :album="item"
                        can-delete
                        can-save
                        :dragging="isDragging"
                        hover-metas
                        metas-above
                        with-artists
                      />
                    </VueDraggable>
                  </div>
                  <button
                    class="scroll-arrow"
                    :disabled="!unsortedCanScrollRight"
                    title="Scroll right"
                    type="button"
                    @click="scrollUnsorted(1)"
                  >
                    <i class="icon-arrow-right" />
                  </button>
                </div>
              </div>
            </div>
          </template>
          <VueDraggable
            v-else
            v-model="albumList"
            v-bind="dragOptions"
            :class="['album-list', { 'draggable-grid': !dragOptions.disabled }]"
            @end="syncNewPositions"
          >
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
import { NotificationType } from "@/@types/Notification";
import { instance } from "@/api";
import Album from "@/components/album/AlbumIndex.vue";
import { useConfig } from "@/components/config/ConfigStore";
import Header from "@/components/playlist/PlaylistHeader.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import Loader from "@/components/ui/LoadingDots.vue";
import PageFit from "@/components/ui/PageFit.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import { useCollectionRanking } from "@/composables/useCollectionRanking";
import {
  buildCollectionDescription,
  displayTierLabel,
  getTierColor,
  getTierLabel,
  groupByTierList,
  splitTopTiers,
  stripCollectionTags,
  TierList,
  UNSORTED_TIER_LABEL,
} from "@/helpers/collectionOptions";
import { notification } from "@/helpers/notifications";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { useAuth } from "@/views/auth/AuthStore";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

const props = defineProps<{ id: string }>();
const configStore = useConfig();
const playlistStore = usePlaylist();
const albumList = ref<AlbumSimplified[]>([]);
const authStore = useAuth();
const isDragging = ref(false);
const scrollerRef = ref<InstanceType<typeof PageScroller>>();
const tierGroups = ref<AlbumSimplified[][]>([]);
const topTierGroups = ref<AlbumSimplified[][]>([[], [], []]);
const unsortedCanScrollLeft = ref(false);
const unsortedCanScrollRight = ref(false);
const unsortedScrollRef = ref<HTMLElement | null>(null);
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

const description = computed(() => playlistStore.playlist.description);
const { rankOf, tierList, topTiers } = useCollectionRanking(description, albumList);

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

function applyReorder(nextOrder: AlbumSimplified[]): void {
  const move = findMove(albumList.value, nextOrder);
  if (move) playlistStore.updateCollectionPosition(move.oldIndex, move.newIndex);
  albumList.value = nextOrder;
}

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

function handleTierListEnd(): void {
  isDragging.value = false;
  applyReorder(tierGroups.value.flat());
  syncTierSizesToDescription();
}

function handleTopTierEnd(): void {
  applyReorder(topTierGroups.value.flat());
}

function scrollUnsorted(direction: -1 | 1): void {
  const el = unsortedScrollRef.value;
  if (!el) return;
  el.scrollBy({ behavior: "smooth", left: direction * el.clientWidth * 0.9 });
}

/**
 * Given the tiers a set of now-deleted albums used to belong to (looked up
 * from the last known grouping), decrements each affected tier's stored
 * size by how many of its items were removed. The Unsorted bucket (index
 * `list.length` in tierGroups, one past the stored tiers) never needs
 * shrinking — it always absorbs whatever remains.
 */
function shrinkTiersForRemovedAlbums(list: TierList, removedIds: string[]): null | TierList {
  const tierIndexByAlbumId = new Map<string, number>();
  tierGroups.value.forEach((group, tierIndex) => {
    group.forEach((album) => tierIndexByAlbumId.set(album.id, tierIndex));
  });

  const decrements = new Array<number>(list.length).fill(0);
  let matched = false;
  removedIds.forEach((id) => {
    const tierIndex = tierIndexByAlbumId.get(id);
    if (tierIndex === undefined || tierIndex >= list.length) return;
    decrements[tierIndex]++;
    matched = true;
  });
  if (!matched) return null;
  return list.map((tier, index) => ({ ...tier, size: Math.max(tier.size - decrements[index], 0) }));
}

function syncNewPositions(event: { newIndex?: number; oldIndex?: number }): void {
  if (event.oldIndex === undefined || event.newIndex === undefined) return;
  playlistStore.updateCollectionPosition(event.oldIndex, event.newIndex);
}

/**
 * Tier membership is derived purely from position + stored sizes, so any
 * external change to albumList (drag, but also deletion) that isn't
 * reflected in the stored sizes causes the fixed-size recompute to pull an
 * item up from the next tier to fill the gap. Deletions don't go through
 * handleTierListEnd (they're triggered from the Album component itself), so
 * this watcher diffs against the last known album ids on every change (not
 * just when the list shrinks — an add and a remove can land in the same
 * tick and leave the length unchanged) to find which tier lost an album,
 * and shrinks that tier's stored size to match before the normal
 * slice-based recompute runs.
 */
let previousTierAlbumIds: Set<string> = new Set();

function syncTierGroups(): void {
  const list = tierList.value;
  if (!list) {
    tierGroups.value = [];
    previousTierAlbumIds = new Set();
    return;
  }

  const currentIds = new Set(albumList.value.map((album) => album.id));
  const removedIds = [...previousTierAlbumIds].filter((id) => !currentIds.has(id));
  const adjustedList = removedIds.length ? shrinkTiersForRemovedAlbums(list, removedIds) : null;
  if (adjustedList) {
    previousTierAlbumIds = currentIds;
    writeTierListDescription(adjustedList);
    return;
  }

  previousTierAlbumIds = currentIds;
  tierGroups.value = groupByTierList(albumList.value, list);
}

/**
 * Tier sizes are counts, not membership: after a cross-tier drag the item
 * counts per bucket have changed, so the stored `#Tier:` sizes must be
 * updated to match — otherwise the next recompute re-slices the flat album
 * order by the old (now stale) counts and snaps the dragged item back.
 */
function syncTierSizesToDescription(): void {
  const list = tierList.value;
  if (!list) return;
  const updatedList: TierList = list.map((tier, index) => ({
    ...tier,
    size: tierGroups.value[index]?.length ?? tier.size,
  }));
  writeTierListDescription(updatedList);
}

function syncTopTiers(): void {
  topTierGroups.value = topTiers.value ? splitTopTiers(albumList.value, topTiers.value) : [[], [], []];
}

function updateUnsortedScrollState(): void {
  const el = unsortedScrollRef.value;
  if (!el) return;
  unsortedCanScrollLeft.value = el.scrollLeft > 0;
  unsortedCanScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
}

/** Writes an updated tier list to the description (optimistic, background PUT, rolls back on failure). */
function writeTierListDescription(updatedList: TierList): void {
  const freeText = stripCollectionTags(playlistStore.playlist.description);
  const newDescription = buildCollectionDescription(freeText, true, { tiers: updatedList, type: "tierlist" });
  if (newDescription === playlistStore.playlist.description) return;

  const previousDescription = playlistStore.playlist.description;
  const sidebarCollection = useSidebar().collections.find((collection) => collection.id === playlistStore.playlist.id);
  playlistStore.playlist.description = newDescription;
  if (sidebarCollection) sidebarCollection.description = newDescription;
  instance()
    .put(`playlists/${playlistStore.playlist.id}`, { description: newDescription })
    .catch(() => {
      playlistStore.playlist.description = previousDescription;
      if (sidebarCollection) sidebarCollection.description = previousDescription;
      notification({ msg: "Unable to update the tier list. Please try again.", type: NotificationType.Error });
    });
}

watch([albumList, topTiers], syncTopTiers, { immediate: true });
watch([albumList, tierList], syncTierGroups, { immediate: true });
watch(tierGroups, updateUnsortedScrollState, { flush: "post" });

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
  // .content is display: contents, so .tier-section is a direct grid item of
  // .collection — its default min-width: auto lets the Unsorted row's
  // intrinsic content width (before overflow-x clips it) push the whole grid,
  // and so the page, wider. min-width: 0 opts it out of that contribution.
  min-width: 0;
  padding: 1rem 5rem 2rem;

  @include responsive.tablet {
    padding: 1rem 1.5rem 1.5rem;
  }

  @include responsive.mobile {
    padding: 1rem;
  }
}

.tier-row {
  display: contents;
}

.tier-row-side {
  align-items: stretch;
  display: flex;
  margin-bottom: 1.5rem;
}

// Sticky requires an actual box (display: contents, used by .tier-row, opts an
// element out of sticky positioning entirely), so the Unsorted row gets its own
// always-boxed variant instead of reusing .tier-row.
.tier-row-unsorted {
  background-color: var(--bg-color-darker);
  bottom: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-bottom: 1rem;
  position: sticky;
  z-index: 2;

  &.tier-row-side {
    flex-direction: row;
  }

  &::before {
    background-image: linear-gradient(to top, var(--bg-color-darker) 0%, transparent 100%);
    bottom: 100%;
    content: '';
    height: 20px;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
  }
}

.tier-heading {
  background-color: var(--bg-color);
  border-radius: 0.4rem;
  font-size: var(--font-size-lg);
  line-break: anywhere;
  margin: 2rem 0 1rem;
  padding: 0.7rem 1.2rem;

  @include font-bold;

  &:first-child {
    margin-top: 0;
  }
}

.tier-heading-colored {
  color: #fff;
  text-shadow: 0 0.1rem 0.2rem rgb(0 0 0 / 40%);
}

.tier-heading-unsorted {
  background-color: transparent;
  border: 0.1rem dashed var(--bg-color-lighter);
  color: var(--font-color-dark);
  font-style: italic;
  opacity: 0.7;
}

.tier-heading-side {
  align-items: center;
  border-radius: 0.4rem 0 0 0.4rem;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  margin: 0;
  text-align: center;
  width: 8rem;

  @include responsive.mobile {
    width: 5rem;
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

.tier-grid-dynamic {
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  min-height: 6rem;
}

.tier-grid-side {
  background-color: var(--bg-color);
  border-radius: 0 0.4rem 0.4rem 0;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  min-height: 8rem;
  padding: 1rem;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.album) {
    width: 8rem;

    @include responsive.mobile {
      width: 6rem;
    }
  }
}

.draggable-grid {
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.album) {
    cursor: grab;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.sortable-chosen) {
    cursor: grabbing;
  }
}

.unsorted-scroll-wrap {
  align-items: center;
  background-color: var(--bg-color);
  border-radius: 0 0.4rem 0.4rem 0;
  display: flex;
  flex: 1;
  gap: 0.5rem;
  min-width: 0;
  padding: 0 1rem;
}

// Fixed to a single row (grid-template-rows) with new columns created as
// needed (grid-auto-flow: column) instead of wrapping — the Unsorted bucket
// can grow unbounded, so it scrolls sideways within .unsorted-scroll rather
// than pushing the page taller. flex + min-width: 0 are required for that:
// flex items default to min-width: auto, which without this would let the
// grid's intrinsic content width blow out the container instead of
// scrolling inside it.
.unsorted-scroll {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tier-grid-unsorted {
  background-color: var(--bg-color);
  border-radius: 0.4rem;
  display: grid;
  gap: 1rem;
  grid-auto-columns: 7rem;
  grid-auto-flow: column;
  grid-template-rows: 7rem;
  padding: 1rem;
  width: max-content;

  @include responsive.mobile {
    gap: 1rem;
    grid-auto-columns: 6rem;
    grid-template-rows: 6rem;
  }
}

.scroll-arrow {
  align-items: center;
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: 50%;
  color: currentcolor;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: var(--font-size-lg);
  height: 2.4rem;
  justify-content: center;
  width: 2.4rem;

  &:hover:not(:disabled) {
    background-color: var(--bg-color-lighter);
  }

  &:disabled {
    cursor: default;
    opacity: 0.3;
  }
}
</style>
