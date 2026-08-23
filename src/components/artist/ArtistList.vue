<template>
  <span v-for="(artist, index) in artistList" :key="index">
    <span :class="{ feat }" class="artist" @click.stop="goArtist(`/artist/${artist.uri.split(':').pop()}`)">
      <span>{{ artist.name }}</span>
      <span class="options">
        <ArtistLinks :artist-name="artist.name" floating />
      </span>
    </span>
    <span v-if="artistList && artistList.length - 1 !== index" class="separator">
      /
      <span v-if="!feat">&nbsp;</span>
    </span>
  </span>
</template>

<script lang="ts" setup>
import { Artist, ArtistSimplified } from "@/@types/Artist";
import ArtistLinks from "@/components/artist/ArtistLinks.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { usePlayer } from "@/components/player/PlayerStore";
import router from "@/router";

const dialogStore = useDialog();

defineProps<{
  artistList:
    | {
      name: string;
      uri: string;
    }[]
    | Artist[]
    | ArtistSimplified[]
    | undefined;
  feat?: boolean;
}>();

function goArtist(artistUri: string): void {
  router.push(artistUri);
  if (dialogStore.show) dialogStore.close();
  usePlayer().closePanel();
}
</script>

<style scoped>

.separator {
  color: var(--font-color-dark);
}

@keyframes pop-options {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-1rem);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.options {
  --options-gap: 0.5rem;

  animation: pop-options 0.2s ease 0.75s both;
  background-color: var(--bg-color-light);
  border-radius: 5px;
  bottom: calc(100% + var(--options-gap));
  box-shadow: 0 0.5rem 0.5rem rgb(0 0 0 / 20%);
  display: none;
  left: 50%;
  padding: 0.2rem;
  position: absolute;
  transform: translateX(-50%);
  z-index: 99;

  &::after {
    content: "";
    height: var(--options-gap);
    left: 0;
    position: absolute;
    right: 0;
    top: 100%;
  }
}

.artist {
  color: currentcolor;
  cursor: pointer;
  position: relative;
  text-decoration: none;

  &.feat {
    color: var(--font-color-dark);
    font-size: var(--font-size-sm);
    font-style: var(--font-style-italic);
    font-variation-settings: var(--font-variation-settings-italic);
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
