<template>
  <div :class="{ floating }" class="links">
    <a @click.stop.prevent="frameStore.open(link.wikipedia, 'Wikipedia')" class="item"><i class="icon-wikipedia" /></a>
    <a @click.stop.prevent="frameStore.open(link.sputnik, 'Sputnik')" class="item"><i class="icon-sputnik" /></a>
    <a @click.stop.prevent="frameStore.open(link.google, 'Google')" class="item"><i class="icon-google" /></a>
    <span class="separator">|</span>
    <a @click.stop.prevent="openLink(link.lastfm)" class="item"><i class="icon-lastfm" /></a>
    <a @click.stop.prevent="openLink(link.discogs)" class="item"><i class="icon-discogs" /></a>
    <a @click.stop.prevent="openLink(link.rym)" class="item"><i class="icon-rym" /></a>
    <a @click.stop.prevent="openLink(link.youtube)" class="item"><i class="icon-youtube" /></a>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUpdated, ref } from "vue";

import { normalizeDiacritics } from "../../helpers/normalizeDiacritics";
import { useFrame } from "../frame/FrameStore";

const props = defineProps<{
  artistName: string;
  floating?: boolean;
}>();

const frameStore = useFrame();
const link = ref<Record<string, string>>({});
const artistNameNormalized = ref<string>("");

function openLink(url: string): void {
  window.open(url, "_blank");
}

function updateLinks(): void {
  artistNameNormalized.value = normalizeDiacritics(props.artistName).replaceAll("&", "and");
  link.value = {
    discogs: `https://www.discogs.com/artist/${artistNameNormalized.value}`,
    google: `https://www.google.com/search?q=${artistNameNormalized.value}&igu=1`,
    lastfm: `https://www.last.fm/music/${artistNameNormalized.value}`,
    rym: `https://rateyourmusic.com/search?searchtype=a&searchterm=${artistNameNormalized.value}`,
    sputnik: `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${artistNameNormalized.value}&amp;x=0&amp;y=0`,
    wikipedia: `https://en.wikipedia.org/wiki/${artistNameNormalized.value}`,
    youtube: `https://www.youtube.com/results?search_query=${artistNameNormalized.value}`,
  };
}

onMounted(() => updateLinks());
onUpdated(() => updateLinks());
</script>

<style lang="scss" scoped>
.item {
  align-items: center;
  color: currentcolor;
  cursor: pointer;
  display: flex;
  font-size: 1rem;
  opacity: 0.3;
  text-decoration: none;

  &:hover {
    opacity: 1;
  }
}

.links {
  align-items: center;
  display: flex;
  gap: 0.7rem;
  position: relative;

  .separator {
    color: rgb(125 125 125 / 50%);
  }

  &.floating {
    gap: 0;

    .item {
      color: var(--font-color-light);
      font-size: 1rem;
      padding: 0.3rem;
    }
  }
}
</style>
