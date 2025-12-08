<template>
  <div class="header" ref="domHeader">
    <img :src="artistStore.artist.images[0].url" alt="" class="img" v-if="artistStore.artist.images.length" />
    <img class="img" src="/img/default.png" v-else />
    <div class="inner">
      <div class="title">
        <div class="name">{{ artistStore.artist.name }}</div>
      </div>
      <Options />
    </div>
    <!-- <div class="genres">
      <span :key="index" class="genre" v-for="(genre, index) in artistStore.artist.genres.splice(0, 8)">
        {{ genre }}
      </span>
    </div> -->
    <div class="profile" v-if="artistStore.discogsArtist?.profile">
      {{ artistStore.discogsArtist.profile }}
    </div>
    <SocialLinks />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

import Options from "@/components/artist/ArtistOptions.vue";
import SocialLinks from "@/components/artist/ArtistSocialLinks.vue";
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

.img {
  filter: blur(15px);
  inset: 0;
  opacity: 0.2;
  position: absolute;
  top: 50%;
  transform: translateY(-33%);
  width: 100%;
}

// .genres {
//   margin-bottom: 0.3rem;
//   opacity: 0.4;

//   .genre {
//     background-color: var(--bg-color-darker);
//     border-radius: 2rem;
//     color: currentcolor;
//     display: inline-block;
//     font-size: 0.8rem;
//     margin-right: 0.3rem;
//     padding: 0 0.5rem 0.1rem;

//     @include mixins.squircle;
//   }
// }

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
  overflow: hidden;
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

.profile {
  color: var(--font-color-light);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-top: 0.5rem;
  max-width: 60rem;
  opacity: 0.5;
}
</style>
