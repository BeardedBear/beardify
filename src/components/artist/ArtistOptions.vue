<template>
  <div class="options">
    <ArtistLinks :artist-name="artistStore.artist.name" />
    <ShareContent :beardify-url="$route.fullPath" :spotify-url="artistStore.artist.external_urls.spotify" />
    <BdTooltip v-if="artistStore.followStatus" :content="`${artistStore.artist.followers.total} followers`" bare>
      <BdButton class="follow" variant="primary" @click="switchFollow(artistStore.artist.id)">Followed</BdButton>
    </BdTooltip>
    <BdButton v-else class="follow" @click="switchFollow(artistStore.artist.id)">Follow</BdButton>
  </div>
</template>

<script lang="ts" setup>
import { BdButton, BdTooltip } from "bearded-ui";

import ArtistLinks from "@/components/artist/ArtistLinks.vue";
import ShareContent from "@/components/ui/ShareContent.vue";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();

function switchFollow(artistId: string): void {
  artistStore.switchFollow(artistId);
}
</script>

<style scoped>
.options {
  align-items: center;
  display: flex;
  gap: var(--bd-space-4);
}

.follow {
  width: 6rem;
}
</style>
