<template>
  <div class="album-header">
    <div>
      <div class="title">
        {{ album.name }}
      </div>
      <div>
        <ArtistList :artist-list="album.artists" />
        ·
        <span>{{ album.release_date.split("-").shift() }}</span>
        ·
        <span>{{ timecodeWithUnits(sumDuration(album.tracks.items)) }}</span>
      </div>
    </div>
    <div>
      <span v-if="copySpotify.copied.value" class="copied">Copied</span>
      <button class="copy button button--nude" @click="copySpotify.copy()">
        <i class="icon-share"></i>
      </button>
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
  </div>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { timecodeWithUnits } from "../../helpers/date";
import { Track, TrackSimplified } from "../../@types/Track";
import ArtistList from "../../components/ArtistList.vue";
import { Album } from "../../@types/Album";
import { useClipboard } from "@vueuse/core";

const props = defineProps<{ album: Album }>();
const spotifyUrl = ref<string>(`https://open.spotify.com/album/${props.album.id}`);
const copySpotify = useClipboard({ source: spotifyUrl });

// https://open.spotify.com/album/6lsuWX8465h9ddhhO7YOTo?si=CdnDmSBhRqCJZQLzBYJ-EQ&dl_branch=1
// http://localhost:3000/album/6lsuWX8465h9ddhhO7YOTo

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
  margin: 0 auto 60px;
  max-width: 935px;
}

.title {
  font-size: 2rem;
  font-weight: 100;
  margin-bottom: 5px;
}

@keyframes pop {
  from {
    opacity: 0;
  }
}
.copied {
  animation: pop 0.2s ease both;
  margin-right: 10px;
  opacity: 0.5;
}
</style>
