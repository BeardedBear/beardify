<template>
  <div v-if="artistStore.singles.length" class="content-block">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">
      <i class="icon-single" />
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
import SingleTrack from "@/components/artist/SingleTrack.vue";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();
</script>
