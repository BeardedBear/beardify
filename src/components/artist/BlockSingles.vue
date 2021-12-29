<template>
  <div v-if="artistStore.singles.length" class="content__block">
    <div class="heading sticky-heading" :style="{ top: artistStore.headerHeight + 'px' }">
      <i class="icon-single"></i>
      Singles
    </div>
    <div class="singles">
      <div
        v-for="(album, index) in artistStore.singles.sort(
          (a, b) => parseInt(b.release_date, 10) - parseInt(a.release_date, 10),
        )"
        :key="index"
      >
        <SingleTrack :single="album" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useArtist } from "../../views/artist/ArtistStore";
import SingleTrack from "./SingleTrack.vue";

const artistStore = useArtist();
</script>
