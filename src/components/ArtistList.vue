<template>
  <span v-for="(artist, index) in artistList" :key="index">
    <span class="artist" :class="{ feat }" @click.stop="goArtist(`/artist/${artist.uri.split(':').pop()}`)">
      {{ artist.name }}
    </span>
    <span v-if="artistList.length - 1 !== index" class="separator"> /<span v-if="!feat">&nbsp;</span></span>
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Artist, ArtistSimplified } from "../@types/Artist";
import router from "../router";

export default defineComponent({
  props: {
    artistList: {
      default: () => [],
      type: Array as PropType<Artist[] | ArtistSimplified[]>,
    },
    feat: {
      default: false,
      type: Boolean as PropType<boolean>,
    },
  },
  setup() {
    function goArtist(artistUri: string): void {
      router.push(artistUri);
    }
    return { goArtist };
  },
});
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.separator {
  opacity: 0.2;
}
.artist {
  text-decoration: none;
  color: currentColor;
  cursor: pointer;

  &.feat {
    font-style: italic;
    font-size: 0.8rem;
    opacity: 0.5;
  }

  &:hover {
    color: var(--primary-color);
    opacity: 1;
  }
}
</style>
