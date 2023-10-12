<template>
  <div class="links" :class="{ floating }">
    <a class="item" @click.stop.prevent="openFrame(link.wikipedia)"><i class="icon-wikipedia" /></a>
    <a class="item" @click.stop.prevent="openFrame(link.sputnik)"><i class="icon-sputnik" /></a>
    <a class="item" @click.stop.prevent="openFrame(link.google)"><i class="icon-google" /></a>
    <span class="separator">|</span>
    <a class="item" @click.stop.prevent="openLink(link.lastfm)"><i class="icon-lastfm" /></a>
    <a class="item" @click.stop.prevent="openLink(link.discogs)"><i class="icon-discogs" /></a>
    <a class="item" @click.stop.prevent="openLink(link.rym)"><i class="icon-rym" /></a>
    <a class="item" @click.stop.prevent="openLink(link.youtube)"><i class="icon-youtube" /></a>
  </div>
</template>

<script lang="ts" setup>
import { normalize } from "normalize-diacritics";
import { onMounted, onUpdated, ref } from "vue";
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

function openFrame(url: string): void {
  frameStore.open(url);
}

async function updateLinks(): Promise<void> {
  artistNameNormalized.value = (await normalize(props.artistName))
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("&", "and");
  link.value = {
    wikipedia: `https://en.wikipedia.org/wiki/${artistNameNormalized.value}`,
    sputnik: `https://www.sputnikmusic.com/search_results.php?genreid=0&search_in=Bands&search_text=${artistNameNormalized.value}&amp;x=0&amp;y=0`,
    google: `https://www.google.com/search?q=${artistNameNormalized.value}&igu=1`,
    lastfm: `https://www.last.fm/music/${artistNameNormalized.value}`,
    discogs: `https://www.discogs.com/artist/${artistNameNormalized.value}`,
    rym: `https://rateyourmusic.com/search?searchtype=a&searchterm=${artistNameNormalized.value}`,
    youtube: `https://www.youtube.com/results?search_query=${artistNameNormalized.value}`,
  };
}

onMounted(async () => updateLinks());
onUpdated(async () => updateLinks());
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
