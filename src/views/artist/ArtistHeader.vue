<template>
  <div class="header" :class="{ scrolled: scrolledHead }">
    <div>
      <div class="title">
        <div class="name" :class="{ scrolled: scrolledHead }">{{ artistStore.artist.name }}</div>
      </div>
      <div class="genres">
        <span v-for="(genre, index) in artistStore.artist.genres" :key="index" class="genre">{{ genre }}</span>
      </div>
    </div>
    <div class="options">
      <div class="header-links">
        <a class="header-links__item" @click="openLink(`https://fr.wikipedia.org/wiki/${artistStore.artist.name}`)">
          <i class="icon-wikipedia" />
        </a>
        <a
          class="header-links__item"
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
          class="header-links__item"
          @click="openLink(`https://www.discogs.com/fr/search/?q=${artistStore.artist.name}&amp;strict=true`)"
        >
          <i class="icon-discogs" />
        </a>
        <a
          class="header-links__item"
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
          class="header-links__item"
          @click="openLink(`https://www.google.com/search?q=${artistStore.artist.name}+band+artist`)"
        >
          <i class="icon-google" />
        </a>
        <a
          class="header-links__item"
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
  </div>
</template>

<script lang="ts" setup>
import { defineProps, PropType } from "vue";
import { useArtist } from "./ArtistStore";

defineProps({
  scrolledHead: {
    default: false,
    type: Boolean as PropType<boolean>,
  },
});

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

.genres {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  opacity: 0.3;

  .genre {
    background-color: var(--bg-color-lighter);
    border-radius: 30px;
    color: currentColor;
    font-size: 0.8rem;
    padding: 1px 7px 2px;
  }
}

.options {
  align-items: center;
  display: flex;
  gap: 20px;

  .followers {
    font-style: italic;
    opacity: 0.3;
  }
}

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.name {
  font-size: 2rem;
  font-weight: 300;
  transition: font-size ease 0.2s;

  &.scrolled {
    font-size: 1.6rem;
  }
}

.follow {
  text-align: center;
  width: 100px;
}

.header {
  align-items: center;
  background-color: var(--bg-color-darker);
  display: flex;
  justify-content: space-between;
  padding: 10px 40px;
  position: sticky;
  top: 0;
  transition: transform ease 0.1s;
  z-index: 2;

  &.scrolled {
    background-color: var(--bg-color-dark);
    transform: translateY(-25px);
  }

  &-links {
    align-items: center;
    display: flex;
    margin-right: 20px;

    &__item {
      align-items: center;
      color: currentColor;
      cursor: pointer;
      display: flex;
      font-size: 1rem;
      margin-right: 20px;
      opacity: 0.3;
      text-decoration: none;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
