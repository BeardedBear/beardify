<template>
  <div ref="artistpage" class="overflowed">
    <div class="artist-page overflowed__target">
      <ArtistHeader />
      <div class="content">
        <div>
          <div class="content__block" v-if="store.state.artist.albums.length">
            <div class="heading">Albums</div>
            <div class="albums">
              <div v-for="(album, index) in store.state.artist.albums" :key="index">
                <Album :album="album" :currentlyPlayedId="store.state.player.currentlyPlaying.item.album.uri" />
              </div>
            </div>
          </div>
          <div class="content__block" v-if="store.state.artist.eps.length">
            <div class="heading">EP's</div>
            <div class="eps">
              <div v-for="(album, index) in store.state.artist.eps" :key="index">
                <Album :album="album" :currentlyPlayedId="store.state.player.currentlyPlaying.item.album.uri" />
              </div>
            </div>
          </div>
          <div class="content__block" v-if="store.state.artist.singles.length">
            <div class="heading">Singles</div>
            <div class="singles">
              <div v-for="(album, index) in store.state.artist.singles" :key="index">
                <Album :album="album" :currentlyPlayedId="store.state.player.currentlyPlaying.item.album.uri" />
              </div>
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
import { RootState } from "../../@types/RootState";
import { ArtistActions } from "./ArtistStore";
import { timecode } from "../../helpers/date";
import TopTracks from "./TopTracks.vue";
import RelatedArtists from "./RelatedArtists.vue";
import Album from "../../components/Album.vue";
import ArtistHeader from "./ArtistHeader.vue";

export default defineComponent({
  components: { ArtistHeader, Album, TopTracks, RelatedArtists },
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
      store.dispatch(`artist/${ArtistActions.getSingles}`, to.params.id);
      store.dispatch(`artist/${ArtistActions.getFollowStatus}`, to.params.id);
      artistpage.value.scrollTop = 0;
    });

    store.dispatch(`artist/${ArtistActions.getArtist}`, props.id);
    store.dispatch(`artist/${ArtistActions.getTopTracks}`, props.id);
    store.dispatch(`artist/${ArtistActions.getAlbums}`, props.id);
    store.dispatch(`artist/${ArtistActions.getRelatedArtists}`, props.id);
    store.dispatch(`artist/${ArtistActions.getSingles}`, props.id);
    store.dispatch(`artist/${ArtistActions.getFollowStatus}`, props.id);

    return { artistpage, store, timecode };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.overflowed {
  scroll-behavior: smooth;
}
.albums {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;

  @include tablet {
    grid-template-columns: 1fr 1fr;
  }
}
.eps {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
}

.singles {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
}

.content {
  display: flex;
  gap: 40px;

  &__block {
    margin-bottom: 60px;
  }
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
</style>
