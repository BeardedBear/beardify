<template>
  <div v-if="artistStore.singles.length" class="content-block">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="heading sticky-heading">
      <i class="icon-single" />
      Singles
    </div>
    <div class="singles">
      <div v-for="album in sortedSingles" :key="album.id">
        <SingleTrack :single="album" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import SingleTrack from "@/components/artist/SingleTrack.vue";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();

// Copy before sorting: never mutate the store array during render.
const sortedSingles = computed(() =>
  [...artistStore.singles].sort(
    (a, b) => parseInt(b.release_date, 10) - parseInt(a.release_date, 10),
  ),
);
</script>
