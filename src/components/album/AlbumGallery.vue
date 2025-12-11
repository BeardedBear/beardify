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
import { AlbumSimplified } from "@/@types/Album";
import Album from "@/components/album/AlbumIndex.vue";

defineProps<{
  albumList: AlbumSimplified[];
  iconName?: string;
  noTitle?: boolean;
  title?: string;
}>();
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.albums {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
}
</style>
