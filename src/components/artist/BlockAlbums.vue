<template>
  <div class="content-block" v-if="artistStore.albums.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">
      <i class="icon-album"></i>
      Albums
    </div>
    <div class="albums">
      <div :key="index" v-for="(group, index) in albumGroups">
        <AlbumGroup :group="group" can-save clean-name />
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

const albumGroups = computed(() => groupAlbumVariants(artistStore.albums));
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
