<template>
  <div class="options">
    <div class="links">
      <a class="links__item" @click="openLink(`https://fr.wikipedia.org/wiki/${artistStore.artist.name}`)">
        <i class="icon-wikipedia" />
      </a>
      <a
        class="links__item"
        @click="
          openLink(
            `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${artistNameNormalized}&amp;x=0&amp;y=0`,
          )
        "
      >
        <i class="icon-sputnik" />
      </a>
      <a class="links__item" @click="openLink(`https://www.last.fm/fr/music/${artistNameNormalized}`)">
        <i class="icon-lastfm" />
      </a>
      <a
        class="links__item"
        @click="openLink(`https://www.discogs.com/fr/search/?q=${artistNameNormalized}&amp;strict=true`)"
      >
        <i class="icon-discogs" />
      </a>
      <a
        class="links__item"
        @click="openLink(`https://rateyourmusic.com/search?searchterm=${artistNameNormalized}&searchtype=a`)"
      >
        <i class="icon-rym" />
      </a>
      <a class="links__item" @click="openLink(`https://www.google.com/search?q=${artistNameNormalized}+band+artist`)">
        <i class="icon-google" />
      </a>
      <a
        class="links__item"
        @click="openLink(`https://www.youtube.com/results?search_query=${artistNameNormalized}+band+artist`)"
      >
        <i class="icon-youtube" />
      </a>
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

const artistStore = useArtist();
const artistNameNormalized = ref<string>("");

function openLink(url: string): void {
  window.open(url, "_blank");
}

function switchFollow(artistId: string): void {
  artistStore.switchFollow(artistId);
}

onMounted(async () => {
  artistNameNormalized.value = (await normalize(artistStore.artist.name))
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("&", "and");
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
