<template>
  <div class="options">
    <ArtistLinks :artist-name="artistStore.artist.name" />
    <ShareContent :beardify-url="$route.fullPath" :spotify-url="artistStore.artist.external_urls.spotify" />
    <ButtonIndex
      :title="artistStore.artist.followers.total + ' followers'"
      @click="switchFollow(artistStore.artist.id)"
      class="follow"
      variant="primary"
      v-if="artistStore.followStatus"
    >
      Followed
    </ButtonIndex>
    <ButtonIndex @click="switchFollow(artistStore.artist.id)" class="follow" v-else>Follow</ButtonIndex>
  </div>
</template>

<script lang="ts" setup>
import { useArtist } from "../../views/artist/ArtistStore";
import ArtistLinks from "./ArtistLinks.vue";
import ButtonIndex from "../ButtonIndex.vue";
import ShareContent from "../ShareContent.vue";

const artistStore = useArtist();

function switchFollow(artistId: string): void {
  artistStore.switchFollow(artistId);
}
</script>

<style lang="scss" scoped>
.options {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.follow {
  width: 6rem;
}
</style>
