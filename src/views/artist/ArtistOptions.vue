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
            `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${artistStore.artist.name
              .normalize('NFKC')
              .replaceAll(/[\u0300-\u036f]/g, '')}&amp;x=0&amp;y=0`,
          )
        "
      >
        <i class="icon-sputnik" />
      </a>
      <a
        class="links__item"
        @click="openLink(`https://www.last.fm/fr/music/${artistStore.artist.name.replaceAll(' ', '+')}`)"
      >
        <i class="icon-lastfm" />
      </a>
      <a
        class="links__item"
        @click="openLink(`https://www.discogs.com/fr/search/?q=${artistStore.artist.name}&amp;strict=true`)"
      >
        <i class="icon-discogs" />
      </a>
      <a
        class="links__item"
        @click="
          openLink(
            `https://rateyourmusic.com/artist/${artistStore.artist.name
              .normalize('NFKC')
              .toLowerCase()
              .replaceAll(' ', '-')
              .replaceAll(',', '')
              .replaceAll('\'', '')
              .replace(/[\u0300-\u036f]/g, '')}`,
          )
        "
      >
        <i class="icon-rym" />
      </a>
      <a
        class="links__item"
        @click="openLink(`https://www.google.com/search?q=${artistStore.artist.name}+band+artist`)"
      >
        <i class="icon-google" />
      </a>
      <a
        class="links__item"
        @click="openLink(`https://www.youtube.com/results?search_query=${artistStore.artist.name}+band+artist`)"
      >
        <i class="icon-youtube" />
      </a>
    </div>
    <div class="followers">{{ artistStore.artist.followers.total }} followers</div>
    <div
      v-if="artistStore.followStatus"
      class="follow button button--primary"
      @click="switchFollow(artistStore.artist.id)"
    >
      Suivi
    </div>
    <div v-else class="follow button" @click="switchFollow(artistStore.artist.id)">Suivre</div>
  </div>
</template>

<script lang="ts" setup>
import { useArtist } from "./ArtistStore";

const artistStore = useArtist();

function openLink(url: string): void {
  window.open(url, "_blank");
}

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

  .followers {
    font-style: italic;
    opacity: 0.3;
  }
}

.follow {
  text-align: center;
  width: 5rem;
}

.links {
  align-items: center;
  display: flex;
  gap: 0.7rem;

  &__item {
    align-items: center;
    color: currentColor;
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
