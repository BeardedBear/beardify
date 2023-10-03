<template>
  <span v-for="(artist, index) in artistList" :key="index">
    <span class="artist" :class="{ feat }" @click.stop="goArtist(`/artist/${artist.uri.split(':').pop()}`)">
      <span>{{ artist.name }}</span>
      <span class="options"><ArtistLinks :artist-name="artist.name" floating /></span>
    </span>
    <span v-if="artistList && artistList.length - 1 !== index" class="separator">
      / <span v-if="!feat">&nbsp;</span>
    </span>
  </span>
</template>

<script lang="ts" setup>
import { Artist, ArtistSimplified } from "../../@types/Artist";
import router from "../../router";
import { useDialog } from "../dialog/DialogStore";
import ArtistLinks from "./ArtistLinks.vue";

const dialogStore = useDialog();

defineProps<{
  artistList:
    | Artist[]
    | ArtistSimplified[]
    | {
        name: string;
        uri: string;
      }[]
    | undefined;
  feat?: boolean;
}>();

function goArtist(artistUri: string): void {
  router.push(artistUri);
  if (dialogStore.show) dialogStore.close();
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors";

.separator {
  opacity: 0.2;
}

@keyframes pop-options {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(1rem);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.options {
  animation: pop-options 0.2s ease 0.75s both;
  background-color: var(--bg-color-lighter);
  border-radius: 5px;
  bottom: 100%;
  display: none;
  left: 50%;
  padding: 0.5rem;
  position: absolute;
  transform: translateX(-50%);
  z-index: 1;
}

.artist {
  color: currentcolor;
  cursor: pointer;
  position: relative;
  text-decoration: none;

  &.feat {
    font-size: 0.9rem;
    font-style: italic;
    opacity: 0.5;
  }

  &:hover {
    color: var(--primary-color);
    opacity: 1;

    .options {
      display: block;
    }
  }
}
</style>
