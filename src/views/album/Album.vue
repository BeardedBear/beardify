<template>
  <div ref="albumpage" class="overflowed">
    <div class="album-page overflowed__target">
      <div class="album-header">
        <div class="title">{{ store.state.album.album.name }}</div>
        <div>Lorem ipsum dolor sit amet consectetur</div>
      </div>
      <div class="content">
        <!-- <div class="content__cover" v-if="store.state.album.album.images[0].url">
          <img class="cover" :src="store.state.album.album.images[0].url" alt="" />
        </div> -->
        <div class="content__tracks">
          <div v-for="(track, _, index) in store.state.album.album.tracks.items" :key="index">
            {{ track.track_number }}. {{ track.name }}
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

export default defineComponent({
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
  margin-bottom: 40px;
}

.title {
  font-size: 2rem;
  font-weight: 100;
}

.cover {
  width: 100%;
}

.content {
  display: flex;

  &__cover {
    flex: 0 0 300px;
  }
}

.album-page {
  padding: 30px 40px;
}
</style>
