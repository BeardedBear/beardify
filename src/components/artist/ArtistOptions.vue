<template>
  <div class="options">
    <div class="links">
      <a class="links__item" @click="openFrame(link.wikipedia)"><i class="icon-wikipedia" /></a>
      <a class="links__item" @click="openFrame(link.sputnik)"><i class="icon-sputnik" /></a>
      <a class="links__item" @click="openFrame(link.google)"><i class="icon-google" /></a>
      <span class="separator">|</span>
      <a class="links__item" @click="openLink(link.lastfm)"><i class="icon-lastfm" /></a>
      <a class="links__item" @click="openLink(link.discogs)"><i class="icon-discogs" /></a>
      <a class="links__item" @click="openLink(link.rym)"><i class="icon-rym" /></a>
      <a class="links__item" @click="openLink(link.youtube)"><i class="icon-youtube" /></a>
    </div>
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
import { normalize } from "normalize-diacritics";
import { onMounted, ref } from "vue";
import { useArtist } from "../../views/artist/ArtistStore";
import ShareContent from "../ShareContent.vue";
import { useFrame } from "../frame/FrameStore";

const artistStore = useArtist();
const artistNameNormalized = ref<string>("");
const frameStore = useFrame();
const link = ref<Record<string, string>>({});

function openLink(url: string): void {
  window.open(url, "_blank");
}

function openFrame(url: string): void {
  frameStore.open(url);
}

function switchFollow(artistId: string): void {
  artistStore.switchFollow(artistId);
}

onMounted(async () => {
  artistNameNormalized.value = (await normalize(artistStore.artist.name))
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("&", "and");
  link.value = {
    wikipedia: `https://en.wikipedia.org/wiki/${artistNameNormalized.value}`,
    sputnik: `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${artistNameNormalized.value}&amp;x=0&amp;y=0`,
    google: `https://www.google.com/search?q=${artistNameNormalized.value}&igu=1`,
    lastfm: `https://www.last.fm/music/${artistNameNormalized.value}`,
    discogs: `https://www.discogs.com/artist/${artistNameNormalized.value}`,
    rym: `https://rateyourmusic.com/search?searchtype=a&searchterm=${artistNameNormalized.value}`,
    youtube: `https://www.youtube.com/results?search_query=${artistNameNormalized.value}`,
  };
});
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

.links {
  align-items: center;
  display: flex;
  gap: 0.7rem;

  .separator {
    color: rgb(125 125 125 / 50%);
  }

  &__item {
    align-items: center;
    color: currentcolor;
    cursor: pointer;
    display: flex;
    font-size: 1rem;
    opacity: 0.3;
    text-decoration: none;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
