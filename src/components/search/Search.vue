<template>
  <div class="search">
    <div>
      <input
        v-model="query"
        class="input"
        :class="{ opened: query }"
        type="text"
        placeholder="Recherche..."
        @input="search(query)"
      />
    </div>
    <button v-if="query" class="reset" @click="reset()">
      <i class="icon-x" />
    </button>
    <div v-if="query" class="results">
      <!-- Artist List -->
      <div class="artist-list">
        <router-link
          v-for="(artist, index) in store.state.search.artists"
          :key="index"
          :to="`/artist/${artist.id}`"
          class="artist"
          @click="reset()"
        >
          <Cover size="small" :images="artist.images" class-name="avatar" />
          <div>{{ artist.name }}</div>
        </router-link>
      </div>
      <!-- Album List -->
      <div class="album-list">
        <router-link
          v-for="(album, index) in store.state.search.albums"
          :key="index"
          :to="`/album/${album.id}`"
          class="album"
          @click="reset()"
        >
          <Cover size="small" :images="album.images" class-name="cover" />
          <div>
            <div>{{ album.name }}</div>
            <div>
              <ArtistList :artist-list="album.artists" feat />
            </div>
          </div>
        </router-link>
      </div>
      <!-- Track List -->
      <div>
        <div
          v-for="(track, index) in store.state.search.tracks"
          :key="index"
          class="track"
          @click="
            () => {
              playSong(track.uri);
              reset();
            }
          "
        >
          <i class="track__icon icon-music" />
          <div>
            <div>{{ track.name }}</div>
            <div>
              <ArtistList :artist-list="track.artists" feat />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { RootState } from "../../@types/RootState";
import { SearchActions } from "./SearchStore";
import ArtistList from "../../components/ArtistList.vue";
import { playSong } from "../../helpers/play";
import Cover from "../Cover.vue";

export default defineComponent({
  components: { ArtistList, Cover },
  setup() {
    const store = useStore<RootState>();
    const query = ref("");

    function search(q: string) {
      store.dispatch(`search/${SearchActions.search}`, q);
    }

    function reset() {
      query.value = "";
    }

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") query.value = "";
    });

    return { store, search, query, reset, playSong };
  },
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

$radius: 4px;

.input {
  width: 100%;
  background-color: var(--bg-color-light);
  border: 0;
  padding: 10px 15px;
  outline: 0;
  border-radius: $radius;
  color: currentColor;
  font-weight: 700;

  &.opened {
    border-radius: $radius $radius 0 0;
  }

  &::placeholder {
    font-style: italic;
    color: rgba(rgb(74, 81, 103), 0.4);
  }
}

.track {
  display: flex;
  gap: 10px;
  border-radius: $radius;
  padding: 10px;
  cursor: pointer;
  align-items: center;

  &__icon {
    font-size: 2.5rem;
    opacity: 0.1;
  }

  &:hover {
    background-color: var(--bg-color-light);
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
    background-color: var(--bg-color-light);
  }
}

.artist {
  text-align: center;
  padding: 10px 5px;
  border-radius: $radius;
  text-decoration: none;
  color: currentColor;

  &:hover {
    background-color: var(--bg-color-light);
  }

  &-list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
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
  background-color: var(--bg-color-light);
  color: currentColor;
  text-align: center;
  width: 40px;
}
.search {
  position: relative;
  flex: 1;
}
.results {
  background-color: var(--bg-color-lighter);
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
