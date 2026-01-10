<template>
  <div class="options">
    <ArtistLinks :artist-name="artistStore.artist.name" />
    <ShareContent :beardify-url="$route.fullPath" :spotify-url="artistStore.artist.external_urls.spotify" />
    <ButtonIndex
      v-if="artistStore.followStatus"
      :title="artistStore.artist.followers.total + ' followers'"
      class="follow"
      variant="primary"
      @click="switchFollow(artistStore.artist.id)"
    >
      Followed
    </ButtonIndex>
    <ButtonIndex v-else class="follow" @click="switchFollow(artistStore.artist.id)">Follow</ButtonIndex>
  </div>
</template>

<script lang="ts" setup>
import ArtistLinks from "@/components/artist/ArtistLinks.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import ShareContent from "@/components/ui/ShareContent.vue";
import { useArtist } from "@/views/artist/ArtistStore";

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
