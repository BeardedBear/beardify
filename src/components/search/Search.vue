<template>
  <div class="search">
    <input type="text" v-model="query" @input="search(query)" />

    <button @click="search(query)">{{ query }}</button>
    <div class="results" v-if="query">
      <div>
        <div v-for="(artist, index) in store.state.search.artists" :key="index">
          {{ artist.name }}
        </div>
      </div>
      <div>
        <div v-for="(album, index) in store.state.search.albums" :key="index">
          {{ album.name }}
        </div>
      </div>
      <div>
        <div v-for="(track, index) in store.state.search.tracks" :key="index">
          {{ track.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/rootStore";
import { SearchActions } from "./SearchStore";

export default defineComponent({
  setup() {
    const store = useStore<RootState>();
    const query = ref("");

    function search(q: string) {
      store.dispatch(`search/${SearchActions.search}`, q);
    }
    return { store, search, query };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.search {
  position: relative;
  flex: 1;
}
.results {
  background-color: $primary-color-dark;
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 1;
  max-height: 300px;
  display: flex;

  > div {
    flex: 1;
  }
}
</style>
