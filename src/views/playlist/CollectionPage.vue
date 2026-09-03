<template>
  <div v-if="playlistStore.playlist.name === ''" class="loader">
    <BdLoader />
  </div>
  <PageScroller v-else ref="scrollerRef">
    <PageFit>
      <div class="collection" :class="{ 'is-dragging': isDragging }">
        <Header no-duration with-filter />
        <div class="content">
          <template v-if="playlistStore.filter !== ''">
            <TransitionGroup class="album-list" name="album-shift" tag="div">
              <Album v-for="item in albumListFiltered" :key="item.id" :album="item" can-delete can-save with-artists />
            </TransitionGroup>
          </template>
          <template v-else-if="topTiers">
            <div class="tier-section">
              <template v-for="(group, i) in topTierGroups" :key="i">
                <TierRow v-if="group.length" :label="getTierLabel(i, topTiers)">
                  <VueDraggable
                    v-model="topTierGroups[i]"
                    v-bind="dragOptions"
                    :class="['tier-grid', `tier-grid-${i}`, { 'draggable-grid': !dragOptions.disabled }]"
                    @end="handleTopTierEnd"
                    @start="isDragging = true"
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
                </TierRow>
              </template>
            </div>
          </template>
          <template v-else-if="tierList">
            <div class="tier-section">
              <template v-for="(tier, i) in tierList" :key="i">
                <TierRow
                  :color="getTierColor(i, tierList.length)"
                  :label="displayTierLabel(tier.label)"
                  :side-layout="configStore.tierListSideLabels"
                >
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
                </TierRow>
              </template>
              <TierRow
                v-if="tierGroups[tierList.length]?.length"
                :label="UNSORTED_TIER_LABEL"
                scrollable
                :side-layout="configStore.tierListSideLabels"
                unsorted
              >
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
              </TierRow>
            </div>
          </template>
          <VueDraggable
            v-else
            v-model="albumList"
            v-bind="dragOptions"
            :class="['album-list', { 'draggable-grid': !dragOptions.disabled }]"
            @end="syncNewPositions"
            @start="isDragging = true"
          >
            <Album v-for="item in albumList" :key="item.id" :album="item" can-delete can-save with-artists />
          </VueDraggable>
        </div>
      </div>
    </PageFit>
  </PageScroller>
</template>

