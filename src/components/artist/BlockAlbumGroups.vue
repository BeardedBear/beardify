<template>
  <div v-if="albums.length" class="content-block">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="bd-heading sticky-heading">
      <i :class="icon" />
      {{ title }}
    </div>
    <div class="albums">
      <div v-for="group in groups" :key="group.baseAlbum.id">
        <AlbumGroup :group="group" can-save />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import type { AlbumSimplified } from "@/@types/Album";

import AlbumGroup from "@/components/album/AlbumGroup.vue";
import { groupAlbumVariants } from "@/helpers/groupAlbumVariants";
import { useArtist } from "@/views/artist/ArtistStore";

const props = defineProps<{
  albums: AlbumSimplified[];
  icon: string;
  title: string;
}>();

const artistStore = useArtist();

const groups = computed(() => groupAlbumVariants(props.albums));
</script>

<style scoped>

.albums {
  display: grid;
  gap: var(--bd-space-4);
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
}
</style>
