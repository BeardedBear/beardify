<template>
  <div ref="domHeader" class="header">
    <img class="img" :src="artistStore.artist.images[0].url" alt="" />
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
});
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.img {
  filter: blur(15px);
  inset: 0;
  opacity: 0.2;
  position: absolute;
  top: 50%;
  transform: translateY(-33%);
  width: 100%;
}

.genres {
  display: flex;
  gap: 0.4rem;
  opacity: 0.3;

  .genre {
    background-color: var(--bg-color-lighter);
    border-radius: 2rem;
    color: currentColor;
    font-size: 0.8rem;
    padding: 0 0.5rem 0.1rem;
  }
}

.title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.name {
  font-size: 2rem;
  font-weight: bold;

  &.scrolled {
    font-size: 1.6rem;
  }
}

.header {
  background-color: var(--bg-color-darker);
  overflow: hidden;
  padding: 1.2rem 2.5rem 0.7rem;
  position: sticky;
  top: 0;
  transition: transform ease 0.1s;
  z-index: 3;
}

.inner {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  position: relative;
  z-index: 1;
}
</style>