<script lang="ts" setup>
import { BdLoader } from "bearded-ui";
import { computed, onMounted, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";

import { AlbumSimplified } from "@/@types/Album";
import { NotificationType } from "@/@types/Notification";
import { instance } from "@/api";
import Album from "@/components/album/AlbumIndex.vue";
import { useConfig } from "@/components/config/ConfigStore";
import Header from "@/components/playlist/PlaylistHeader.vue";
import TierRow from "@/components/playlist/TierRow.vue";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import PageFit from "@/components/ui/PageFit.vue";
import PageScroller from "@/components/ui/PageScroller.vue";
import { useCollectionRanking } from "@/composables/useCollectionRanking";
import { findMove } from "@/helpers/arrayDiff";
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
import { computeAutoScrollDelta } from "@/helpers/dragAutoScroll";
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
  const delta = computeAutoScrollDelta(
    pointerEvent.clientY - rect.top,
    rect.bottom - pointerEvent.clientY,
    AUTO_SCROLL_SENSITIVITY,
    AUTO_SCROLL_MAX_SPEED,
  );
  if (delta === null) return "continue";
  hoverTargetEl.scrollTop += delta;
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const dragOptions = computed(() => ({
  animation: prefersReducedMotion ? 0 : 150,
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

function handleTierListEnd(): void {
  isDragging.value = false;
  applyReorder(tierGroups.value.flat());
  syncTierSizesToDescription();
}

function handleTopTierEnd(): void {
  isDragging.value = false;
  applyReorder(topTierGroups.value.flat());
}

function syncNewPositions(event: { newIndex?: number; oldIndex?: number }): void {
  isDragging.value = false;
  if (event.oldIndex === undefined || event.newIndex === undefined) return;
  playlistStore.updateCollectionPosition(event.oldIndex, event.newIndex);
}

/**
 * Tier membership is derived purely from position + stored sizes.
 *
 * The tier structure belongs to the collection, not to the album set: removing
 * an album leaves every tier the size you gave it and lets the albums below
 * shift up one place. That is why nothing here rewrites the stored sizes any
 * more — a delete used to shrink the tier it came from, which quietly eroded
 * a hand-built ranking one mis-click at a time, and did it behind a toast.
 *
 * The recompute below is all that is needed: groupByTierList re-slices the
 * current list against unchanged sizes, which is exactly "everything moves up
 * one".
 */
function syncTierGroups(): void {
  const list = tierList.value;
  if (!list) {
    tierGroups.value = [];
    return;
  }

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

<style scoped>

.collection {
  display: grid;
  grid-template-rows: auto auto;
}

.content {
  display: contents;
}

/*
 * One inset token, shared with the header (see PlaylistHeader), because the two
 * used to disagree: 5rem there against 10rem here meant the collection title
 * and its own albums had no common left edge on any display between 1201 and
 * 1929px — every laptop size in use.
 *
 * Columns are auto-fill rather than a fixed count per breakpoint. The old
 * version declared `@media (--l)` twice, so the first block was dead and the
 * grid held at 4 columns from 1201px all the way to 1929px before jumping to 8
 * — four albums per row inside 140px gutters on a 1920px screen, which is the
 * density thesis inverted. auto-fill makes density track the viewport
 * continuously instead of stair-stepping.
 */
.album-list {
  display: grid;
  gap: var(--bd-space-6);
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  padding: var(--bd-space-6) var(--page-inset);
  transition:
    padding-right var(--bd-transition),
    padding-left var(--bd-transition);

  @media (--tablet) {
    gap: var(--bd-space-5);
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  }

  @media (--mobile) {
    gap: var(--bd-space-4);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.loader {
  display: grid;
  place-content: center;
}

.tier-section {
  /* .content is display: contents, so .tier-section is a direct grid item of */

  /* .collection — its default min-width: auto lets the Unsorted row's */

  /* intrinsic content width (before overflow-x clips it) push the whole grid, */

  /* and so the page, wider. min-width: 0 opts it out of that contribution. */
  min-width: 0;
  padding: var(--bd-space-4) var(--page-inset) 10rem;

  /* Seul le dégagement bas reste par palier : il dépend du lecteur, pas de la page. */
  @media (--tablet) {
    padding-bottom: 7rem;
  }

  @media (--mobile) {
    padding-bottom: var(--bd-space-4);
  }
}

.tier-grid {
  display: grid;
  gap: var(--bd-space-4);
}

.tier-grid-0 {
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
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
  background-color: var(--bd-bg);
  border-radius: 0 var(--bd-radius-sm) var(--bd-radius-sm) 0;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  min-height: 8rem;
  padding: var(--bd-space-4);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.tier-grid-side :deep(.album) {
  width: 8rem;
}

@media (--mobile) {
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  .tier-grid-side :deep(.album) {
    width: 6rem;
  }
}

/*
 * Ordonner est l'acte pour lequel cette page existe : dans une collection, la
 * position EST le propos. Le drag est donc le seul moment chorégraphié ici, et
 * le reste de la page ne bouge pas. Trois questions que le geste doit trancher,
 * trois états ci-dessous : est-ce que je la tiens, d'où vient-elle, où peut-elle
 * atterrir.
 */

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.draggable-grid :deep(.album) {
  cursor: grab;
}

/*
 * `delay: 200` dans dragOptions : 200 ms de pression avant que le drag démarre.
 * Sans retour, c'est 200 ms où rien ne répond. La pochette s'enfonce pendant
 * l'armement, puis se relâche dans la main.
 */

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.draggable-grid :deep(.cover) {
  transition:
    box-shadow var(--bd-transition),
    transform var(--bd-transition-fast);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.draggable-grid :deep(.album:active .cover) {
  transform: scale(0.96);
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.draggable-grid :deep(.sortable-chosen) {
  cursor: grabbing;
}

/*
 * En main. Sortable clone la carte et écrit la translation du pointeur en style
 * inline sur ce clone : un `scale` ou un `rotate` posé sur le clone lui-même se
 * composerait avec cette translation et décrocherait la carte du curseur — 2°
 * suffisent à la décaler d'une vingtaine de pixels après 500 px de trajet.
 * L'élévation va donc sur `.visual`, à l'intérieur, hors d'atteinte du inline.
 */

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.draggable-grid :deep(.sortable-drag .visual) {
  animation: lift-in-hand 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* L'ombre va sur .cover : c'est la seule boîte réellement opaque de la carte. */

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.draggable-grid :deep(.sortable-drag .cover) {
  box-shadow: var(--bd-shadow-lg);
}

@keyframes lift-in-hand {
  from {
    transform: scale(1) rotate(0deg);
  }

  to {
    transform: scale(1.05) rotate(-2deg);
  }
}

/*
 * Ce qui reste sur place n'est plus une carte, c'est l'emplacement qu'elle a
 * libéré — et c'est aussi l'endroit exact où elle retombera si on relâche ici.
 */

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.draggable-grid :deep(.sortable-ghost) {
  outline: 0.15rem dashed var(--bd-primary);
  outline-offset: 0.3rem;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.draggable-grid :deep(.sortable-ghost .visual) {
  opacity: 0.25;
}

/*
 * Tant qu'une carte est en l'air, chaque tier annonce qu'il peut la recevoir.
 * `tier-grid-dynamic` en a plus besoin que les autres : un tier vide n'a aucun
 * fond, donc aujourd'hui aucune cible visible.
 */

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.is-dragging :deep(.tier-grid) {
  outline: 0.1rem dashed color-mix(in oklab, var(--bd-primary) 30%, transparent);
  outline-offset: 0.3rem;
  transition:
    background-color var(--bd-transition),
    outline-color var(--bd-transition);
}

/*
 * Celui qui tient le placeholder est la destination réelle : sortable déplace
 * l'élément dragué dans le conteneur survolé au fil du geste, donc `:has()` suit
 * la cible sans aucune comptabilité côté JS.
 */

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.is-dragging :deep(.tier-grid:has(.sortable-ghost)) {
  background-color: color-mix(in oklab, var(--bd-primary) 12%, var(--bd-bg));
  border-radius: var(--bd-radius-sm);
  outline-color: var(--bd-primary);
}

/*
 * Filtrer recompose la grille sous les doigts. Sans FLIP, chaque frappe est un
 * saut sec et on perd de vue ce qui a survécu au filtre ; la sortie reste
 * instantanée pour que la frappe ne traîne pas derrière un chaînage de 400 ms.
 */
.album-shift-move {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.album-shift-enter-active {
  transition: opacity var(--bd-transition);
}

.album-shift-enter-from {
  opacity: 0;
}

/*
 * Le geste garde ses signaux d'état — l'emplacement libéré, le tier ciblé, la
 * pochette élevée — et ne perd que le déplacement. Voir aussi `animation: 0`
 * passé à sortable dans dragOptions, qui coupe le glissement des voisins.
 */
@media (prefers-reduced-motion: reduce) {
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  .draggable-grid :deep(.album:active .cover) {
    transform: none;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  .draggable-grid :deep(.sortable-drag .visual) {
    animation: none;
  }

  .album-shift-enter-active,
  .album-shift-move {
    transition: none;
  }
}

/* Fixed to a single row (grid-template-rows) with new columns created as */

/* needed (grid-auto-flow: column) instead of wrapping — the Unsorted bucket */

/* can grow unbounded, so it scrolls sideways within TierRow's .unsorted-scroll */

/* (which handles the container-level overflow/min-width containment) rather */

/* than pushing the page taller. */
.tier-grid-unsorted {
  background-color: var(--bd-bg);
  border-radius: var(--bd-radius-sm);
  display: grid;
  gap: var(--bd-space-4);
  grid-auto-columns: 7rem;
  grid-auto-flow: column;
  grid-template-rows: 7rem;
  padding: var(--bd-space-4);
  width: max-content;

  @media (--mobile) {
    gap: var(--bd-space-4);
    grid-auto-columns: 6rem;
    grid-template-rows: 6rem;
  }
}

</style>
