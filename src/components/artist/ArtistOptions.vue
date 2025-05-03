<template>
  <div class="options">
    <ArtistLinks :artist-name="artistStore.artist.name" />
    <ShareContent :beardify-url="$route.fullPath" :spotify-url="artistStore.artist.external_urls.spotify" />
    <div
      :title="artistStore.artist.followers.total + ' followers'"
      @click="switchFollow(artistStore.artist.id)"
      class="follow button button--primary"
      v-if="artistStore.followStatus"
    >
      Followed
    </div>
    <div @click="switchFollow(artistStore.artist.id)" class="follow button" v-else>Follow</div>
  </div>
</template>

<script lang="ts" setup>
import { useArtist } from "../../views/artist/ArtistStore";
import ShareContent from "../ShareContent.vue";
import ArtistLinks from "./ArtistLinks.vue";

const artistStore = useArtist();

function switchFollow(artistId: string): void {
  artistStore.switchFollow(artistId);
}
</script>

<style lang="scss" scoped>
@use "../../assets/scss/colors" as colors;

.options {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.follow {
  text-align: center;
  width: 6rem;
}
</style>
