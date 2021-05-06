<template>
  <div class="artist-page">
    <div class="title">
      {{ store.state.artist.artist.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useStore } from "vuex";
import { RootState } from "../../@types/rootStore";
import { ArtistActions } from "./ArtistStore";

export default defineComponent({
  props: {
    id: { default: "", type: String }
  },
  setup(props) {
    const store = useStore<RootState>();

    onBeforeRouteUpdate(to => {
      store.dispatch(`artist/${ArtistActions.getArtist}`, to.params.id);
    });

    store.dispatch(`artist/${ArtistActions.getArtist}`, props.id);

    onMounted(() => {
      console.log("mounted");
    });

    return { store };
  }
});
</script>

<style lang="scss" scoped>
.artist-page {
  padding: 30px 40px;
}
.title {
  font-size: 2rem;
  font-weight: 300;
}
</style>
