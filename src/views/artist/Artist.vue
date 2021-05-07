<template>
  <div ref="artistpage" class="overflowed">
    <div class="artist-page overflowed__target">
      <div class="header">
        <div class="title">
          {{ store.state.artist.artist.name }}
        </div>
        <div class="header-links">
          <a
            :href="`https://fr.wikipedia.org/wiki/${store.state.artist.artist.name}`"
            class="header-links__item"
            target="_blank"
          >
            <i class="icon-wikipedia"></i>Wikipedia</a
          >
          <a
            :href="
              `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${store.state.artist.artist.name}&amp;x=0&amp;y=0`
            "
            class="header-links__item"
            target="_blank"
          >
            <i class="icon-sputnik"></i>Sputnik</a
          >
          <a
            :href="`https://www.discogs.com/fr/search/?q=${store.state.artist.artist.name}&amp;strict=true`"
            class="header-links__item"
            target="_blank"
          >
            <i class="icon-discogs"></i>Discogs</a
          >
          <a
            :href="`https://www.google.com/search?q=${store.state.artist.artist.name}`"
            class="header-links__item"
            target="_blank"
          >
            <i class="icon-google"></i>Google</a
          >
        </div>
      </div>
      <div class="content">
        <div>
          <div class="heading">Albums</div>
          <div class="albums">
            <div v-for="(album, _, index) in store.state.artist.albums" :key="index">
              <Album :album="album" :currentlyPlayedId="store.state.player.currentlyPlaying.item.album.uri" />
            </div>
          </div>
        </div>
        <div class="top"><TopTracks class="top__item" /> <RelatedArtists class="top__item" /></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useStore } from "vuex";
import { RootState } from "../../@types/rootStore";
import { ArtistActions } from "./ArtistStore";
import { timecode } from "../../helpers/date";
import TopTracks from "./TopTracks.vue";
import RelatedArtists from "./RelatedArtists.vue";
import Album from "../../components/Album.vue";

export default defineComponent({
  components: { Album, TopTracks, RelatedArtists },
  props: {
    id: { default: "", type: String }
  },
  setup(props) {
    const store = useStore<RootState>();
    const artistpage = ref();

    onBeforeRouteUpdate(to => {
      store.dispatch(`artist/${ArtistActions.getArtist}`, to.params.id);
      store.dispatch(`artist/${ArtistActions.getTopTracks}`, to.params.id);
      store.dispatch(`artist/${ArtistActions.getAlbums}`, to.params.id);
      store.dispatch(`artist/${ArtistActions.getRelatedArtists}`, to.params.id);
      artistpage.value.scrollTop = 0;
    });

    store.dispatch(`artist/${ArtistActions.getArtist}`, props.id);
    store.dispatch(`artist/${ArtistActions.getTopTracks}`, props.id);
    store.dispatch(`artist/${ArtistActions.getAlbums}`, props.id);
    store.dispatch(`artist/${ArtistActions.getRelatedArtists}`, props.id);

    return { artistpage, store, timecode };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.overflowed {
  scroll-behavior: smooth;
}
.albums {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.content {
  display: flex;
  gap: 40px;
}

.top {
  flex: 0 0 350px;

  &__item {
    margin-bottom: 40px;
  }
}
.artist-page {
  padding: 30px 40px;
}
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

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
