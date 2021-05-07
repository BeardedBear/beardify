<template>
  <div ref="albumpage" class="overflowed">
    <div class="album-page overflowed__target">
      {{ id }}
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Suscipit officia ut distinctio maiores molestias ipsam
      adipisci sit accusamus. In aspernatur quisquam nostrum nam facere similique sunt inventore autem, tempora id?
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
      store.dispatch(`artist/${AlbumActions.getAlbum}`, to.params.id);

      albumpage.value.scrollTop = 0;
    });

    store.dispatch(`artist/${AlbumActions.getAlbum}`, props.id);

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
.albums {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;

  @include tablet {
    grid-template-columns: 1fr 1fr;
  }
}
.singles {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
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
