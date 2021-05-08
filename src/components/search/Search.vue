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
    <button v-if="query" class="reset" @click="reset()"><i class="icon-x"></i></button>
    <div class="results" v-if="query">
      <!-- Artist List -->
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
      <!-- Album List -->
      <div class="album-list">
        <router-link
          :to="`/album/${album.id}`"
          v-for="(album, index) in store.state.search.albums"
          :key="index"
          @click="reset()"
          class="album"
        >
          <img class="cover" v-if="album.images.length" :src="album.images[album.images.length - 1].url" />
          <img class="cover" v-else src="/img/default.png" />
          <div class>
            <div>{{ album.name }}</div>
            <div><ArtistList :artistList="album.artists" feat /></div>
          </div>
        </router-link>
      </div>
      <!-- Track List -->
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
import ArtistList from "../../components/ArtistList.vue";

export default defineComponent({
  components: { ArtistList },
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

.album {
  display: flex;
  padding: 10px;
  border-radius: $radius;
  gap: 10px;
  color: currentColor;
  text-decoration: none;
  align-items: center;

  .cover {
    $size: 40px;
    height: $size;
    width: $size;
    border-radius: 3px;
  }

  &:hover {
    background-color: $bg-color-lighter;
  }
}

.artist {
  text-align: center;
  padding: 10px 5px;
  border-radius: $radius;
  text-decoration: none;
  color: currentColor;

  &:hover {
    background-color: $bg-color-lighter;
  }

  &-list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-content: flex-start;
  }

  .avatar {
    $size: 35px;
    height: $size;
    width: $size;
    border-radius: $size;
    display: inline-block;
    margin-bottom: 5px;
  }
}

.reset {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  font-size: 1rem;
  cursor: pointer;
  border-radius: $radius;
  border: 0;
  background-color: $bg-color-lighter;
  color: currentColor;
  text-align: center;
  width: 40px;
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
  gap: 10px;
  border-radius: 0 0 $radius $radius;
  font-size: 0.8rem;

  > div {
    padding: 10px;
  }
}
</style>
