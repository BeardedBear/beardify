<template>
  <div>
    <div class="heading sticky">
      <i :class="`icon-${iconName}`"></i>
      {{ title }}
    </div>
    <div class="albums">
      <div v-for="(album, index) in albumList" :key="index">
        <Album :album="album" can-save with-artists />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { AlbumSimplified } from "../@types/Album";
import Album from "./album/Album.vue";

defineProps<{
  title: string;
  iconName: string;
  albumList: AlbumSimplified[];
}>();
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";
@import "../assets/scss/responsive";

.albums {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(6, 1fr);

  @include xl {
    grid-template-columns: repeat(4, 1fr);
  }

  @include l {
    grid-template-columns: repeat(3, 1fr);
  }

  @include hdpi {
    grid-template-columns: repeat(9, 1fr);
  }
}
</style>
