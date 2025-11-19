<template>
  <div class="album-header">
    <div>
      <div class="title">{{ album.name }}</div>
      <div class="infos">
        <ArtistList :artist-list="album.artists" />
        —
        <span v-if="album.release_date_precision === 'year'">{{ album.release_date }}</span>
        <span v-else-if="album.release_date_precision === 'month'">{{ album.release_date.split("-").shift() }}</span>
        <span v-else>{{ date(album.release_date) }}</span>
        —
        <span>{{ timecodeWithUnits(sumDuration(album.tracks.items)) }}</span>
      </div>
    </div>
    <div>
      <div class="options">
        <div class="links">
          <ButtonIndex
            icon-only
            variant="nude"
            @click="openLink(`https://www.google.com/search?q=${album.artists[0].name}+${album.name}`)"
          >
            <i class="icon-google" />
          </ButtonIndex>
          <ButtonIndex
            icon-only
            variant="nude"
            @click="openLink(`https://www.discogs.com/fr/search/?q=${album.artists[0].name}+${album.name}+&type=all`)"
          >
            <i class="icon-discogs" />
          </ButtonIndex>
        </div>
        <ShareContent :beardify-url="$route.fullPath" :spotify-url="props.album.external_urls.spotify" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Album } from "@/@types/Album";
import { Track, TrackSimplified } from "@/@types/Track";
import { date, timecodeWithUnits } from "@/helpers/date";
import ArtistList from "@/components/artist/ArtistList.vue";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import ShareContent from "@/components/ui/ShareContent.vue";

const props = defineProps<{ album: Album }>();

function sumDuration(tracks: Track[] | TrackSimplified[]): number {
  return tracks.map((t: Track | TrackSimplified) => t.duration_ms).reduce((acc, value) => acc + value, 0);
}

function openLink(url: string): void {
  window.open(url, "_blank");
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/colors" as colors;
@use "@/assets/scss/responsive" as responsive;

.album-header {
  display: flex;
  justify-content: space-between;

  @include responsive.l {
    flex-direction: column;
  }
}

.infos {
  opacity: 0.4;
}

.title {
  font-size: 2rem;
  font-weight: bold;
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

  // gap: 0.5rem;
}
</style>
