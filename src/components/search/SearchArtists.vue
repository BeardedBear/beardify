<template>
  <div class="artist-list">
    <template v-if="searchStore.artists.length">
      <router-link
        v-for="(artist, index) in searchStore.artists"
        :key="index"
        :to="`/artist/${artist.id}`"
        class="artist"
        @click="searchStore.reset()"
      >
        <Cover size="small" :images="artist.images" class-name="avatar" />
        <div>{{ artist.name }}</div>
      </router-link>
    </template>
    <template v-else>Aucun artiste trouvé</template>
  </div>
</template>

<script lang="ts" setup>
import Cover from "../Cover.vue";
import { useSearch } from "./SearchStore";

const searchStore = useSearch();
</script>

<style lang="scss" scoped>
@use "sass:color";
@import "../../assets/scss/colors";

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
    border-radius: 0.3rem;
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
</style>
