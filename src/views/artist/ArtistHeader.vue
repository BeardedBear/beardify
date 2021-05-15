<template>
  <div class="header">
    <div class="title">
      <div class="name">
        {{ store.state.artist.artist.name }}
      </div>
      <div
        v-if="store.state.artist.followStatus"
        class="follow button button--primary"
        @click="switchFollow(store.state.artist.artist.id)"
      >
        Suivi
      </div>
      <div v-else class="follow button" @click="switchFollow(store.state.artist.artist.id)">Suivre</div>
    </div>
    <div class="header-links">
      <a
        class="header-links__item"
        @click="openLink(`https://fr.wikipedia.org/wiki/${store.state.artist.artist.name}`)"
      >
        <i class="icon-wikipedia" />Wikipedia</a
      >
      <a
        class="header-links__item"
        @click="
          openLink(
            `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${store.state.artist.artist.name
              .normalize('NFKC')
              .replaceAll(/[\u0300-\u036f]/g, '')}&amp;x=0&amp;y=0`
          )
        "
      >
        <i class="icon-sputnik" />Sputnik</a
      >
      <a
        class="header-links__item"
        @click="openLink(`https://www.discogs.com/fr/search/?q=${store.state.artist.artist.name}&amp;strict=true`)"
      >
        <i class="icon-discogs" />Discogs</a
      >
      <a
        class="header-links__item"
        @click="
          openLink(
            `https://rateyourmusic.com/artist/${store.state.artist.artist.name
              .normalize('NFKC')
              .toLowerCase()
              .replaceAll(' ', '-')
              .replaceAll('\'', '')
              .replace(/[\u0300-\u036f]/g, '')}`
          )
        "
      >
        <i class="icon-rym" />RYM</a
      >
      <a
        class="header-links__item"
        @click="openLink(`https://www.google.com/search?q=${store.state.artist.artist.name}+band+artist`)"
      >
        <i class="icon-google" />Google</a
      >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { ArtistActions } from "./ArtistStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    function openLink(url: string) {
      window.open(url, "_blank");
    }

    function switchFollow(artistId: string) {
      store.dispatch(`artist/${ArtistActions.switchFollow}`, artistId);
    }

    return { store, openLink, switchFollow };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.title {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name {
  font-size: 2rem;
  font-weight: 300;
}

.follow {
  width: 100px;
  text-align: center;
}
.header {
  margin-bottom: 30px;

  &-links {
    display: flex;
    align-items: center;
    margin-right: 20px;

    &__item {
      display: flex;
      align-items: center;
      margin-right: 20px;
      text-decoration: none;
      color: currentColor;
      opacity: 0.3;
      cursor: pointer;

      i {
        margin-right: 10px;
      }

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
