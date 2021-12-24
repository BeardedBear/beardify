<template>
  <div class="album-header">
    <div>
      <div class="title">{{ album.name }}</div>
      <div class="infos">
        <ArtistList :artist-list="album.artists" />
        ·
        <span v-if="album.release_date_precision === 'year'">{{ album.release_date }}</span>
        <span v-else-if="album.release_date_precision === 'month'">{{ album.release_date.split("-").shift() }}</span>
        <span v-else>{{ date(album.release_date) }}</span>
        ·
        <span>{{ timecodeWithUnits(sumDuration(album.tracks.items)) }}</span>
      </div>
    </div>
    <div>
      <div class="options">
        <div>
          <a
            class="button button--nude"
            @click="openLink(`https://www.google.com/search?q=${album.artists[0].name}+${album.name}`)"
          >
            <i class="icon-google" />
          </a>
          <a
            class="button button--nude"
            @click="openLink(`https://www.discogs.com/fr/search/?q=${album.artists[0].name}+${album.name}+&type=all`)"
          >
            <i class="icon-discogs" />
          </a>
        </div>
        <ShareContent :spotify-url="props.album.external_urls.spotify" :beardify-url="$route.fullPath" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { timecodeWithUnits, date } from "../../helpers/date";
import { Track, TrackSimplified } from "../../@types/Track";
import ArtistList from "../artist/ArtistList.vue";
import ShareContent from "../ShareContent.vue";
import { Album } from "../../@types/Album";

const props = defineProps<{ album: Album }>();

function sumDuration(tracks: TrackSimplified[] | Track[]): number {
  return tracks.map((t: TrackSimplified | Track) => t.duration_ms).reduce((acc, value) => acc + value, 0);
}

function openLink(url: string): void {
  window.open(url, "_blank");
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.album-header {
  display: flex;
  justify-content: space-between;
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
</style>
