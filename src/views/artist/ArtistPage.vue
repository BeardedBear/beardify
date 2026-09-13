<template>
  <div v-if="artistStore.artist.name === ''" class="loader">
    <BdLoader />
  </div>
  <div v-else ref="pageRef" class="artist-page" @scroll="handleScroll">
    <ArtistHeader />
    <Transition name="tab-fade" mode="out-in">
      <div v-if="artistStore.activeTab === 'discography'" key="discography" class="content">
        <div class="list">
          <div v-if="artistStore.discographyLoading" class="discography-loader">
            <BdLoader />
          </div>
          <template v-else>
            <BdEmptyState
              v-if="
                !artistStore.albums.length &&
                !artistStore.eps.length &&
                !artistStore.singles.length &&
                !artistStore.albumsLive.length &&
                !artistStore.albumsCompilation.length
              "
              :message="`${artistStore.artist.name} didn't release anything on Spotify yet.`"
              title="No releases yet"
            >
              <template #icon><i class="icon-album" /></template>
            </BdEmptyState>
            <BlockAlbums />
            <BlockEps />
            <BlockAlbumsLive />
            <BlockAlbumsCompilation />
            <BlockSingles />
          </template>
        </div>
        <div class="top">
          <TopTracks class="top-item" />
          <RelatedArtists class="top-item related-artists" />
        </div>
      </div>
      <div v-else-if="artistStore.activeTab === 'info'" key="info" class="content content-info">
        <ArtistInfo />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { useMediaQuery } from "@vueuse/core";
