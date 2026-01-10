<template>
  <div v-if="artistStore.albumsLive.length" class="content-block">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">
      <i class="icon-album" />
      Live albums
    </div>
    <div class="albums">
      <div v-for="(group, index) in liveAlbumGroups" :key="index">
        <AlbumGroup :group="group" can-save />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import AlbumGroup from "@/components/album/AlbumGroup.vue";
import { groupAlbumVariants } from "@/helpers/groupAlbumVariants";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();

const liveAlbumGroups = computed(() => groupAlbumVariants(artistStore.albumsLive));
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.albums {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
}
</style>
