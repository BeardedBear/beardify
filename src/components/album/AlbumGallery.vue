<template>
  <div>
    <div v-if="!noTitle" class="bd-heading sticky">
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

<style scoped>

.albums {
  display: grid;
  gap: var(--bd-space-6);
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
}
</style>
