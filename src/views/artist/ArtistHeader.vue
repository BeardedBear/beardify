<template>
  <div class="header">
    <div class="title">
      {{ store.state.artist.artist.name }}
    </div>
    <div class="header-links">
      <a
        @click="openLink(`https://fr.wikipedia.org/wiki/${store.state.artist.artist.name}`)"
        class="header-links__item"
      >
        <i class="icon-wikipedia"></i>Wikipedia</a
      >
      <a
        @click="
          openLink(
            `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${store.state.artist.artist.name
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}&amp;x=0&amp;y=0`
          )
        "
        class="header-links__item"
      >
        <i class="icon-sputnik"></i>Sputnik</a
      >
      <a
        @click="openLink(`https://www.discogs.com/fr/search/?q=${store.state.artist.artist.name}&amp;strict=true`)"
        class="header-links__item"
      >
        <i class="icon-discogs"></i>Discogs</a
      >
      <a
        @click="openLink(`https://www.google.com/search?q=${store.state.artist.artist.name}`)"
        class="header-links__item"
      >
        <i class="icon-google"></i>Google</a
      >
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/rootStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();

    function openLink(url: string) {
      window.open(url, "_blank");
    }

    return { store, openLink };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.title {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 10px;
}
.header {
  margin-bottom: 30px;

  &-links {
    display: flex;
    align-items: center;
    gap: 20px;

    &__item {
      display: flex;
      align-items: center;
      gap: 7px;
      text-decoration: none;
      color: currentColor;
      opacity: 0.3;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
