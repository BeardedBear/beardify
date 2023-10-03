<template>
  <div class="options">
    <ArtistLinks :artist-name="artistStore.artist.name" />
    <ShareContent :spotify-url="artistStore.artist.external_urls.spotify" :beardify-url="$route.fullPath" />
    <div
      v-if="artistStore.followStatus"
      class="follow button button--primary"
      :title="artistStore.artist.followers.total + ' followers'"
      @click="switchFollow(artistStore.artist.id)"
    >
      Followed
    </div>
    <div v-else class="follow button" @click="switchFollow(artistStore.artist.id)">Follow</div>
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
@import "../../assets/scss/colors";

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
