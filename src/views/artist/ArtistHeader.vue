<template>
  <div class="header" :class="{ scrolled: scrolledHead }">
    <div>
      <div class="title">
        <div class="name" :class="{ scrolled: scrolledHead }">
          {{ store.state.artist.artist.name }}
        </div>
      </div>
      <div class="header-links">
        <a
          class="header-links__item"
          @click="openLink(`https://fr.wikipedia.org/wiki/${store.state.artist.artist.name}`)"
        >
          <i class="icon-wikipedia"
        /></a>
        <a
          class="header-links__item"
          @click="
            openLink(
              `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${store.state.artist.artist.name
                .normalize('NFKC')
                .replaceAll(/[\u0300-\u036f]/g, '')}&amp;x=0&amp;y=0`,
            )
          "
        >
          <i class="icon-sputnik"
        /></a>
        <a
          class="header-links__item"
          @click="openLink(`https://www.discogs.com/fr/search/?q=${store.state.artist.artist.name}&amp;strict=true`)"
        >
          <i class="icon-discogs"
        /></a>
        <a
          class="header-links__item"
          @click="
            openLink(
              `https://rateyourmusic.com/artist/${store.state.artist.artist.name
                .normalize('NFKC')
                .toLowerCase()
                .replaceAll(' ', '-')
                .replaceAll(',', '')
                .replaceAll('\'', '')
                .replace(/[\u0300-\u036f]/g, '')}`,
            )
          "
        >
          <i class="icon-rym"
        /></a>
        <a
          class="header-links__item"
          @click="openLink(`https://www.google.com/search?q=${store.state.artist.artist.name}+band+artist`)"
        >
          <i class="icon-google"
        /></a>
        <a
          class="header-links__item"
          @click="
            openLink(`https://www.youtube.com/results?search_query=${store.state.artist.artist.name}+band+artist`)
          "
        >
          <i class="icon-youtube"
        /></a>
      </div>
    </div>
    <div>
      <div
        v-if="store.state.artist.followStatus"
        class="follow button button--primary"
        @click="switchFollow(store.state.artist.artist.id)"
      >
        Suivi
      </div>
      <div v-else class="follow button" @click="switchFollow(store.state.artist.artist.id)">Suivre</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { ArtistActions } from "./ArtistStore";

export default defineComponent({
  props: {
    scrolledHead: {
      default: false,
      type: Boolean as PropType<boolean>,
    },
  },
  setup() {
    const store = useStore<RootState>();

    function openLink(url: string): void {
      window.open(url, "_blank");
    }

    function switchFollow(artistId: string): void {
      store.dispatch(ArtistActions.switchFollow, artistId);
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
  transition: font-size ease 0.2s;

  &.scrolled {
    font-size: 1.6rem;
  }
}

.follow {
  width: 100px;
  text-align: center;
}
.header {
  padding: 30px 40px 10px;
  background-color: var(--bg-color-darker);
  z-index: 2;
  transition: transform ease 0.1s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  top: 0;
  position: sticky;
  height: 120px;

  &.scrolled {
    transform: translateY(-25px);
    background-color: var(--bg-color-dark);
  }

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
      font-size: 1rem;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
