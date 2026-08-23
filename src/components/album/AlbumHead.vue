<template>
  <div class="album-header">
    <div>
      <h1 class="title font-bold">
        {{ album.name }}
      </h1>
      <div class="infos">
        <ArtistList :artist-list="album.artists" />
        <span>&nbsp;·&nbsp;</span>
        <span v-if="album.release_date_precision === 'year'">{{ album.release_date }}</span>
        <span v-else-if="album.release_date_precision === 'month'">{{ album.release_date.split("-").shift() }}</span>
        <span v-else>{{ date(album.release_date) }}</span>
        <span>&nbsp;·&nbsp;</span>
        <span>{{ timecodeWithUnits(sumDuration(album.tracks.items)) }}</span>
      </div>
    </div>
    <div>
      <div class="options">
        <div class="links">
          <BdButton
            icon-only
            variant="nude"
            @click="openLink(`https://www.google.com/search?q=${album.artists[0].name}+${album.name}`)"
          >
            <i class="icon-google" />
          </BdButton>
          <BdButton
            icon-only
            variant="nude"
            @click="openLink(`https://www.discogs.com/fr/search/?q=${album.artists[0].name}+${album.name}+&type=all`)"
          >
            <i class="icon-discogs" />
          </BdButton>
        </div>
        <ShareContent :beardify-url="$route.fullPath" :spotify-url="props.album.external_urls.spotify" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdButton } from "bearded-ui";

import { Album } from "@/@types/Album";
import { Track, TrackSimplified } from "@/@types/Track";
import ArtistList from "@/components/artist/ArtistList.vue";
import ShareContent from "@/components/ui/ShareContent.vue";
import { date, timecodeWithUnits } from "@/helpers/date";
import { openLink } from "@/helpers/openLink";

const props = defineProps<{ album: Album }>();

function sumDuration(tracks: Track[] | TrackSimplified[]): number {
  return tracks.map((t: Track | TrackSimplified) => t.duration_ms).reduce((acc, value) => acc + value, 0);
}
</script>

<style scoped>

.album-header {
  display: flex;
  justify-content: space-between;

  @media (--mobile) {
    flex-direction: column;
    gap: 1rem;
  }
}

.infos {
  color: var(--font-color-darker);

  /* opacity: 0.4; */
}

.title {
  font-size: var(--font-size-xl);
  margin-bottom: 0.4rem;
}

.options {
  align-items: center;
  display: flex;
  gap: 1rem;
}

.links {
  align-items: center;
  display: flex;

  /* gap: 0.5rem; */
}
</style>
