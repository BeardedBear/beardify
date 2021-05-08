<template>
  <div class="search">
    <div>
      <input
        class="input"
        :class="{ active: query }"
        type="text"
        v-model="query"
        @input="search(query)"
        placeholder="Recherche..."
      />
    </div>
    <button class="reset" @click="reset()">Effacer</button>
    <div class="results" v-if="query">
      <div class="artist-list">
        <router-link
          :to="`/artist/${artist.id}`"
          @click="reset()"
          class="artist"
          v-for="(artist, index) in store.state.search.artists"
          :key="index"
        >
          <img class="avatar" v-if="artist.images.length" :src="artist.images[artist.images.length - 1].url" />
          <img class="avatar" v-else src="/img/default.png" />
          <div>{{ artist.name }}</div>
        </router-link>
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

    function reset() {
      query.value = "";
    }

    return { store, search, query, reset };
  }
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

$radius: 4px;

.input {
  width: 100%;
  background-color: rgba($bg-color-light, 0.5);
  border: 0;
  padding: 10px 15px;
  outline: 0;
  border-radius: $radius;
  color: currentColor;
  font-weight: 700;

  &::placeholder {
    font-style: italic;
    color: rgba(rgb(162, 186, 218), 0.2);
  }

  &.active {
    border-radius: $radius $radius 0 0;
  }
}

.artist {
  text-align: center;
  padding: 10px;
  border-radius: $radius;
  text-decoration: none;
  color: currentColor;
  font-size: 0.8rem;

  &:hover {
    background-color: $bg-color-lighter;
  }

  &-list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-content: flex-start;
  }

  .avatar {
    $size: 45px;
    height: $size;
    width: $size;
    border-radius: $size;
    display: inline-block;
    margin-bottom: 5px;
  }
}

.reset {
  position: absolute;
  top: 0;
  right: 0;
}
.search {
  position: relative;
  flex: 1;
}
.results {
  background-color: $bg-color-light;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-evenly;
  gap: 30px;
  border-radius: 0 0 $radius $radius;

  > div {
    padding: 10px;
  }
}
</style>
