<template>
  <div class="content__block" v-if="artistStore.singles.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">
      <i class="icon-single" />
      Singles
    </div>
    <div class="singles">
      <div
        :key="index"
        v-for="(album, index) in artistStore.singles.sort(
          (a, b) => parseInt(b.release_date, 10) - parseInt(a.release_date, 10),
        )"
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
