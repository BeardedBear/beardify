<template>
  <div class="artist-page">
    <div class="title">
      {{ store.state.artist.artist.name }}
    </div>
    <div class="content">
      <div>
        <div class="heading">Albums</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat fuga, facilis, adipisci cum sed eum ad cumque
        dignissimos eos consequuntur nemo, aliquid necessitatibus dolorum sit nihil autem asperiores totam expedita.
      </div>
      <TopTracks class="top" />
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

export default defineComponent({
  components: { TopTracks },
  props: {
    id: { default: "", type: String }
  },
  setup(props) {
    const store = useStore<RootState>();

    onBeforeRouteUpdate(to => {
      store.dispatch(`artist/${ArtistActions.getArtist}`, to.params.id);
      store.dispatch(`artist/${ArtistActions.getTopTracks}`, to.params.id);
    });

    store.dispatch(`artist/${ArtistActions.getArtist}`, props.id);
    store.dispatch(`artist/${ArtistActions.getTopTracks}`, props.id);

    onMounted(() => {
      console.log("mounted");
    });

    return { store, timecode };
  }
});
</script>

<style lang="scss" scoped>
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
}
</style>