import { BdEmptyState, BdLoader } from "bearded-ui";
import { nextTick, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import ArtistHeader from "@/components/artist/ArtistHeader.vue";
import ArtistInfo from "@/components/artist/ArtistInfo.vue";
import BlockAlbums from "@/components/artist/BlockAlbums.vue";
import BlockAlbumsCompilation from "@/components/artist/BlockAlbumsCompilation.vue";
import BlockAlbumsLive from "@/components/artist/BlockAlbumsLive.vue";
import BlockEps from "@/components/artist/BlockEps.vue";
import BlockSingles from "@/components/artist/BlockSingles.vue";
import RelatedArtists from "@/components/artist/RelatedArtists.vue";
import TopTracks from "@/components/artist/TopTracks.vue";
import { useScrollRestore } from "@/composables/useScrollRestore";
import { useArtist } from "@/views/artist/ArtistStore";

const VALID_TABS = ["discography", "info"] as const;
type TabId = (typeof VALID_TABS)[number];

/**
 * How long to keep re-applying a tab's offset while the swap completes. Covers
 * the 120ms tab-fade plus the incoming mount, and any user input cuts it short.
 */
const TAB_SCROLL_PIN_MS = 350;

const props = defineProps<{ id: string }>();
const artistStore = useArtist();
const route = useRoute();

const pageRef = ref<HTMLElement | null>(null);
const { onScroll, restoreScroll } = useScrollRestore(`scroll-${route.path}`, pageRef);

let lastChangeTime = 0;

/*
 * Both tabs share one scroll container, so without this a reader deep in a
 * 12,000-word biography who checks the discography came back to the middle of
 * the albums — and lost their place in the article. Each tab keeps its own
 * offset instead.
 */
// Keyed by string, not TabId: the store types activeTab as string, and narrowing
// it would ripple into ArtistTabs, whose v-model emits a plain string
const tabScroll: Record<string, number> = { discography: 0, info: 0 };
// The swap clamps scrollTop against the outgoing tab's height; ignore those
// events so a short tab cannot overwrite the position of the tall one.
let switchingTab = false;
let tabScrollRaf = 0;
let detachTabAbort: (() => void) | null = null;

// 767px mirrors the mobile breakpoint used in the stylesheets (drives the collapse CSS).
const isMobile = useMediaQuery("(max-width: 767px)");

function handleScroll() {
  onScroll();
  if (!switchingTab) tabScroll[artistStore.activeTab] = pageRef.value?.scrollTop ?? 0;
  if (!isMobile.value) return;
  const now = Date.now();
  if (now - lastChangeTime < 300) return;

  const scrollTop = pageRef.value?.scrollTop ?? 0;
  if (scrollTop > 40 && !artistStore.scrolledDown) {
    artistStore.scrolledDown = true;
    lastChangeTime = now;
  } else if (scrollTop <= 0 && artistStore.scrolledDown) {
    artistStore.scrolledDown = false;
    lastChangeTime = now;
  }
}

/**
 * Pin the incoming tab's offset across the swap.
 *
 * Deliberately not driven by the Transition's `@after-enter`: `mode="out-in"`
 * mounts the new content only once the old one has left, and if that transition
 * is interrupted the hook never runs — leaving the tab permanently unable to
 * record its position. A frame loop needs no such promise.
 *
 * It also runs for the whole window rather than stopping as soon as the offset
 * takes: for most of the swap the outgoing content is still mounted, so an
 * early exit would have restored against the wrong scroll height and let the
 * incoming content clamp the offset away.
 * @param target - Offset the incoming tab was last left at
 */
function restoreTabScroll(target: number): void {
  detachTabAbort?.();
  cancelAnimationFrame(tabScrollRaf);
  const start = performance.now();

  function finish(): void {
    cancelAnimationFrame(tabScrollRaf);
    detachTabAbort?.();
    detachTabAbort = null;
    switchingTab = false;
  }

  // Whatever the restore intended, the reader reaching for the page wins
  const events = ["wheel", "touchstart", "keydown"] as const;
  events.forEach((event) => window.addEventListener(event, finish, { passive: true }));
  detachTabAbort = (): void => events.forEach((event) => window.removeEventListener(event, finish));

  const apply = (): void => {
    if (pageRef.value) pageRef.value.scrollTop = target;
    if (performance.now() - start < TAB_SCROLL_PIN_MS) tabScrollRaf = requestAnimationFrame(apply);
    else finish();
  };

  tabScrollRaf = requestAnimationFrame(apply);
}

artistStore.clean().finally(async () => {
  const hashTab = location.hash.slice(1);
  if ((VALID_TABS as readonly string[]).includes(hashTab)) {
    artistStore.activeTab = hashTab as TabId;
  }
  artistStore.getTopTracks(props.id);
  artistStore.getRelatedArtists(props.id);
  artistStore.getFollowStatus(props.id);

  if (artistStore.loadDiscographyCache(props.id)) {
    // Lists ready immediately — fire getArtist in background for the info tab
    // (wikidata, band members…) without blocking the discography display.
    artistStore.getArtist(props.id);
    await nextTick();
    restoreScroll();
    return;
  }

  // getArtist fetches Spotify info then drives MB/Discogs classification (slow pagination).
  // Fire it in background so MB delays don't block the discography display.
  // reclassifyReleases is called internally each time a classification source resolves.
  const currentId = props.id;
  const albumsPromise = Promise.all([
    artistStore.getAlbums(`artists/${currentId}/albums?include_groups=album&limit=50`),
    artistStore.getCompilations(`artists/${currentId}/albums?include_groups=compilation&limit=50`),
    artistStore.getSingles(currentId),
  ]);

  // Save cache only after both MB classification AND album data are loaded.
  // reclassifyReleases is called internally by getReleaseGroups and getDiscogsReleases,
  // so no explicit call needed here.
  void artistStore.getArtist(currentId).then(() => {
    return albumsPromise;
  }).then(() => {
    if (artistStore.artist.id === currentId) {
      artistStore.saveDiscographyCache(currentId);
    }
  });

  try {
    await albumsPromise;
    artistStore.reclassifyReleases();
  } finally {
    artistStore.discographyLoading = false;
    restoreScroll();
  }
});

watch(
  () => artistStore.activeTab,
  (tab) => {
    history.replaceState(history.state, "", `${location.pathname}#${tab}`);
    // The outgoing tab's offset is already in tabScroll, recorded by the last
    // real scroll event; nothing may overwrite it while the swap settles
    switchingTab = true;
    restoreTabScroll(tabScroll[tab] ?? 0);
  },
);

onUnmounted(() => {
  cancelAnimationFrame(tabScrollRaf);
  detachTabAbort?.();
});

</script>

<style>
.sticky-heading {
  background-color: var(--bd-bg-darker);
  margin-bottom: var(--bd-space-3);
  position: sticky;
  z-index: 15;

  &::after {
    background-color: var(--bd-bg-darker);
    bottom: 0;
    content: "";
    height: 100%;
    left: -1rem;
    position: absolute;
    right: -1rem;
    z-index: -1;
  }
}
</style>

<style scoped>

.list {
  flex: 1;

  @media (--tablet-down) {
    display: contents;
  }
}

.content {
  display: grid;
  gap: var(--bd-space-6);
  grid-template-columns: 1fr 20rem;
  margin: 0 auto;
  max-width: 120rem;
  padding: var(--bd-space-6);
  position: relative;

  @media (--tablet-down) {
    gap: var(--bd-space-5);
    grid-template-columns: 1fr;
    padding: var(--bd-space-4);
  }

  @media (--xl) {
    grid-template-columns: 1fr;
  }
}

/* Kept right after .content: same specificity, so source order decides. */
.content-info {
  grid-template-columns: 1fr;
}

.content-block {
  margin-bottom: var(--bd-space-7);

  @media (--mobile) {
    margin-bottom: var(--bd-space-6);
  }
}

.top {
  flex: 0 0 22rem;

  @media (--mobile) {
    display: contents;
    order: -1;
  }

  @media (--xl) {
    order: -1;
  }
}

.top-item {
  margin-bottom: var(--bd-space-6);

  @media (--mobile) {
    margin-bottom: var(--bd-space-5);
    order: -1;
  }

  @media (--xl) {
    margin-bottom: 0;
  }
}

.artist-page {
  animation: pop-content 1s ease both;
  overflow-y: scroll;
}

.related-artists {
  @media (--tablet-down) {
    order: 5;
  }

  @media (--xl) {
    order: 5;
  }
}

.loader {
  display: grid;
  place-content: center;
}

.discography-loader {
  display: grid;
  padding: var(--bd-space-8) 0;
  place-content: center;
}

.tab-fade-enter-active,
.tab-fade-leave-active {
  transition:
    opacity var(--bd-transition-fast),
    transform var(--bd-transition-fast);
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
