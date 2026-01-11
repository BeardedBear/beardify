<template>
  <div>
    <div v-if="!noTitle" class="heading sticky">
      <i :class="`icon-${iconName}`" />
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
