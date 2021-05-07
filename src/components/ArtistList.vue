<template>
  <span v-for="(artist, _, index) in artistList" :key="index">
    <router-link class="artist" :class="{ feat }" :to="`/artist/${artist.uri.split(':').pop()}`">{{
      artist.name
    }}</router-link>
    <span v-if="artistList.length === index">,</span>
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { useStore } from "vuex";
import type { RootState } from "../@types/rootStore";
import { Artist, ArtistSimplified } from "../@types/Artist";

export default defineComponent({
  props: {
    artistList: {
      default: [],
      type: Array as PropType<Artist[] | ArtistSimplified[]>
    },
    feat : {
      default : false,
      type : Boolean as PropType<boolean>
    }
  },
  setup() {
    const store = useStore<RootState>();
    return { store }

  }
})
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";
.artist {
  text-decoration: none;
  color: currentColor;

  &.feat {
    font-style: italic;
    font-size: 0.8rem;
    opacity: 0.5;
  }

  &:hover {
    color: $primary-color;
    opacity: 1;
  }
}
</style>
