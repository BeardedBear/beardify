<template>
  <div ref="domHeader" class="header" :class="{ scrolled: artistStore.scrolledDown }">
    <div class="image-container">
      <img v-if="artistStore.artist.images.length" :src="artistStore.artist.images[0].url" alt="" class="img" />
      <img v-else alt="" class="img" src="/img/default.png" />
    </div>
    <div class="inner">
      <div class="title">
        <h1 class="name bd-font-bold">
          {{ artistStore.artist.name }}
        </h1>
      </div>
      <Options class="desktop-options" />
      <BdTooltip bare content="Artist options">
        <BdButton
          aria-label="Artist options"
          class="mobile-options"
          icon-only
          @click="dialogStore.open({ type: 'artistOptions' })"
        >
          <MoreHorizontal />
        </BdButton>
      </BdTooltip>
    </div>
    <div class="collapsible" :class="{ collapsed: artistStore.scrolledDown }">
      <ArtistProfile />
    </div>
    <ArtistTabs v-model="artistStore.activeTab" :tabs="tabs" />
  </div>
</template>

<script lang="ts" setup>
import { CircleOff, Disc3, Info, Loader2, MoreHorizontal } from "@lucide/vue";
import { useElementBounding } from "@vueuse/core";
import { BdButton, BdTooltip } from "bearded-ui";
import { computed, ref, watch } from "vue";

import Options from "@/components/artist/ArtistOptions.vue";
import ArtistProfile from "@/components/artist/ArtistProfile.vue";
import ArtistTabs, { Tab } from "@/components/artist/ArtistTabs.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { useArtist } from "@/views/artist/ArtistStore";

const domHeader = ref<HTMLDivElement | null>(null);
const artistStore = useArtist();
const dialogStore = useDialog();
const { height } = useElementBounding(domHeader);

const loading = computed(() => {
  return artistStore.discographyLoading || artistStore.reclassifying;
});

const infoAvailable = computed(() => {
  return Boolean(artistStore.wikidataArtist || artistStore.wikipediaExtract);
});

const tabs = computed<Tab[]>(() => [
  {
    bar: loading.value,
    icon: loading.value ? Loader2 : Disc3,
    id: "discography",
    label: "Discography",
    loading: loading.value,
  },
  {
    disabled: !infoAvailable.value,
    icon: artistStore.timelineLoading ? Loader2 : !infoAvailable.value ? CircleOff : Info,
    id: "info",
    label: "Info",
    loading: artistStore.timelineLoading,
    tooltip: !infoAvailable.value ? "No additional information available" : undefined,
  },
]);

watch(height, (newHeight) => {
  if (newHeight > 0) {
    artistStore.updateHeaderHeight(newHeight);
  }
});

// If info becomes unavailable while the Info tab is active, reset to Discography
watch(infoAvailable, (available) => {
  if (!available && artistStore.activeTab === "info") {
    artistStore.activeTab = "discography";
  }
});
</script>

<style scoped>

.image-container {
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  z-index: 1;

  .img {
    filter: blur(15px);
    inset: 0;
    opacity: 0.2;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: translateY(-33%);
    width: 100%;
  }

  &::after {
    background-image: linear-gradient(to top, var(--bd-primary) 0%, transparent 100%);
    content: "";
    inset: 0;
    opacity: 0.2;
    position: absolute;
    z-index: 1;
  }
}

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

/*
 * `scrolled` is set on .header, not on .name, so the nested `&.scrolled` here
 * never matched and the artist title never shrank. Selecting from the header
 * makes the intent work: the name gives room back to the discography as you
 * scroll into it.
 */
.name {
  font-size: var(--bd-font-size-xl);
  transition: font-size var(--bd-transition);
}

.header.scrolled .name {
  font-size: var(--bd-font-size-lg);
}

.header {
  background-color: var(--bd-bg-darker);
  padding: var(--bd-space-4) var(--bd-space-6) 0;
  position: sticky;
  top: 0;
  transition:
    transform var(--bd-transition-fast),
    padding var(--bd-duration) ease;
  z-index: 20;

  @media (--mobile) {
    padding: var(--bd-space-2) var(--bd-space-4) 0;
  }
}

.inner {
  align-items: center;
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.desktop-options {
  @media (--mobile) {
    display: none;
  }
}

.mobile-options {
  display: none;

  @media (--mobile) {
    display: flex;
  }
}

.collapsible {
  @media (--mobile) {
    display: grid;
    grid-template-rows: 1fr;
    opacity: 1;
    transition: grid-template-rows 0.25s ease-out, opacity 0.2s ease-out;

    /* grid-template-rows shrinks proportionally to the row's real content size, unlike */

    /* max-height (which needs an oversized guess and then snaps late in the transition). */
    > * {
      min-height: 0;
      overflow: hidden;
    }

    &.collapsed {
      grid-template-rows: 0fr;
      opacity: 0;
    }
  }
}
</style>
