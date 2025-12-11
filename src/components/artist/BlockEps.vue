<template>
  <div class="content-block" v-if="artistStore.eps.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">
      <i class="icon-ep"></i>
      EP's
    </div>
    <div class="eps">
      <div :key="index" v-for="(group, index) in epGroups">
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

const epGroups = computed(() => groupAlbumVariants(artistStore.eps));
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.eps {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
}
</style>
