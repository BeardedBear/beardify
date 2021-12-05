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
        <Album
          v-for="(album, index) in searchStore.albums"
          :key="index"
          :currently-played-id="playerStore.currentlyPlaying.item?.album.uri"
          :album="album"
          with-artists
          without-release-date
          @click="reset()"
        />
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
            <div class="track-name">{{ track.name }}</div>
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
import Album from "../Album.vue";
import { usePlayer } from "../player/PlayerStore";

const playerStore = usePlayer();
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
@use "sass:color";
@import "../../assets/scss/colors";

$radius: 0.3rem;

.input {
  background-color: var(--bg-color-light);
  border: 0;
  border-radius: $radius;
  color: currentColor;
  font-weight: 700;
  outline: 0;
  padding: 0.6rem 1rem;
  width: 100%;

  &.opened {
    border-radius: $radius $radius 0 0;
  }

  &::placeholder {
    color: color.change(rgb(74 75 103), $alpha: 0.4);
    font-style: italic;
  }
}

.track {
  align-items: center;
  border-radius: $radius;
  cursor: pointer;
  display: flex;
  gap: 0.8rem;
  padding: 0.8rem;

  &__icon {
    font-size: 1.5rem;
    opacity: 0.1;
  }

  &-name {
    font-size: 1rem;
    font-weight: bold;
  }

  &:hover {
    background-color: var(--bg-color-light);
  }
}

.album-list {
  align-content: start;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr 1fr 1fr;

  // padding-top: 1rem;
}

.artist {
  border-radius: $radius;
  color: currentColor;
  padding: 0.8rem 0.4rem;
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
    $size: 2.5rem;

    border-radius: $size;
    display: inline-block;
    height: $size;
    margin-bottom: 0.4rem;
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
  right: 0.8rem;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
  width: 2.2rem;
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
  gap: 3rem;
  grid-template-columns: 0.8fr 1fr 1fr;
  justify-content: space-evenly;
  left: 0;
  padding: 1rem;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 1;
}
</style>
