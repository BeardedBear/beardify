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
    <button v-if="query" class="reset" @click="searchStore.reset()"><i class="icon-x" /></button>
    <div v-if="query" ref="result" class="results">
      <SearchArtists />
      <SearchAlbums />
      <SearchSongs />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useSearch } from "./SearchStore";
import SearchArtists from "./SearchArtists.vue";
import SearchAlbums from "./SearchAlbums.vue";
import SearchSongs from "./SearchSongs.vue";

const searchStore = useSearch();
const query = ref<string>("");
const result = ref<HTMLDivElement | null>(null);
const input = ref<HTMLInputElement | null>(null);

onMounted(() => input.value && input.value.focus());

document.addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
  if (keyboardEvent.key === "Escape") searchStore.reset();
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
  display: grid;
  font-size: 0.8rem;
  gap: 3rem;
  grid-template-columns: 0.6fr 1fr 0.8fr;
  justify-content: space-evenly;
  left: 0;
  padding: 1rem;
  right: 0;
  top: 100%;
  z-index: 999;
}
</style>
