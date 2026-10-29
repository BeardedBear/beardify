<template>
  <span v-for="(artist, index) in artistList" :key="index">
    <!--
      Top layer, not an absolute card: the ellipsis' overflow: hidden of album
      cards clipped it. `bare` keeps the name inline so that ellipsis still works.
    -->
    <BdTooltip bare :delay="750" interactive>
      <!-- Not a <router-link>: role and Enter make it reachable anyway -->
      <span
        :class="{ feat }"
        class="artist"
        role="link"
        tabindex="0"
        @click.stop="goArtist(`/artist/${artist.uri.split(':').pop()}`)"
        @keydown.enter.self="goArtist(`/artist/${artist.uri.split(':').pop()}`)"
      >
        {{ artist.name }}
      </span>
      <template #content><ArtistLinks :artist-name="artist.name" floating /></template>
    </BdTooltip>
    <span v-if="artistList && artistList.length - 1 !== index" class="separator">
      /
      <span v-if="!feat">&nbsp;</span>
    </span>
  </span>
</template>

<script lang="ts" setup>
import { BdTooltip } from "bearded-ui";

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
  color: var(--bd-font-color-dark);
}

.artist {
  color: currentcolor;
  cursor: pointer;
  text-decoration: none;

  &.feat {
    color: var(--bd-font-color-dark);
    font-size: var(--bd-font-size-sm);
    font-style: var(--bd-style-italic-fallback);
    font-variation-settings: var(--bd-font-variation-settings-italic);
  }

  &:hover,
  &:focus-within {
    color: var(--bd-primary);
    opacity: 1;
  }
}
</style>
