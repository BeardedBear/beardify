<template>
  <div class="overflowed">
    <div class="artist-page overflowed__target">
      <div class="title">
        {{ store.state.artist.artist.name }}
      </div>
      <div class="content">
        <div>
          <div class="heading">Albums</div>
          <div class="albums">
            <div v-for="(album, _, index) in store.state.artist.albums.items" :key="index">
              <Album :album="album" />
            </div>
          </div>
        </div>
        <TopTracks class="top" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useStore } from "vuex";
import { RootState } from "../../@types/rootStore";
import { ArtistActions } from "./ArtistStore";
import { timecode } from "../../helpers/date";
import TopTracks from "./TopTracks.vue";
import Album from "../../components/Album.vue";

export default defineComponent({
  components: { Album, TopTracks },
  props: {
    id: { default: "", type: String }
  },
  setup(props) {
    const store = useStore<RootState>();

    onBeforeRouteUpdate(to => {
      store.dispatch(`artist/${ArtistActions.getArtist}`, to.params.id);
      store.dispatch(`artist/${ArtistActions.getTopTracks}`, to.params.id);
      store.dispatch(`artist/${ArtistActions.getAlbums}`, to.params.id);
    });

    store.dispatch(`artist/${ArtistActions.getArtist}`, props.id);
    store.dispatch(`artist/${ArtistActions.getTopTracks}`, props.id);
    store.dispatch(`artist/${ArtistActions.getAlbums}`, props.id);

    onMounted(() => {
      console.log("mounted");
    });

    return { store, timecode };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
.albums {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
}

.content {
  display: flex;
  gap: 30px;
}

.top {
  flex: 0 0 350px;
}
.artist-page {
  padding: 30px 40px;
}
.title {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 20px;
  // position: sticky;
  // top: -1px;
  // background: $bg-color-darker;
}
</style>
