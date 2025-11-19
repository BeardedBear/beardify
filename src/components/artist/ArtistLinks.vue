<template>
  <div :class="{ floating }" class="links">
    <ButtonIndex @click.stop.prevent="frameStore.open(link.wikipedia, 'Wikipedia')" variant="nude">
      <i class="icon-wikipedia" />
    </ButtonIndex>
    <ButtonIndex @click.stop.prevent="frameStore.open(link.sputnik, 'Sputnik')" variant="nude">
      <i class="icon-sputnik" />
    </ButtonIndex>
    <ButtonIndex @click.stop.prevent="frameStore.open(link.google, 'Google')" variant="nude">
      <i class="icon-google" />
    </ButtonIndex>
    <span class="separator">|</span>
    <ButtonIndex icon-only @click.stop.prevent="openLink(link.lastfm)" variant="nude">
      <i class="icon-lastfm" />
    </ButtonIndex>
    <ButtonIndex icon-only @click.stop.prevent="openLink(link.discogs)" variant="nude">
      <i class="icon-discogs" />
    </ButtonIndex>
    <ButtonIndex icon-only @click.stop.prevent="openLink(link.rym)" variant="nude">
      <i class="icon-rym" />
    </ButtonIndex>
    <ButtonIndex icon-only @click.stop.prevent="openLink(link.youtube)" variant="nude">
      <i class="icon-youtube" />
    </ButtonIndex>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUpdated, ref } from "vue";

import { normalizeDiacritics } from "@/helpers/normalizeDiacritics";
import ButtonIndex from "@/components/ui/ButtonIndex.vue";
import { useFrame } from "@/components/frame/FrameStore";

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
.links {
  align-items: center;
  display: flex;

  // gap: 0.5rem;
  position: relative;

  .separator {
    color: rgb(125 125 125 / 50%);
  }
}
</style>
