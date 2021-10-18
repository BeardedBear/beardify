<template>
  <div class="search">
    <div>
      <input
        v-model="query"
        class="input"
        :class="{ opened: query }"
        type="text"
        placeholder="Recherche..."
        @input="searchStore.search(query)"
      />
    </div>
    <button v-if="query" class="reset" @click="reset()">
      <i class="icon-x" />
    </button>
    <div v-if="query" ref="result" class="results">
      <!-- Artist List -->
      <div class="artist-list">
        <router-link
          v-for="(artist, index) in searchStore.artists"
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
          v-for="(album, index) in searchStore.albums"
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
          v-for="(track, index) in searchStore.tracks"
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

<script lang="ts" setup>
import { ref } from "vue";
import { playSong } from "../../helpers/play";
import { useSearch } from "./SearchStore";
import Cover from "../Cover.vue";
import { onClickOutside } from "@vueuse/core";
import ArtistList from "../../components/ArtistList.vue";

const searchStore = useSearch();
const query = ref<string>("");
const result = ref(null);

function reset(): void {
  query.value = "";
}
onClickOutside(result, () => reset());

document.addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
  if (keyboardEvent.key === "Escape") query.value = "";
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

$radius: 4px;

.input {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: $radius;
  color: currentColor;
  font-weight: 700;
  outline: 0;
  padding: 10px 15px;
  width: 100%;

  &.opened {
    border-radius: $radius $radius 0 0;
  }

  &::placeholder {
    color: rgba(rgb(74, 81, 103), 0.4);
    font-style: italic;
  }
}

.track {
  align-items: center;
  border-radius: $radius;
  cursor: pointer;
  display: flex;
  gap: 10px;
  padding: 10px;

  &__icon {
    font-size: 2.5rem;
    opacity: 0.1;
  }

  &:hover {
    background-color: var(--bg-color-light);
  }
}

.album {
  align-items: center;
  border-radius: $radius;
  color: currentColor;
  display: flex;
  gap: 10px;
  padding: 10px;
  text-decoration: none;

  .cover {
    $size: 40px;
    border-radius: 3px;
    height: $size;
    width: $size;
  }

  &:hover {
    background-color: var(--bg-color-light);
  }
}

.artist {
  border-radius: $radius;
  color: currentColor;
  padding: 10px 5px;
  text-align: center;
  text-decoration: none;

  &:hover {
    background-color: var(--bg-color-light);
  }

  &-list {
    align-content: flex-start;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
  }

  .avatar {
    $size: 35px;
    border-radius: $size;
    display: inline-block;
    height: $size;
    margin-bottom: 5px;
    width: $size;
  }
}

.reset {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: $radius;
  color: currentColor;
  cursor: pointer;
  font-size: 1rem;
  position: absolute;
  right: 10px;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
}
.search {
  flex: 1;
  position: relative;
}
.results {
  background-color: var(--bg-color-lighter);
  border-radius: 0 0 $radius $radius;
  display: grid;
  font-size: 0.8rem;
  gap: 10px;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-evenly;
  left: 0;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 1;

  > div {
    padding: 10px;
  }
}
</style>
