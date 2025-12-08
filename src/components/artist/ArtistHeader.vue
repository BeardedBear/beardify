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
      <Options />
    </div>
    <ArtistProfile />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import Options from "@/components/artist/ArtistOptions.vue";
import ArtistProfile from "@/components/artist/ArtistProfile.vue";
import { useArtist } from "@/views/artist/ArtistStore";

const domHeader = ref<HTMLDivElement | null>(null);
const artistStore = useArtist();

onMounted(() => {
  if (domHeader.value) artistStore.updateHeaderHeight(domHeader.value?.getBoundingClientRect().height);
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/mixins" as mixins;



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
  padding: 1.2rem 2.5rem 0.7rem;
  position: sticky;
  top: 0;
  transition: transform ease 0.1s;
  z-index: 3;
}

.inner {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  position: relative;
  z-index: 1;
}
</style>
