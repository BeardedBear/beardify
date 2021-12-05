<template>
  <div ref="domHeader" class="header">
    <div class="inner">
      <div>
        <div class="title">
          <div class="name">{{ artistStore.artist.name }}</div>
        </div>
      </div>
      <Options />
    </div>
    <div class="genres">
      <span v-for="(genre, index) in artistStore.artist.genres.splice(0, 8)" :key="index" class="genre">
        {{ genre }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useArtist } from "./ArtistStore";
import Options from "./ArtistOptions.vue";
import { ref, onMounted } from "vue";

const domHeader = ref<HTMLDivElement | null>(null);
const artistStore = useArtist();

onMounted(() => {
  if (domHeader.value) artistStore.updateHeaderHeight(domHeader.value?.getBoundingClientRect().height);
  console.log(domHeader.value?.getBoundingClientRect().height);
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.genres {
  display: flex;
  gap: 5px;
  opacity: 0.3;

  .genre {
    background-color: var(--bg-color-lighter);
    border-radius: 30px;
    color: currentColor;
    font-size: 0.8rem;
    padding: 2px 7px;
  }
}

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.name {
  font-size: 2rem;
  font-weight: bold;
  transition: font-size ease 0.2s;

  &.scrolled {
    font-size: 1.6rem;
  }
}

.header {
  background-color: var(--bg-color-darker);
  padding: 10px 40px;
  position: sticky;
  top: 0;
  transition: transform ease 0.1s;
  z-index: 3;
}

.inner {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
</style>
