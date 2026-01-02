<template>
  <div class="header" ref="domHeader">
    <div class="image-container">
      <img :src="artistStore.artist.images[0].url" alt="" class="img" v-if="artistStore.artist.images.length" />
      <img class="img" src="/img/default.png" v-else />
    </div>
    <div class="inner">
      <div class="title">
        <div class="name">{{ artistStore.artist.name }}</div>
      </div>
      <Options class="desktop-options" />
      <ButtonIndex class="mobile-options" icon-only @click="dialogStore.open({ type: 'artistOptions' })">
        <i class="icon-more-horizontal" />
      </ButtonIndex>
    </div>
    <ArtistProfile />
    <ArtistTabs v-model="artistStore.activeTab" :tabs="tabs" />
  </div>
</template>

<script lang="ts" setup>
import { useElementBounding } from "@vueuse/core";
import { ref, watch } from "vue";

import Options from "@/components/artist/ArtistOptions.vue";
import ArtistProfile from "@/components/artist/ArtistProfile.vue";
import ArtistTabs, { Tab } from "@/components/artist/ArtistTabs.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { useArtist } from "@/views/artist/ArtistStore";

const domHeader = ref<HTMLDivElement | null>(null);
const artistStore = useArtist();
const dialogStore = useDialog();
const { height } = useElementBounding(domHeader);

const tabs: Tab[] = [
  { icon: "icon-disc", id: "discography", label: "Discography" },
  { icon: "icon-info", id: "info", label: "Info" },
];

watch(height, (newHeight) => {
  if (newHeight > 0) {
    artistStore.updateHeaderHeight(newHeight);
  }
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as mixins;
@use "@/assets/scss/responsive" as responsive;

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
    background-image: linear-gradient(to top, var(--primary-color) 0%, transparent 100%);
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

.name {
  font-size: 2rem;
  font-weight: bold;

  &.scrolled {
    font-size: 1.6rem;
  }
}

.header {
  background-color: var(--bg-color-darker);
  padding: 1.2rem 2.5rem 0;
  position: sticky;
  top: 0;
  transition:
    transform ease 0.1s,
    padding 0.3s ease;
  z-index: 20;

  @include responsive.mobile {
    padding: 0.5rem 1rem 0;
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
  @include responsive.mobile {
    display: none;
  }
}

.mobile-options {
  display: none;

  @include responsive.mobile {
    display: flex;
  }
}
</style>
