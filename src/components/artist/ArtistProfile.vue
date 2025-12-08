<template>
  <div class="profile" v-if="artistStore.discogsArtist?.profile">
    {{ artistStore.discogsArtist.profile }}
  </div>
</template>

<script lang="ts" setup>
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();
</script>

<style lang="scss" scoped>
.profile {
  color: var(--font-color-light);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-top: 0.5rem;
  max-width: 60rem;
  opacity: 0.5;
}
</style>
