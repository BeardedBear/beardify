<template>
  <div class="search">
    <div>
      <input
        ref="input"
        v-model="query"
        class="input"
        :class="{ opened: query }"
        type="text"
        placeholder="Recherche..."
        @input="searchStore.updateQuery(query)"
      />
    </div>
    <button v-if="query" class="reset" @click="reset()"><i class="icon-x" /></button>
    <div v-if="query" ref="result" class="results">
      <!-- Artist List -->
      <div class="artist-list">
        <template v-if="searchStore.artists.length">
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
        </template>
        <template v-else>Aucun artiste trouvé</template>
      </div>
      <!-- Album List -->
      <div class="album-list">
        <template v-if="searchStore.albums.length">
          <Album
            v-for="(album, index) in searchStore.albums"
            :key="index"
            :currently-played-id="playerStore.currentlyPlaying.item?.album.uri"
            :album="album"
            with-artists
            without-release-date
            @click="reset()"
          />
        </template>
        <template v-else>Aucun album trouvé</template>
      </div>
      <!-- Track List -->
      <div>
        <template v-if="searchStore.albums.length">
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
        </template>
        <template v-else>Aucun morceau trouvé</template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { playSong } from "../../helpers/play";
import { useSearch } from "./SearchStore";
import Cover from "../Cover.vue";
import ArtistList from "../../components/ArtistList.vue";
import Album from "../Album.vue";
import { usePlayer } from "../player/PlayerStore";
import { useDialog } from "../dialog/DialogStore";

const playerStore = usePlayer();
const searchStore = useSearch();
const dialogStore = useDialog();
const query = ref<string>("");
const result = ref<HTMLDivElement | null>(null);
const input = ref<HTMLInputElement | null>(null);

onMounted(() => input.value && input.value.focus());

function reset(): void {
  query.value = "";
  dialogStore.close();
}

document.addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
  if (keyboardEvent.key === "Escape") reset();
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

.artist-list {
  .avatar {
    $size: 2.5rem;

    border-radius: $size;
    display: block;
    height: $size;
    width: $size;
  }

  .artist {
    align-items: center;
    border-radius: $radius;
    color: currentColor;
    display: flex;
    font-size: 1rem;
    font-weight: bold;
    gap: 1rem;
    margin-bottom: 0.4rem;
    padding: 0.5rem;
    text-decoration: none;

    &:hover {
      background-color: var(--bg-color-light);
    }
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
  top: 1rem;
  transform: translateY(-50%);
  width: 2.2rem;
}

.search {
  flex: 1;
  position: relative;
}

.results {
  // background-color: var(--bg-color-lighter);
  // border-radius: 0 0 $radius $radius;
  display: grid;
  font-size: 0.8rem;
  gap: 3rem;
  grid-template-columns: 0.6fr 1fr 0.8fr;
  justify-content: space-evenly;
  left: 0;
  padding: 1rem;

  // position: absolute;
  right: 0;
  top: 100%;
  z-index: 999;
}
</style>
