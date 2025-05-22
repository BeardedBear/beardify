<template>
  <div>
    <div class="heading sticky" v-if="!noTitle">
      <i :class="`icon-${iconName}`"></i>
      {{ title }}
    </div>
    <div class="albums">
      <div :key="index" v-for="(album, index) in albumList">
        <Album :album="album" can-save with-artists />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AlbumSimplified } from "../@types/Album";
import Album from "./album/AlbumIndex.vue";

defineProps<{
  albumList: AlbumSimplified[];
  iconName?: string;
  noTitle?: boolean;
  title?: string;
}>();
</script>

<style lang="scss" scoped>
@use "../assets/scss/colors" as colors;
@use "../assets/scss/responsive" as responsive;

.albums {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(6, 1fr);

  @media (width <= 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (width <= 960px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (width <= 664px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include responsive.l {
    grid-template-columns: repeat(6, 1fr);
  }

  @include responsive.xl {
    grid-template-columns: repeat(8, 1fr);
  }

  @include responsive.hdpi {
    grid-template-columns: repeat(12, 1fr);
  }
}
</style>
