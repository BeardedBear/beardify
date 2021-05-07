<template>
  <div ref="albumpage" class="overflowed">
    <div class="album-page overflowed__target">
      <div class="album-header">
        <div class="title">{{ store.state.album.album.name }}</div>
        <div>
          <ArtistList :artistList="store.state.album.album.artists" />
          ·
          <span>{{ store.state.album.album.release_date.split("-").shift() }}</span>
          ·
          <span>30min</span>
        </div>
      </div>
      <div class="content">
        <div class="content__cover" data-aos="fade-right">
          <img class="cover" :src="store.state.album.album.images[0].url" />
        </div>
        <div class="content__tracks" data-aos="fade-left">
          <div
            class="track"
            :class="{ 'track--active': store.state.player.currentlyPlaying.item.id === track.id }"
            v-for="(track, _, index) in store.state.album.album.tracks.items"
            :key="index"
          >
            <div>
              <span class="track__number">{{ track.track_number }}.</span>
              {{ track.name }}
              <ArtistList
                :artistList="track.artists.filter(e => e.name !== store.state.album.album.artists[0].name)"
                feat
              />
            </div>
            <div>{{ timecode(track.duration_ms) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useStore } from "vuex";
import { RootState } from "../../@types/rootStore";
import { timecode } from "../../helpers/date";
import { AlbumActions } from "./AlbumStore";
import ArtistList from "../../components/ArtistList.vue";

export default defineComponent({
  components: { ArtistList },
  props: {
    id: { default: "", type: String }
  },
  setup(props) {
    const store = useStore<RootState>();
    const albumpage = ref();

    onBeforeRouteUpdate(to => {
      store.dispatch(`album/${AlbumActions.getAlbum}`, to.params.id);
      albumpage.value.scrollTop = 0;
    });

    store.dispatch(`album/${AlbumActions.getAlbum}`, props.id);

    return { albumpage, store, timecode };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";
@import "../../assets/scss/responsive";

.overflowed {
  scroll-behavior: smooth;
}

.album-header {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 2rem;
  font-weight: 100;
  margin-bottom: 5px;
}

.cover {
  width: 100%;
}

.track {
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
  display: flex;
  justify-content: space-between;

  &:hover {
    background-color: rgba($primary-color, 0.1);
  }

  &--active {
    background-color: rgba($primary-color, 0.2);
    color: $primary-color;

    &:hover {
      background-color: rgba($primary-color, 0.2);
      color: $primary-color;
    }
  }

  &__number {
    width: 30px;
    display: inline-block;
    font-style: italic;
    opacity: 0.5;
  }
}

.content {
  display: flex;
  justify-content: center;
  gap: 30px;

  &__cover {
    flex: 0 0 300px;
  }

  &__tracks {
    flex: 0.8;
    font-size: 1rem;
  }
}

.album-page {
  padding: 30px 40px;
}
</style>
